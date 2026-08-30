import type { LearningItem } from '@/types/learningItem';
import { cn } from '@/utils/cn';
import {
  formatKunyomiDisplay,
  formatOnyomiDisplay,
  isReadingUnset,
  READING_NONE_LABEL,
} from '@/utils/kanjiReading';

type KanjiReadingLineProps = {
  label: string;
  display: string;
  unset: boolean;
};

function KanjiReadingLine({ label, display, unset }: KanjiReadingLineProps) {
  return (
    <p className="text-sm text-green-700 dark:text-green-400">
      {label}:{' '}
      <span
        className={cn(
          unset && 'italic text-amber-700 dark:text-amber-300',
          display === READING_NONE_LABEL && 'text-green-700 dark:text-green-400',
        )}
      >
        {display}
      </span>
    </p>
  );
}

export function KanjiReadingsBlock({ item }: { item: LearningItem }) {
  const onyomiDisplay = formatOnyomiDisplay(item.onyomiStatus, item.onyomi);
  const kunyomiDisplay = formatKunyomiDisplay(item.kunyomiStatus, item.kunyomi);

  return (
    <div className="space-y-1">
      <KanjiReadingLine
        label="On"
        display={onyomiDisplay}
        unset={isReadingUnset(item.onyomiStatus, item.onyomi)}
      />
      <KanjiReadingLine
        label="Kun"
        display={kunyomiDisplay}
        unset={isReadingUnset(item.kunyomiStatus, item.kunyomi)}
      />
    </div>
  );
}
