import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  createBlankItemFormValues,
  DEFAULT_ITEM_FORM_TYPE_LEVEL,
  type ItemFormValues,
} from '@/features/items/itemFormTypes';
import { loadItemFormValues, saveItemWithRelations } from '@/features/items/itemService';
import { ensureSyncMeta } from '@/lib/db';

export type SaveFeedback = {
  type: 'success' | 'error';
  message: string;
};

export function useItemForm(editId?: string) {
  const { user } = useAuth();
  const previousEditIdRef = useRef<string | undefined>(editId);
  const [initialValues, setInitialValues] = useState<ItemFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(editId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [createDefaults, setCreateDefaults] = useState(DEFAULT_ITEM_FORM_TYPE_LEVEL);

  useEffect(() => {
    if (!editId) {
      previousEditIdRef.current = undefined;
      queueMicrotask(() => setSaveFeedback(null));
      return;
    }

    if (previousEditIdRef.current && previousEditIdRef.current !== editId) {
      queueMicrotask(() => setSaveFeedback(null));
    }

    previousEditIdRef.current = editId;
  }, [editId]);

  useEffect(() => {
    if (!editId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const values = await loadItemFormValues(editId);
        if (cancelled) {
          return;
        }

        if (!values) {
          setLoadError('Item not found');
          setInitialValues(null);
          return;
        }

        setInitialValues(values);
      } catch (cause) {
        if (!cancelled) {
          setLoadError(cause instanceof Error ? cause.message : 'Failed to load item');
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
  }, [editId]);

  const saveItem = useCallback(
    async (values: ItemFormValues) => {
      setSaveFeedback(null);
      setIsSaving(true);

      if (!user) {
        setSaveFeedback({
          type: 'error',
          message: 'You must be signed in to save items',
        });
        setIsSaving(false);
        return;
      }

      try {
        await ensureSyncMeta();
        await saveItemWithRelations(user.id, values);

        setSaveFeedback({
          type: 'success',
          message: editId ? 'Item updated successfully.' : 'Item saved successfully.',
        });

        if (!editId) {
          setCreateDefaults({ type: values.type, level: values.level });
          setFormResetKey((current) => current + 1);
        }
      } catch (cause) {
        setSaveFeedback({
          type: 'error',
          message: cause instanceof Error ? cause.message : 'Failed to save item',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [user, editId],
  );

  return {
    initialValues: editId ? initialValues : createBlankItemFormValues(createDefaults),
    formResetKey,
    isLoading: Boolean(editId) && isLoading,
    loadError,
    saveFeedback,
    isSaving,
    saveItem,
    isEditing: Boolean(editId),
    onSave: saveItem,
  };
}
