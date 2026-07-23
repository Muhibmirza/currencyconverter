import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getConversion, getCurrencies } from './api';
import CurrencyConverterForm from './components/CurrencyConverterForm';
import ConversionResult from './components/ConversionResult';
import HistoryList from './components/HistoryList';
import Loader from './components/Loader';
import type { Conversion, Currency, HistoryEntry } from './types';

const HISTORY_KEY = 'conversionHistory';
const today = new Date().toISOString().slice(0, 10);

function readHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState(1);
  const [historical, setHistorical] = useState(false);
  const [historicalDate, setHistoricalDate] = useState(today);
  const [result, setResult] = useState<Conversion | null>(null);
  const [resultIsHistorical, setResultIsHistorical] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(readHistory);
  const [listLoading, setListLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await getCurrencies();
        if (!active) return;
        setCurrencies(list);
        setFrom(list.find((item) => item.code === 'USD')?.code ?? list[0]?.code ?? '');
        setTo(
          list.find((item) => item.code === 'PKR')?.code ??
            list.find((item) => item.code !== list[0]?.code)?.code ??
            '',
        );
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load currencies.',
          );
        }
      } finally {
        if (active) setListLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const swapCurrencies = useCallback(() => {
    setFrom(to);
    setTo(from);
    setResult(null);
  }, [from, to]);

  const handleConvert = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!from || !to || !Number.isFinite(amount) || amount <= 0) {
        setError('Choose two currencies and enter an amount greater than zero.');
        return;
      }
      if (historical && !historicalDate) {
        setError('Choose a date for the historical rate.');
        return;
      }

      setConverting(true);
      setError('');
      try {
        const conversion = await getConversion(
          from,
          to,
          amount,
          historical ? historicalDate : undefined,
        );
        const entry: HistoryEntry = {
          ...conversion,
          historical,
          timestamp: new Date().toISOString(),
        };
        setResult(conversion);
        setResultIsHistorical(historical);
        setHistory((current) => [entry, ...current]);
      } catch (convertError) {
        setError(
          convertError instanceof Error
            ? convertError.message
            : 'Unable to complete this conversion.',
        );
      } finally {
        setConverting(false);
      }
    },
    [amount, from, historical, historicalDate, to],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return (
    <main className="min-vh-100 py-4 py-md-5">
      <div className="container app-container">
        <header className="text-center mb-4">
          <span className="eyebrow">Simple, current, reliable</span>
          <h1 className="display-5 fw-bold mt-2 mb-2">Currency Converter</h1>
          <p className="text-secondary mb-0">
            Convert with the latest rate or explore a historical date.
          </p>
        </header>

        <section className="card app-card">
          <div className="card-body p-3 p-sm-4 p-md-5">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {listLoading ? (
              <Loader label="Loading currencies…" />
            ) : currencies.length === 0 ? (
              <p className="text-center text-secondary mb-0">
                No currencies are available right now.
              </p>
            ) : (
              <>
                <CurrencyConverterForm
                  currencies={currencies}
                  from={from}
                  to={to}
                  amount={amount}
                  historical={historical}
                  historicalDate={historicalDate}
                  today={today}
                  loading={converting}
                  onFromChange={setFrom}
                  onToChange={setTo}
                  onAmountChange={setAmount}
                  onHistoricalChange={setHistorical}
                  onDateChange={setHistoricalDate}
                  onSwap={swapCurrencies}
                  onSubmit={handleConvert}
                />
                {result && (
                  <ConversionResult
                    conversion={result}
                    historical={resultIsHistorical}
                  />
                )}
              </>
            )}
          </div>
        </section>

        <HistoryList entries={history} onClear={clearHistory} />
        <p className="text-center small text-secondary mt-4 mb-0">
          Rates provided by freecurrencyapi.com
        </p>
      </div>
    </main>
  );
}

