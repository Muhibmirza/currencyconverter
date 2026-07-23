type ApiPayload = {
  data?: Record<string, unknown>;
  message?: string;
  error?: string;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function validateCurrency(value: string | null, field: string) {
  const code = value?.trim().toUpperCase() ?? '';
  if (!/^[A-Z]{3}$/.test(code)) {
    throw new Error(`${field} must be a valid currency code`);
  }
  return code;
}

function validateAmount(value: string | null) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('amount must be a number greater than 0');
  }
  return amount;
}

async function currencyRequest(path: string) {
  const apiKey = process.env.CURRENCY_API_KEY;
  const baseUrl = (
    process.env.CURRENCY_API_BASE_URL ??
    'https://api.freecurrencyapi.com/v1'
  ).replace(/\/$/, '');

  if (!apiKey || apiKey === 'your_key_here') {
    return json(
      {
        statusCode: 503,
        message: 'Currency API key is not configured on the server',
      },
      503,
    );
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { apikey: apiKey },
    });
    const payload = (await response.json()) as ApiPayload;

    if (!response.ok) {
      const message =
        response.status === 429
          ? 'Currency API rate limit exceeded. Please try again later.'
          : payload.message ?? payload.error ?? 'Currency service request failed';
      return json({ statusCode: response.status, message }, response.status);
    }

    return payload;
  } catch {
    return json(
      {
        statusCode: 502,
        message: 'Unable to reach the currency service. Please try again.',
      },
      502,
    );
  }
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const action = url.pathname.split('/').filter(Boolean).pop();

  if (request.method !== 'GET') {
    return json({ statusCode: 405, message: 'Method not allowed' }, 405);
  }

  if (action === 'status') {
    const response = await currencyRequest('/status');
    return response instanceof Response ? response : json(response);
  }

  if (action === 'list') {
    const response = await currencyRequest('/currencies');
    if (response instanceof Response) return response;

    const currencies = Object.entries(response.data ?? {})
      .map(([code, value]) => {
        const currency = value as { name?: string; symbol?: string };
        return {
          code,
          name: currency.name ?? code,
          symbol: currency.symbol ?? '',
        };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
    return json(currencies);
  }

  if (action !== 'convert' && action !== 'historical') {
    return json({ statusCode: 404, message: 'Not found' }, 404);
  }

  try {
    const from = validateCurrency(url.searchParams.get('from'), 'from');
    const to = validateCurrency(url.searchParams.get('to'), 'to');
    const amount = validateAmount(url.searchParams.get('amount'));
    const historical = action === 'historical';
    const date = historical
      ? (url.searchParams.get('date') ?? '')
      : new Date().toISOString().slice(0, 10);

    if (
      historical &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        new Date(`${date}T00:00:00Z`) >
          new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`))
    ) {
      return json(
        { statusCode: 400, message: 'date must be a valid date in the past' },
        400,
      );
    }

    const params = new URLSearchParams({
      base_currency: from,
      currencies: to,
    });
    if (historical) params.set('date', date);

    const endpoint = historical ? '/historical' : '/latest';
    const response = await currencyRequest(`${endpoint}?${params.toString()}`);
    if (response instanceof Response) return response;

    const data = response.data ?? {};
    const rate = historical
      ? (data[date] as Record<string, number> | undefined)?.[to]
      : (data[to] as number | undefined);

    if (typeof rate !== 'number') {
      return json(
        { statusCode: 502, message: `No rate returned for ${to}` },
        502,
      );
    }

    return json({
      from,
      to,
      amount,
      rate,
      result: amount * rate,
      date,
    });
  } catch (error) {
    return json(
      {
        statusCode: 400,
        message: error instanceof Error ? error.message : 'Invalid request',
      },
      400,
    );
  }
}
