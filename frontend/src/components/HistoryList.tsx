import type { HistoryEntry } from '../types';

type Props = {
  entries: HistoryEntry[];
  onClear: () => void;
};

const number = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 6,
});

export default function HistoryList({ entries, onClear }: Props) {
  return (
    <section className="card app-card mt-4">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
          <h2 className="h5 mb-0">Conversion history</h2>
          {entries.length > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={onClear}
            >
              Clear history
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-secondary mb-0">
            Your successful conversions will appear here.
          </p>
        ) : (
          <div className="history-list list-group list-group-flush">
            {entries.map((entry) => (
              <article
                className="list-group-item px-0 py-3"
                key={entry.timestamp}
              >
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <strong>
                      {number.format(entry.amount)} {entry.from} →{' '}
                      {number.format(entry.result)} {entry.to}
                    </strong>
                    {entry.historical && (
                      <span className="badge text-bg-light ms-2">historical</span>
                    )}
                    <div className="small text-secondary mt-1">
                      Rate: {number.format(entry.rate)} · Rate date: {entry.date}
                    </div>
                  </div>
                  <time className="small text-secondary text-end flex-shrink-0">
                    {new Date(entry.timestamp).toLocaleString()}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

