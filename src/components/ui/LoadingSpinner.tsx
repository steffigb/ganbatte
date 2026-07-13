type LoadingSpinnerProps = {
  label?: string;
};

export function LoadingSpinner({ label = 'Loading…' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-slate-500">
      <span className="animate-pulse">{label}</span>
    </div>
  );
}
