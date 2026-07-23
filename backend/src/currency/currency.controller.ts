import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('list')
  list() {
    return this.currencyService.list();
  }

  @Get('convert')
  convert(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: string,
  ) {
    return this.currencyService.convert(from, to, amount);
  }

  @Get('historical')
  historical(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: string,
    @Query('date') date: string,
  ) {
    return this.currencyService.historical(from, to, amount, date);
  }

  @Get('status')
  status() {
    return this.currencyService.status();
  }
}

