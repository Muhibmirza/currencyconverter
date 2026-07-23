type LoaderProps = {
  label?: string;
  compact?: boolean;
};

export default function Loader({
  label = 'Loading…',
  compact = false,
}: LoaderProps) {
  return (
    <div
      className={compact ? 'd-inline-flex align-items-center' : 'loader-wrap'}
      role="status"
      aria-live="polite"
    >
      <span
        className={`spinner-border ${compact ? 'spinner-border-sm me-2' : 'text-primary mb-3'}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

