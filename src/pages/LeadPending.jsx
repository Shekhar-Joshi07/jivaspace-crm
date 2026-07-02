import { Eye, StickyNote } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { PageHeader, Pagination, FormField, StatusBadge } from '../components/UI';
import { leadService } from '../services/leadService';
import { formatDate, formatDateTime } from '../utils/formatDate';
import { getLeadMobile, getLeadName, getLeadOwnerName, getLeadProjectName } from '../utils/leadHelpers';

const getLeadId = lead => lead?._id || lead?.id;

export default function LeadPending() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [noteLead, setNoteLead] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await leadService.pending({
        page,
        limit: 10,
        search: search || undefined,
        overdue: overdueOnly ? 'true' : undefined
      });
      setLeads(result.leads);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [overdueOnly, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const saveNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await leadService.addRemark(getLeadId(noteLead), note.trim());
      toast.success('Remark added');
      setNoteLead(null);
      setNote('');
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
    { key: 'project', header: 'Project', render: lead => getLeadProjectName(lead) },
    { key: 'owner', header: 'Assigned to', render: lead => getLeadOwnerName(lead) },
    { key: 'followUpDate', header: 'Follow-up', render: lead => formatDate(lead.followUpDate || lead.nextFollowUp) },
    { key: 'updatedAt', header: 'Updated', render: lead => formatDateTime(lead.updatedAt) },
    {
      key: 'actions',
      header: '',
      cellClassName: 'w-28',
      render: lead => (
        <div className="flex justify-end gap-1" onClick={event => event.stopPropagation()}>
          <button className="icon-button" onClick={() => navigate(`/leads/${getLeadId(lead)}`)} type="button"><Eye size={17} /></button>
          <button className="icon-button" onClick={() => { setNoteLead(lead); setNote(''); }} type="button"><StickyNote size={17} /></button>
        </div>
      )
    }
  ]), [navigate]);

  if (loading) return <Loader fullPage label="Loading pending leads…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        description="Prioritize active leads that still need contact, follow-up, or closing work."
        eyebrow="Lead Management"
        title="Lead Pending"
      />

      <FilterBar
        onClear={() => { setSearch(''); setOverdueOnly(false); setPage(1); }}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        search={search}
        searchPlaceholder="Search pending leads"
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${!overdueOnly ? 'bg-brand-950 text-white' : 'border border-line text-ink-700 hover:bg-gray-100'}`}
            onClick={() => { setOverdueOnly(false); setPage(1); }}
            type="button"
          >
            All pending
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${overdueOnly ? 'bg-brand-950 text-white' : 'border border-line text-ink-700 hover:bg-gray-100'}`}
            onClick={() => { setOverdueOnly(true); setPage(1); }}
            type="button"
          >
            Overdue only
          </button>
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        emptyMessage="No pending leads found"
        loading={loading}
        onRowClick={lead => navigate(`/leads/${getLeadId(lead)}`)}
        rows={leads}
      />

      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal
        description="Add a quick remark for this follow-up lead."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setNoteLead(null)} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy || !note.trim()} onClick={saveNote} type="button">Save remark</button>
          </>
        )}
        onClose={() => setNoteLead(null)}
        open={Boolean(noteLead)}
        size="md"
        title="Add remark"
      >
        <FormField label="Remark" required>
          <textarea autoFocus className="field min-h-36 resize-y" onChange={event => setNote(event.target.value)} value={note} />
        </FormField>
      </Modal>
    </div>
  );
}
