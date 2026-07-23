import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ApiResponse<T> = { data: T };
type CurrencyDetails = { code: string; name: string; symbol: string };

@Injectable()
export class CurrencyService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (
      this.config.get<string>('CURRENCY_API_BASE_URL') ??
      'https://api.freecurrencyapi.com/v1'
    ).replace(/\/$/, '');
    this.apiKey = this.config.get<string>('CURRENCY_API_KEY') ?? '';
  }

  async list(): Promise<CurrencyDetails[]> {
    const response =
      await this.request<ApiResponse<Record<string, CurrencyDetails>>>(
        '/currencies',
      );

    return Object.entries(response.data)
      .map(([code, currency]) => ({
        code,
        name: currency.name,
        symbol: currency.symbol,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  async convert(from: string, to: string, rawAmount: string) {
    const { source, target, amount } = this.validateConversion(
      from,
      to,
      rawAmount,
    );
    const params = new URLSearchParams({
      base_currency: source,
      currencies: target,
    });
    const response = await this.request<ApiResponse<Record<string, number>>>(
      `/latest?${params.toString()}`,
    );
    const rate = this.getRate(response.data[target], target);

    return {
      from: source,
      to: target,
      amount,
      rate,
      result: amount * rate,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  async historical(
    from: string,
    to: string,
    rawAmount: string,
    date: string,
  ) {
    const { source, target, amount } = this.validateConversion(
      from,
      to,
      rawAmount,
    );
    this.validateDate(date);

    const params = new URLSearchParams({
      date,
      base_currency: source,
      currencies: target,
    });
    const response = await this.request<
      ApiResponse<Record<string, Record<string, number>>>
    >(`/historical?${params.toString()}`);
    const rate = this.getRate(response.data[date]?.[target], target);

    return {
      from: source,
      to: target,
      amount,
      rate,
      result: amount * rate,
      date,
    };
  }

  status() {
    return this.request<unknown>('/status');
  }

  private validateConversion(from: string, to: string, rawAmount: string) {
    const source = from?.trim().toUpperCase();
    const target = to?.trim().toUpperCase();
    const amount = Number(rawAmount);

    if (!/^[A-Z]{3}$/.test(source) || !/^[A-Z]{3}$/.test(target)) {
      throw new BadRequestException('from and to must be valid currency codes');
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a number greater than 0');
    }

    return { source, target, amount };
  }

  private validateDate(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date must use YYYY-MM-DD format');
    }
    const parsed = new Date(`${date}T00:00:00Z`);
    const today = new Date(new Date().toISOString().slice(0, 10));
    if (Number.isNaN(parsed.getTime()) || parsed > today) {
      throw new BadRequestException('date must be a valid date in the past');
    }
  }

  private getRate(rate: number | undefined, currency: string) {
    if (typeof rate !== 'number') {
      throw new BadGatewayException(`No rate returned for ${currency}`);
    }
    return rate;
  }

  private async request<T>(path: string): Promise<T> {
    if (!this.apiKey || this.apiKey === 'your_key_here') {
      throw new ServiceUnavailableException(
        'Currency API key is not configured on the server',
      );
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: { apikey: this.apiKey },
      });

      if (!response.ok) {
        let upstreamMessage = '';
        try {
          const body = (await response.json()) as {
            message?: string;
            error?: string;
          };
          upstreamMessage = body.message ?? body.error ?? '';
        } catch {
          // Upstream did not send JSON.
        }

        const message =
          response.status === 429
            ? 'Currency API rate limit exceeded. Please try again later.'
            : upstreamMessage || 'Currency service request failed';
        throw new HttpException(message, response.status);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadGatewayException(
        'Unable to reach the currency service. Please try again.',
      );
    }
  }
}

