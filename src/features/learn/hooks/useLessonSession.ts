import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ALL_RELATIONS, type ItemRelations, type LevelFilter, type RelationFilter } from '@/features/items';
import {
  completeLessons,
  filterLessonCandidates,
  loadLessonCandidates,
  type LessonGroup,
  type LessonQueueEntry,
  type LessonTypeFilter,
} from '@/features/learn/lessonService';

export type LessonPhase = 'setup' | 'studying' | 'complete';

export type LessonSessionState = {
  phase: LessonPhase;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Setup
  candidateEntries: LessonQueueEntry[];
  filteredEntries: LessonQueueEntry[];
  relations: Map<string, ItemRelations> | null;
  level: LevelFilter;
  setLevel: Dispatch<SetStateAction<LevelFilter>>;
  type: LessonTypeFilter;
  setType: Dispatch<SetStateAction<LessonTypeFilter>>;
  relationFilter: RelationFilter;
  setRelationFilter: Dispatch<SetStateAction<RelationFilter>>;
  targetCount: number;
  setTargetCount: Dispatch<SetStateAction<number>>;
  selectedIds: Set<string>;
  toggleSelect: (itemId: string) => void;
  start: () => void;

  // Studying
  entries: LessonQueueEntry[];
  currentIndex: number;
  currentEntry: LessonQueueEntry | null;
  learnedCount: number;
  next: () => void;
  back: () => void;
  finish: () => Promise<void>;
  backToSetup: () => void;

  reload: () => void;
};

/** Remembers which item you were on within a lesson session, per group, so
 * stepping away (e.g. to look up a word) and coming back — which unmounts and
 * remounts this page — doesn't restart the session from the beginning.
 * sessionStorage: resets on tab/window close, doesn't linger across days. */
function positionStorageKey(group: LessonGroup): string {
  return `ganbatte:lesson-position:${group}`;
}

function selectionStorageKey(group: LessonGroup): string {
  return `ganbatte:lesson-selection:${group}`;
}

function readSavedItemId(group: LessonGroup): string | null {
  try {
    return sessionStorage.getItem(positionStorageKey(group));
  } catch {
    return null;
  }
}

function saveItemId(group: LessonGroup, itemId: string | null): void {
  try {
    if (itemId) {
      sessionStorage.setItem(positionStorageKey(group), itemId);
    } else {
      sessionStorage.removeItem(positionStorageKey(group));
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — resume just won't work
  }
}

function readSavedSelection(group: LessonGroup): string[] | null {
  try {
    const raw = sessionStorage.getItem(selectionStorageKey(group));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((id) => typeof id === 'string') ? parsed : null;
  } catch {
    return null;
  }
}

function saveSelection(group: LessonGroup, itemIds: string[] | null): void {
  try {
    if (itemIds) {
      sessionStorage.setItem(selectionStorageKey(group), JSON.stringify(itemIds));
    } else {
      sessionStorage.removeItem(selectionStorageKey(group));
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — resume just won't work
  }
}

export function useLessonSession(group: LessonGroup): LessonSessionState {
  const { user } = useAuth();

  const [phase, setPhase] = useState<LessonPhase>('setup');
  const [candidateEntries, setCandidateEntries] = useState<LessonQueueEntry[]>([]);
  const [relations, setRelations] = useState<Map<string, ItemRelations> | null>(null);
  const [level, setLevel] = useState<LevelFilter>('all');
  const [type, setType] = useState<LessonTypeFilter>('all');
  const [relationFilter, setRelationFilter] = useState<RelationFilter>(ALL_RELATIONS);
  const [targetCount, setTargetCount] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [entries, setEntries] = useState<LessonQueueEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const candidates = await loadLessonCandidates(user.id, group);
        if (cancelled) {
          return;
        }

        setCandidateEntries(candidates.entries);
        setRelations(candidates.relations);
        setLevel('all');
        setType('all');
        setRelationFilter(ALL_RELATIONS);
        setTargetCount(Math.max(1, candidates.defaultLessonSize));

        const savedSelection = readSavedSelection(group);
        const candidateIds = new Set(candidates.entries.map((entry) => entry.item.id));
        const resumedSelection =
          savedSelection && savedSelection.length > 0 && savedSelection.every((id) => candidateIds.has(id))
            ? savedSelection
            : null;

        if (resumedSelection) {
          const byId = new Map(candidates.entries.map((entry) => [entry.item.id, entry]));
          const resumedEntries = resumedSelection
            .map((id) => byId.get(id))
            .filter((entry): entry is LessonQueueEntry => entry !== undefined);

          const savedItemId = readSavedItemId(group);
          const restoredIndex = savedItemId
            ? resumedEntries.findIndex((entry) => entry.item.id === savedItemId)
            : -1;

          setEntries(resumedEntries);
          setCurrentIndex(restoredIndex >= 0 ? restoredIndex : 0);
          setPhase('studying');
        } else {
          setPhase('setup');
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load lessons');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, group, refreshKey]);

  const filteredEntries = useMemo(
    () => filterLessonCandidates(candidateEntries, relations, { level, type, ...relationFilter }),
    [candidateEntries, relations, level, type, relationFilter],
  );

  // Re-seed the auto-selection whenever the candidate pool changes shape
  // (filters, target count, or a fresh load) — manual per-item ticks only touch
  // `selectedIds` directly, so they don't change `filteredEntries`/`targetCount`
  // and won't retrigger this. Adjusting state during render (rather than in an
  // effect) is the documented React pattern for "reset derived state when an
  // input changes" — React discards this render and re-renders immediately
  // with the new state, without an extra committed frame.
  const [selectionSeed, setSelectionSeed] = useState<{
    filteredEntries: LessonQueueEntry[];
    targetCount: number;
  } | null>(null);
  if (
    selectionSeed === null ||
    selectionSeed.filteredEntries !== filteredEntries ||
    selectionSeed.targetCount !== targetCount
  ) {
    setSelectionSeed({ filteredEntries, targetCount });
    setSelectedIds(new Set(filteredEntries.slice(0, targetCount).map((entry) => entry.item.id)));
  }

  const toggleSelect = useCallback((itemId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const start = useCallback(() => {
    const startedEntries = candidateEntries.filter((entry) => selectedIds.has(entry.item.id));
    if (startedEntries.length === 0) {
      return;
    }

    setEntries(startedEntries);
    setCurrentIndex(0);
    saveSelection(
      group,
      startedEntries.map((entry) => entry.item.id),
    );
    setPhase('studying');
  }, [candidateEntries, selectedIds, group]);

  const backToSetup = useCallback(() => {
    saveSelection(group, null);
    saveItemId(group, null);
    // Re-fetch candidates so items just learned drop out of the pool.
    setRefreshKey((key) => key + 1);
  }, [group]);

  const currentEntry = entries[currentIndex] ?? null;

  useEffect(() => {
    if (phase !== 'studying') {
      return;
    }

    saveItemId(group, currentEntry?.item.id ?? null);
  }, [group, currentEntry, phase]);

  const next = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, entries.length));
  }, [entries.length]);

  const back = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const finish = useCallback(async () => {
    if (!user || entries.length === 0 || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await completeLessons(
        user.id,
        entries.map((entry) => entry.item),
      );
      saveItemId(group, null);
      saveSelection(group, null);
      setPhase('complete');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save lessons');
    } finally {
      setIsSaving(false);
    }
  }, [user, group, entries, isSaving]);

  return useMemo(
    () => ({
      phase,
      isLoading,
      isSaving,
      error,
      candidateEntries,
      filteredEntries,
      relations,
      level,
      setLevel,
      type,
      setType,
      relationFilter,
      setRelationFilter,
      targetCount,
      setTargetCount,
      selectedIds,
      toggleSelect,
      start,
      entries,
      currentIndex,
      currentEntry,
      learnedCount: entries.length,
      next,
      back,
      finish,
      backToSetup,
      reload,
    }),
    [
      phase,
      isLoading,
      isSaving,
      error,
      candidateEntries,
      filteredEntries,
      relations,
      level,
      type,
      relationFilter,
      targetCount,
      selectedIds,
      toggleSelect,
      start,
      entries,
      currentIndex,
      currentEntry,
      next,
      back,
      finish,
      backToSetup,
      reload,
    ],
  );
}
