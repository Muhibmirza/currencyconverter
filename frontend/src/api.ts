import type { Conversion, Currency } from './types';

const API_URL = import.meta.env.VITE_API_URL?.trim();

async function getJson<T>(path: string): Promise<T> {
  if (!API_URL) {
    throw new Error(
      'Backend URL is not configured. Add VITE_API_URL in the Vercel project settings and redeploy.',
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}${path}`);
  } catch {
    throw new Error('Cannot connect to the server. Please try again.');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'Something went wrong. Please try again.';
    throw new Error(message);
  }
  return body as T;
}

export const getCurrencies = () => getJson<Currency[]>('/currency/list');

export function getConversion(
  from: string,
  to: string,
  amount: number,
  historicalDate?: string,
) {
  const params = new URLSearchParams({
    from,
    to,
    amount: String(amount),
  });
  if (historicalDate) {
    params.set('date', historicalDate);
  }
  const endpoint = historicalDate ? 'historical' : 'convert';
  return getJson<Conversion>(`/currency/${endpoint}?${params.toString()}`);
}
