import { Download, Eye, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import LeadForm from '../components/LeadForm';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { PageHeader, Pagination, StatusBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { leadService } from '../services/leadService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { ADMIN_ROLES, canManageLeads, canUpdateLeadStatus, LEAD_STATUSES, PRIORITIES } from '../utils/constants';
import { downloadBlob } from '../utils/download';
import { formatCurrency, formatDate } from '../utils/formatDate';
import { getLeadEmail, getLeadMobile, getLeadName, getLeadOwnerName, getLeadProjectName } from '../utils/leadHelpers';

const canAssignLead = role => ADMIN_ROLES.includes(role);

const getLeadId = lead => lead?._id || lead?.id;

export default function Leads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    project: '',
    assignedTo: '',
    from: '',
    to: ''
  });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const canEdit = canManageLeads(user?.role);
  const canDelete = ADMIN_ROLES.includes(user?.role);
  const canUpdateStatus = canUpdateLeadStatus(user?.role);

  useEffect(() => {
    Promise.allSettled([
      userService.list({ limit: 200, isActive: true }),
      projectService.list({ limit: 200 })
    ]).then(([usersResult, projectsResult]) => {
      setUsers(usersResult.status === 'fulfilled' ? usersResult.value.users : []);
      setProjects(projectsResult.status === 'fulfilled' ? projectsResult.value.projects : []);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await leadService.list({
        page,
        limit: 10,
        search: search || undefined,
        status: filters.status || undefined,
        project: filters.project || undefined,
        assignedTo: filters.assignedTo || undefined,
        createdFrom: filters.from || undefined,
        createdTo: filters.to || undefined
      });
      setLeads(result.leads);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const resetFilters = () => {
    setSearch('');
    setFilters({ status: '', project: '', assignedTo: '', from: '', to: '' });
    setPage(1);
  };

  const saveLead = async payload => {
    setBusy(true);
    try {
      if (editing) {
        await leadService.update(getLeadId(editing), payload);
        toast.success('Lead updated');
      } else {
        await leadService.create(payload);
        toast.success('Lead created');
      }
      setEditing(null);
      setFormOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const removeLead = async () => {
    setBusy(true);
    try {
      await leadService.remove(getLeadId(deleting));
      toast.success('Lead deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const exportLeads = async () => {
    try {
      const blob = await leadService.exportLeads({
        search: search || undefined,
        status: filters.status || undefined,
        project: filters.project || undefined,
        assignedTo: filters.assignedTo || undefined,
        createdFrom: filters.from || undefined,
        createdTo: filters.to || undefined
      });
      downloadBlob(blob, `lead-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Export downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const updateStatus = async (lead, status) => {
    if (!status || status === lead.status) return;
    try {
      const updated = await leadService.updateStatus(getLeadId(lead), { status });
      setLeads(current => current.map(item => (getLeadId(item) === getLeadId(lead) ? updated : item)));
      toast.success('Status updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'customer',
      header: 'Customer',
      render: lead => (
        <div>
          <p className="font-bold text-ink-950">{getLeadName(lead)}</p>
          <p className="mt-0.5 text-xs text-ink-400">{getLeadEmail(lead) || getLeadMobile(lead) || '—'}</p>
        </div>
      )
    },
    { key: 'mobile', header: 'Mobile', render: lead => getLeadMobile(lead) || '—' },
    {
      key: 'status',
      header: 'Status',
      render: lead => (
        <div className="min-w-[170px]" onClick={event => event.stopPropagation()}>
          <select
            className="field min-h-10 text-sm"
            disabled={!canUpdateStatus}
            onChange={event => updateStatus(lead, event.target.value)}
            value={lead.status || 'New'}
          >
            {LEAD_STATUSES.map(status => <option key={status}>{status}</option>)}
          </select>
        </div>
      )
    },
    { key: 'project', header: 'Project', render: lead => getLeadProjectName(lead) },
    { key: 'owner', header: 'Assigned to', render: lead => getLeadOwnerName(lead) },
    { key: 'followUp', header: 'Follow-up', render: lead => formatDate(lead.followUpDate || lead.nextFollowUp) },
    { key: 'budget', header: 'Budget', render: lead => formatCurrency(lead.budget) },
    {
      key: 'actions',
      header: '',
      cellClassName: 'w-36',
      render: lead => (
        <div className="flex justify-end gap-1" onClick={event => event.stopPropagation()}>
          <button aria-label="View lead" className="icon-button" onClick={() => navigate(`/leads/${getLeadId(lead)}`)} type="button">
            <Eye size={17} />
          </button>
          {canEdit ? (
            <button
              aria-label="Edit lead"
              className="icon-button"
              onClick={() => { setEditing(lead); setFormOpen(true); }}
              type="button"
            >
              <Pencil size={17} />
            </button>
          ) : null}
          {canDelete ? (
            <button
              aria-label="Delete lead"
              className="icon-button text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleting(lead)}
              type="button"
            >
              <Trash2 size={17} />
            </button>
          ) : null}
        </div>
      )
    }
  ]), [canDelete, canEdit, navigate]);

  if (loading) return <Loader fullPage label="Loading leads…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={(
          <>
            {canEdit ? <Link className="btn-secondary" to="/lead-bulk-import"><Upload size={17} /> Bulk import</Link> : null}
            {canEdit ? <button className="btn-secondary" onClick={exportLeads} type="button"><Download size={17} /> Export</button> : null}
            {canEdit ? <Link className="btn-primary" to="/leads/create"><Plus size={17} /> Add lead</Link> : null}
          </>
        )}
        description="Search, filter, edit, and route leads through the real-estate pipeline."
        eyebrow="Lead Management"
        title="Leads"
      />

      <FilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: LEAD_STATUSES,
            value: filters.status,
            allLabel: 'All statuses'
          },
          {
            key: 'project',
            label: 'Project',
            options: projects.map(project => ({
              value: project._id || project.id,
              label: project.projectName || project.name
            })),
            value: filters.project,
            allLabel: 'All projects'
          },
          {
            key: 'assignedTo',
            label: 'Assigned to',
            options: users.map(option => ({
              value: option._id,
              label: option.name
            })),
            value: filters.assignedTo,
            allLabel: 'All users'
          }
        ]}
        onClear={resetFilters}
        onFilterChange={(key, value) => { setFilters(current => ({ ...current, [key]: value })); setPage(1); }}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        search={search}
        searchPlaceholder="Search by name, mobile, or email"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="field-label">Created from</span>
            <input className="field min-h-11" onChange={event => { setFilters(current => ({ ...current, from: event.target.value })); setPage(1); }} type="date" value={filters.from} />
          </label>
          <label className="block">
            <span className="field-label">Created to</span>
            <input className="field min-h-11" onChange={event => { setFilters(current => ({ ...current, to: event.target.value })); setPage(1); }} type="date" value={filters.to} />
          </label>
          <div className="flex items-end gap-2 md:col-span-2">
            <button className="btn-secondary min-h-11 px-4" onClick={resetFilters} type="button">Clear filters</button>
            <button className="btn-secondary min-h-11 px-4" onClick={() => load()} type="button">Refresh</button>
          </div>
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        emptyMessage="No leads match your filters"
        loading={loading}
        onRowClick={lead => navigate(`/leads/${getLeadId(lead)}`)}
        rows={leads}
      />

      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal
        description={editing ? 'Update customer and opportunity details.' : 'Capture a new customer opportunity.'}
        footer={(
          <>
            <button className="btn-secondary" disabled={busy} onClick={() => setFormOpen(false)} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy} form="lead-form" type="submit">
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create lead'}
            </button>
          </>
        )}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        open={formOpen}
        size="lg"
        title={editing ? 'Edit lead' : 'Add lead'}
      >
        <LeadForm
          busy={busy}
          canAssign={canAssignLead(user?.role)}
          lead={editing}
          onSubmit={saveLead}
          projects={projects}
          users={users}
        />
      </Modal>

      <ConfirmDialog
        busy={busy}
        confirmLabel="Delete lead"
        description={deleting ? `Delete ${getLeadName(deleting)} and all related records?` : ''}
        onClose={() => setDeleting(null)}
        onConfirm={removeLead}
        open={Boolean(deleting)}
        title="Delete this lead?"
      />
    </div>
  );
}
