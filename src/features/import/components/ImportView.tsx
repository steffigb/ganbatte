import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { ImportInput } from '@/features/import/components/ImportInput';
import { ImportOptionsPanel } from '@/features/import/components/ImportOptionsPanel';
import { ImportPreviewTable } from '@/features/import/components/ImportPreviewTable';
import { ImportResultView } from '@/features/import/components/ImportResultView';
import { useImport } from '@/features/import/hooks/useImport';

export function ImportView() {
  const {
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
  } = useImport();

  if (step === 'result' && result) {
    return <ImportResultView result={result} onStartOver={startOver} />;
  }

  return (
    <div className="space-y-6">
      {error ? <FormAlert variant="error" message={error} /> : null}

      {step === 'input' ? (
        <ImportInput
          csvText={csvText}
          filename={filename}
          isLoading={isLoading}
          onCsvTextChange={setCsvText}
          onFileLoaded={loadFile}
          onPreview={() => void buildPreview()}
        />
      ) : null}

      {step === 'preview' && preview ? (
        <>
          <ImportPreviewTable rows={preview.rows} stats={preview.stats} />
          <ImportOptionsPanel options={options} onChange={setOptions} />
          <div className="flex flex-wrap gap-3">
            <Button type="button" disabled={isLoading} onClick={() => void runImport()}>
              {isLoading ? 'Importing…' : 'Run import'}
            </Button>
            <Button
              type="button"
              className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"
              disabled={isLoading}
              onClick={backToInput}
            >
              Back
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
