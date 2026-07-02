import { FileSpreadsheet, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import { PageHeader } from '../components/UI';
import { leadService } from '../services/leadService';

export default function BulkImport() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const importFile = async () => {
    if (!file) return toast.error('Choose an Excel file first');
    setBusy(true);
    try {
      const response = await leadService.importSpreadsheet(file);
      setResult(response);
      toast.success('Import completed');
      setFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        description="Upload an Excel sheet to create or update leads in bulk."
        eyebrow="Lead Management"
        title="Bulk Import"
      />

      <section className="card p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-gray-50/70 p-4">
              <p className="text-sm font-semibold text-ink-800">Expected columns</p>
              <p className="mt-2 text-sm leading-6 text-ink-600">
                customerName, mobile, alternateMobile, email, leadSource, interestedProject,
                interestedPropertyType, budget, locationPreference, status, priority,
                assignedTo, followUpDate, remarks
              </p>
            </div>
            <label className="grid min-h-60 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-line bg-white p-6 text-center transition hover:border-[#d8b04f] hover:bg-[#fffaf0]">
              <span>
                <FileSpreadsheet className="mx-auto text-[#8b6520]" size={34} />
                <strong className="mt-3 block text-base text-ink-950">{file?.name || 'Choose an Excel or CSV file'}</strong>
                <span className="mt-1 block text-sm text-ink-500">XLSX, XLS, or CSV files are supported.</span>
              </span>
              <input accept=".xlsx,.xls,.csv" className="hidden" onChange={event => setFile(event.target.files?.[0] || null)} type="file" />
            </label>
          </div>

          <aside className="space-y-3">
            <button className="btn-primary w-full" disabled={busy || !file} onClick={importFile} type="button">
              <Upload size={17} />
              {busy ? 'Importing…' : 'Import file'}
            </button>
            <div className="rounded-2xl border border-line bg-gray-50/70 p-4 text-sm leading-6 text-ink-600">
              Rows are validated against the real-estate lead rules. Duplicate mobile numbers are blocked by the backend.
            </div>
          </aside>
        </div>
      </section>

      {result ? (
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold text-ink-950">Import result</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ResultCard label="Created" value={result.created ?? result.data?.created ?? 0} />
            <ResultCard label="Updated" value={result.updated ?? result.data?.updated ?? 0} />
            <ResultCard label="Skipped" value={result.skipped ?? result.data?.skipped ?? result.errors?.length ?? result.data?.errors?.length ?? 0} />
          </div>
          {(result.errors || result.data?.errors)?.length ? (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-bold">Validation issues</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {(result.errors || result.data?.errors).slice(0, 10).map((error, index) => (
                  <li key={`${error.row || index}-${index}`}>
                    Row {error.row || index + 1}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-gray-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p className="mt-2 font-display text-3xl font-black text-ink-950">{value}</p>
    </div>
  );
}
