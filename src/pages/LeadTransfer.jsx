import { Shuffle, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Loader from '../components/Loader';
import { PageHeader, Pagination, StatusBadge } from '../components/UI';
import { leadService } from '../services/leadService';
import { userService } from '../services/userService';
import { LEAD_STATUSES } from '../utils/constants';
import { formatDate } from '../utils/formatDate';
import { getLeadMobile, getLeadName, getLeadOwnerName, getLeadProjectName } from '../utils/leadHelpers';

const getLeadId = lead => String(lead?._id || lead?.id);

export default function LeadTransfer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toUser, setToUser] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    userService.list({ limit: 200, isActive: true })
      .then(result => setUsers(result.users))
      .catch(() => setUsers([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await leadService.list({
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

  const toggleRow = (lead, checked) => {
    const id = getLeadId(lead);
    setSelectedIds(current => checked
      ? Array.from(new Set([...current, id]))
      : current.filter(item => item !== id));
  };

  const toggleAll = checked => {
    const pageIds = leads.map(getLeadId);
    setSelectedIds(current => checked
      ? Array.from(new Set([...current, ...pageIds]))
      : current.filter(id => !pageIds.includes(id)));
  };

  const clearSelection = () => setSelectedIds([]);

  const transferSelected = async () => {
    if (!selectedIds.length) return toast.error('Select at least one lead');
    if (!toUser) return toast.error('Choose a destination user');
    setBusy(true);
    try {
      await leadService.bulkTransfer({
        leadIds: selectedIds,
        toUser,
        reason: reason || undefined
      });
      toast.success(`${selectedIds.length} lead(s) transferred`);
      setSelectedIds([]);
      setReason('');
      setToUser('');
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
    { key: 'followUp', header: 'Follow-up', render: lead => formatDate(lead.followUpDate || lead.nextFollowUp) }
  ]), []);

  if (loading) return <Loader fullPage label="Loading transfer list…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={(
          <button className="btn-secondary" onClick={clearSelection} type="button">
            <Trash2 size={17} /> Clear selection
          </button>
        )}
        description="Select leads and move them to another owner in one step."
        eyebrow="Lead Management"
        title="Lead Transfer"
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
        searchPlaceholder="Search leads to transfer"
      >
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_auto]">
          <label className="block">
            <span className="field-label">Transfer to</span>
            <select className="field min-h-11" onChange={event => setToUser(event.target.value)} value={toUser}>
              <option value="">Choose user</option>
              {users.map(user => <option key={user._id} value={user._id}>{user.name} · {user.role.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Reason</span>
            <input className="field min-h-11" onChange={event => setReason(event.target.value)} placeholder="Optional transfer reason" value={reason} />
          </label>
          <div className="flex items-end gap-2">
            <button className="btn-primary min-h-11 px-4" disabled={busy || !selectedIds.length || !toUser} onClick={transferSelected} type="button">
              <Shuffle size={16} /> {busy ? 'Transferring…' : `Transfer ${selectedIds.length || ''}`.trim()}
            </button>
          </div>
        </div>
      </FilterBar>

      <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink-600">
        <span>{selectedIds.length} lead(s) selected</span>
        <span>Selection persists while you page through the list.</span>
      </div>

      <DataTable
        columns={columns}
        emptyMessage="No leads available for transfer"
        loading={loading}
        onRowClick={lead => navigate(`/leads/${getLeadId(lead)}`)}
        onToggleAll={toggleAll}
        onToggleRow={toggleRow}
        rows={leads}
        selectedIds={selectedIds}
        selectable
      />

      <Pagination onPageChange={setPage} pagination={pagination} />
    </div>
  );
}
