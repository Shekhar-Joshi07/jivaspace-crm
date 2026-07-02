import { Eye, Pencil } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { PageHeader, Pagination, StatusBadge, FormField } from '../components/UI';
import { leadService } from '../services/leadService';
import { LEAD_STATUSES } from '../utils/constants';
import { formatDateTime } from '../utils/formatDate';
import { getLeadMobile, getLeadName, getLeadOwnerName } from '../utils/leadHelpers';

const getLeadId = lead => lead?._id || lead?.id;

export default function LeadResponses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: 'New', remarks: '', followUpDate: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await leadService.responses({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined
      });
      setLeads(result.leads);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openEdit = lead => {
    setEditing(lead);
    setForm({
      status: lead.status || 'New',
      remarks: lead.remarks || '',
      followUpDate: lead.followUpDate ? String(lead.followUpDate).slice(0, 10) : ''
    });
  };

  const submit = async () => {
    setBusy(true);
    try {
      const updated = await leadService.updateResponse(getLeadId(editing), {
        status: form.status,
        remarks: form.remarks || undefined,
        followUpDate: form.followUpDate || undefined
      });
      setLeads(current => current.map(item => (getLeadId(item) === getLeadId(editing) ? updated : item)));
      toast.success('Response updated');
      setEditing(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'customer',
      header: 'Customer',
      render: lead => (
        <div>
          <p className="font-bold text-ink-950">{getLeadName(lead)}</p>
          <p className="mt-0.5 text-xs text-ink-400">{getLeadMobile(lead)}</p>
        </div>
      )
    },
    { key: 'status', header: 'Status', render: lead => <StatusBadge value={lead.status} /> },
    { key: 'remarks', header: 'Latest response', render: lead => lead.remarks || '—' },
    { key: 'owner', header: 'Assigned to', render: lead => getLeadOwnerName(lead) },
    { key: 'updatedAt', header: 'Updated', render: lead => formatDateTime(lead.updatedAt) },
    {
      key: 'actions',
      header: '',
      cellClassName: 'w-28',
      render: lead => (
        <div className="flex justify-end gap-1" onClick={event => event.stopPropagation()}>
          <button className="icon-button" onClick={() => navigate(`/leads/${getLeadId(lead)}`)} type="button">
            <Eye size={17} />
          </button>
          <button className="icon-button" onClick={() => openEdit(lead)} type="button">
            <Pencil size={17} />
          </button>
        </div>
      )
    }
  ]), [navigate]);

  if (loading) return <Loader fullPage label="Loading lead responses…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        description="Review customer responses and update the pipeline based on the latest engagement."
        eyebrow="Lead Management"
        title="Lead Responses"
      />

      <FilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: LEAD_STATUSES,
            value: status,
            allLabel: 'All statuses'
          }
        ]}
        onClear={() => { setSearch(''); setStatus(''); setPage(1); }}
        onFilterChange={(_, value) => { setStatus(value); setPage(1); }}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        search={search}
        searchPlaceholder="Search responses"
      />

      <DataTable
        columns={columns}
        emptyMessage="No lead responses found"
        loading={loading}
        onRowClick={lead => navigate(`/leads/${getLeadId(lead)}`)}
        rows={leads}
      />

      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal
        description="Update the response status and follow-up details."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setEditing(null)} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy} onClick={submit} type="button">
              {busy ? 'Saving…' : 'Save response'}
            </button>
          </>
        )}
        onClose={() => setEditing(null)}
        open={Boolean(editing)}
        size="md"
        title="Update response"
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="field-label">Status</span>
            <select className="field" onChange={event => setForm(current => ({ ...current, status: event.target.value }))} value={form.status}>
              {LEAD_STATUSES.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
          <FormField label="Remarks">
            <textarea className="field min-h-32 resize-y" onChange={event => setForm(current => ({ ...current, remarks: event.target.value }))} value={form.remarks} />
          </FormField>
          <label className="block">
            <span className="field-label">Follow-up date</span>
            <input className="field" onChange={event => setForm(current => ({ ...current, followUpDate: event.target.value }))} type="date" value={form.followUpDate} />
          </label>
        </div>
      </Modal>
    </div>
  );
}
