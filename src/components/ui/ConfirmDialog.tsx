import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-green-900/50 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className={cn(
          'w-full max-w-md rounded-xl border border-green-200 bg-white p-6 shadow-lg',
          'dark:border-green-700 dark:bg-green-900',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-medium text-green-950 dark:text-green-100"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="mt-2 text-sm text-green-700 dark:text-green-400"
        >
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            className="bg-green-200 text-green-950 hover:bg-green-300 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700"
            disabled={isConfirming}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            disabled={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
