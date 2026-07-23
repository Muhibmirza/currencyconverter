import type { FormEvent } from 'react';
import type { Currency } from '../types';
import Loader from './Loader';

type Props = {
  currencies: Currency[];
  from: string;
  to: string;
  amount: number;
  historical: boolean;
  historicalDate: string;
  today: string;
  loading: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onAmountChange: (value: number) => void;
  onHistoricalChange: (value: boolean) => void;
  onDateChange: (value: string) => void;
  onSwap: () => void;
  onSubmit: (event: FormEvent) => void;
};

export default function CurrencyConverterForm(props: Props) {
  const options = props.currencies.map((currency) => (
    <option key={currency.code} value={currency.code}>
      {currency.code} — {currency.name}
      {currency.symbol ? ` (${currency.symbol})` : ''}
    </option>
  ));

  return (
    <form onSubmit={props.onSubmit}>
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md">
          <label className="form-label fw-semibold" htmlFor="from-currency">
            From currency
          </label>
          <select
            id="from-currency"
            className="form-select form-select-lg"
            value={props.from}
            onChange={(event) => props.onFromChange(event.target.value)}
            required
          >
            {options}
          </select>
        </div>

        <div className="col-12 col-md-auto swap-column">
          <button
            type="button"
            className="btn btn-outline-primary swap-button"
            onClick={props.onSwap}
            aria-label="Swap currencies"
          >
            <span aria-hidden="true">⇅</span>
            <span className="d-md-none ms-2">Swap currencies</span>
          </button>
        </div>

        <div className="col-12 col-md">
          <label className="form-label fw-semibold" htmlFor="to-currency">
            To currency
          </label>
          <select
            id="to-currency"
            className="form-select form-select-lg"
            value={props.to}
            onChange={(event) => props.onToChange(event.target.value)}
            required
          >
            {options}
          </select>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            className="form-control form-control-lg"
            type="number"
            min="0.01"
            step="any"
            value={props.amount}
            onChange={(event) => props.onAmountChange(Number(event.target.value))}
            required
          />
        </div>

        {props.historical && (
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="rate-date">
              Historical rate date
            </label>
            <input
              id="rate-date"
              className="form-control form-control-lg"
              type="date"
              max={props.today}
              value={props.historicalDate}
              onChange={(event) => props.onDateChange(event.target.value)}
              required
            />
          </div>
        )}
      </div>

      <div className="form-check form-switch my-4">
        <input
          id="historical-toggle"
          className="form-check-input"
          type="checkbox"
          role="switch"
          checked={props.historical}
          onChange={(event) => props.onHistoricalChange(event.target.checked)}
        />
        <label className="form-check-label" htmlFor="historical-toggle">
          Use historical rate
        </label>
      </div>

      <button
        className="btn btn-primary btn-lg w-100"
        type="submit"
        disabled={props.loading}
      >
        {props.loading ? <Loader compact label="Converting…" /> : 'Convert'}
      </button>
    </form>
  );
}

