import type { Conversion } from '../types';

type Props = {
  conversion: Conversion;
  historical: boolean;
};

const number = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 6,
});

export default function ConversionResult({
  conversion,
  historical,
}: Props) {
  const rateDate = new Date(`${conversion.date}T00:00:00`).toLocaleDateString(
    undefined,
    { day: 'numeric', month: 'short', year: 'numeric' },
  );

  return (
    <section className="result-panel mt-4" aria-live="polite">
      <p className="text-uppercase small fw-semibold mb-2">
        {historical ? `Historical rate as of ${rateDate}` : `Rate date: ${rateDate}`}
      </p>
      <h2 className="h3 mb-2">
        {number.format(conversion.amount)} {conversion.from}
        <span className="text-primary mx-2">=</span>
        {number.format(conversion.result)} {conversion.to}
      </h2>
      <p className="mb-0 text-secondary">
        1 {conversion.from} = {number.format(conversion.rate)} {conversion.to}
      </p>
    </section>
  );
}

