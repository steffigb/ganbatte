import { useCallback, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSync } from '@/features/sync/hooks/useSync';
import {
  buildImportPreview,
  DEFAULT_IMPORT_OPTIONS,
  executeImport,
  type ImportOptions,
  type ImportPreview,
  type ImportResult,
} from '@/lib/import';
import { ensureSyncMeta } from '@/lib/db';

export type ImportStep = 'input' | 'preview' | 'result';

export function useImport() {
  const { user } = useAuth();
  const { syncNow } = useSync();
  const [step, setStep] = useState<ImportStep>('input');
  const [csvText, setCsvText] = useState('');
  const [filename, setFilename] = useState<string | undefined>();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [options, setOptions] = useState<ImportOptions>(DEFAULT_IMPORT_OPTIONS);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = useCallback((text: string, name: string) => {
    setCsvText(text);
    setFilename(name);
    setError(null);
  }, []);

  const buildPreview = useCallback(async () => {
    setError(null);

    if (!user) {
      setError('You must be signed in to import');
      return;
    }

    if (!csvText.trim()) {
      setError('Paste CSV text or choose a file first');
      return;
    }

    setIsLoading(true);

    try {
      const nextPreview = await buildImportPreview(user.id, csvText);
      if (nextPreview.rows.length === 0) {
        setError('No data rows found in CSV');
        return;
      }

      setPreview(nextPreview);
      setStep('preview');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to parse CSV');
    } finally {
      setIsLoading(false);
    }
  }, [csvText, user]);

  const runImport = useCallback(async () => {
    setError(null);

    if (!user || !preview) {
      setError('Nothing to import');
      return;
    }

    setIsLoading(true);

    try {
      await ensureSyncMeta();
      const importResult = await executeImport(user.id, preview, options, filename);
      setResult(importResult);
      setStep('result');

      if (importResult.importedCount + importResult.updatedCount + importResult.attachedCount > 0) {
        await syncNow();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Import failed');
    } finally {
      setIsLoading(false);
    }
  }, [filename, options, preview, syncNow, user]);

  const startOver = useCallback(() => {
    setStep('input');
    setCsvText('');
    setFilename(undefined);
    setPreview(null);
    setResult(null);
    setOptions(DEFAULT_IMPORT_OPTIONS);
    setError(null);
  }, []);

  const backToInput = useCallback(() => {
    setStep('input');
    setPreview(null);
    setError(null);
  }, []);

  return {
    step,
    csvText,
    setCsvText,
    filename,
    preview,
    options,
    setOptions,
    result,
    isLoading,
    error,
    loadFile,
    buildPreview,
    runImport,
    startOver,
    backToInput,
  };
}
