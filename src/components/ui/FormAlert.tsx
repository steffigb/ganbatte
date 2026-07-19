import { cn } from '@/utils/cn';

type FormAlertProps = {
  variant: 'success' | 'error';
  message: string;
};

export function FormAlert({ variant, message }: FormAlertProps) {
  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg px-3 py-2 text-sm',
        variant === 'success' &&
          'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300',
        variant === 'error' &&
          'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
      )}
    >
      {message}
    </p>
  );
}
