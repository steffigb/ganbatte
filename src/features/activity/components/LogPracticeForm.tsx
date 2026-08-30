import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { logActivitySession } from '@/features/activity/activityService';
import type { Skill } from '@/types/domain';

type LogPracticeFormProps = {
  skill: Extract<Skill, 'reading' | 'listening'>;
  itemId?: string;
  topicId?: string;
  defaultMinutes?: number;
};

export function LogPracticeForm({
  skill,
  itemId,
  topicId,
  defaultMinutes = 20,
}: LogPracticeFormProps) {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<number | null>(null);

  async function handleLog() {
    if (!user || minutes <= 0) {
      return;
    }

    setIsSaving(true);

    try {
      await logActivitySession(user.id, { skill, durationMinutes: minutes, topicId, itemId });
      setConfirmedAt(Date.now());
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
      <label className="flex items-center gap-2">
        <span className="text-slate-700 dark:text-slate-300">Minutes practiced</span>
        <input
          type="number"
          min={1}
          max={240}
          value={minutes}
          onChange={(event) => setMinutes(Number(event.target.value))}
          className="w-20 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
        />
      </label>
      <Button type="button" disabled={isSaving} onClick={() => void handleLog()}>
        Mark as practiced
      </Button>
      {confirmedAt ? (
        <span className="text-emerald-700 dark:text-emerald-400">Logged — nice work!</span>
      ) : null}
    </div>
  );
}
