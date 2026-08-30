import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

type DropdownMenuProps = {
  label: ReactNode;
  active?: boolean;
  children: ReactNode;
};

/** Generic dropdown: click outside or Escape to close; any click inside the panel closes it too. */
export function DropdownMenu({ label, active, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
          active
            ? 'bg-green-900 text-white dark:bg-green-100 dark:text-green-900'
            : 'text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800',
        )}
      >
        {label}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.148l3.71-3.918a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen ? (
        <div
          onClick={() => setIsOpen(false)}
          className="absolute top-full right-0 z-10 mt-1 w-48 space-y-0.5 rounded-lg border border-green-200 bg-white p-1 shadow-lg dark:border-green-700 dark:bg-green-900"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
