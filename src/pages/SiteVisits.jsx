import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { FormField, PageHeader, Pagination, StatusBadge } from '../components/UI';
import { leadService } from '../services/leadService';
import { projectService } from '../services/projectService';
import { siteVisitService } from '../services/siteVisitService';
import { userService } from '../services/userService';
import { CRM_ROLES, SITE_VISIT_STATUSES } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/formatDate';

const emptyForm = {
  lead: '',
  project: '',
  visitDate: '',
  visitTime: '',
  assignedSalesPerson: '',
  visitStatus: 'Scheduled',
  customerFeedback: '',
  nextFollowUpDate: ''
};

export default function SiteVisits() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [siteVisits, setSiteVisits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [visitResult, leadResult, projectResult, userResult] = await Promise.all([
        siteVisitService.list({
          page,
          limit: 10,
          search: search || undefined,
          visitStatus: status || undefined
        }),
        leadService.list({ limit: 200 }),
        projectService.list({ limit: 200 }),
        userService.list({ limit: 200, isActive: true })
      ]);
      setSiteVisits(visitResult.siteVisits);
      setPagination(visitResult.pagination);
      setLeads(leadResult.leads);
      setProjects(projectResult.projects);
      setUsers(userResult.users);
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

  const open = visit => {
    setEditing(visit || null);
    setModalOpen(true);
    setForm(visit ? {
      lead: visit.lead?._id || visit.lead || '',
      project: visit.project?._id || visit.project || '',
      visitDate: visit.visitDate ? String(visit.visitDate).slice(0, 10) : '',
      visitTime: visit.visitTime || '',
      assignedSalesPerson: visit.assignedSalesPerson?._id || visit.assignedSalesPerson || '',
      visitStatus: visit.visitStatus || 'Scheduled',
      customerFeedback: visit.customerFeedback || '',
      nextFollowUpDate: visit.nextFollowUpDate ? String(visit.nextFollowUpDate).slice(0, 10) : ''
    } : emptyForm);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        lead: form.lead,
        project: form.project,
        visitDate: form.visitDate,
        visitTime: form.visitTime || undefined,
        assignedSalesPerson: form.assignedSalesPerson || undefined,
        visitStatus: form.visitStatus,
        customerFeedback: form.customerFeedback || undefined,
        nextFollowUpDate: form.nextFollowUpDate || undefined
      };
      if (editing) {
        await siteVisitService.update(editing._id, payload);
        toast.success('Site visit updated');
      } else {
        await siteVisitService.create(payload);
        toast.success('Site visit created');
      }
      setEditing(null);
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await siteVisitService.remove(deleting._id);
      toast.success('Site visit deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => ([
    { key: 'lead', header: 'Lead', render: row => row.lead?.customerName || row.lead?.name || '—' },
    { key: 'project', header: 'Project', render: row => row.project?.projectName || row.project?.name || '—' },
    { key: 'visitDate', header: 'Visit Date', render: row => formatDate(row.visitDate) },
    { key: 'visitTime', header: 'Time', render: row => row.visitTime || '—' },
    { key: 'status', header: 'Status', render: row => <StatusBadge value={row.visitStatus} /> },
    { key: 'assigned', header: 'Assigned to', render: row => row.assignedSalesPerson?.name || '—' },
    { key: 'updatedAt', header: 'Updated', render: row => formatDateTime(row.updatedAt) },
    { key: 'actions', header: '', cellClassName: 'w-28', render: row => <div className="flex justify-end gap-1"><button className="icon-button" onClick={() => open(row)} type="button"><Pencil size={17} /></button><button className="icon-button text-red-600 hover:bg-red-50" onClick={() => setDeleting(row)} type="button"><Trash2 size={17} /></button></div> }
  ]), []);

  if (loading) return <Loader fullPage label="Loading site visits…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={<button className="btn-primary" onClick={() => open(null)} type="button"><Plus size={17} /> Add site visit</button>}
        description="Plan and track property visits with follow-up context."
        eyebrow="Operations"
        title="Site Visits"
      />

      <FilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: SITE_VISIT_STATUSES,
            value: status,
            allLabel: 'All statuses'
          }
        ]}
        onClear={() => { setSearch(''); setStatus(''); setPage(1); }}
        onFilterChange={(_, value) => { setStatus(value); setPage(1); }}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        search={search}
        searchPlaceholder="Search site visits"
      />

      <DataTable columns={columns} emptyMessage="No site visits found" loading={loading} rows={siteVisits} />
      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal
        description="Create or edit a site visit."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => { setEditing(null); setModalOpen(false); }} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy || !form.lead || !form.project || !form.visitDate} onClick={save} type="button">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create visit'}</button>
          </>
        )}
        onClose={() => { setEditing(null); setModalOpen(false); }}
        open={modalOpen}
        size="lg"
        title={editing ? 'Edit site visit' : 'Create site visit'}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Lead" required>
            <select className="field" onChange={event => setForm(current => ({ ...current, lead: event.target.value }))} value={form.lead}>
              <option value="">Select lead</option>
              {leads.map(lead => <option key={lead._id} value={lead._id}>{lead.customerName || lead.name}</option>)}
            </select>
          </FormField>
          <FormField label="Project" required>
            <select className="field" onChange={event => setForm(current => ({ ...current, project: event.target.value }))} value={form.project}>
              <option value="">Select project</option>
              {projects.map(project => <option key={project._id} value={project._id}>{project.projectName}</option>)}
            </select>
          </FormField>
          <FormField label="Visit date" required>
            <input className="field" onChange={event => setForm(current => ({ ...current, visitDate: event.target.value }))} type="date" value={form.visitDate} />
          </FormField>
          <FormField label="Visit time">
            <input className="field" onChange={event => setForm(current => ({ ...current, visitTime: event.target.value }))} type="time" value={form.visitTime} />
          </FormField>
          <FormField label="Assigned salesperson">
            <select className="field" onChange={event => setForm(current => ({ ...current, assignedSalesPerson: event.target.value }))} value={form.assignedSalesPerson}>
              <option value="">Select user</option>
          {users.filter(user => CRM_ROLES.includes(user.role)).map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
            </select>
          </FormField>
          <FormField label="Visit status">
            <select className="field" onChange={event => setForm(current => ({ ...current, visitStatus: event.target.value }))} value={form.visitStatus}>
              {SITE_VISIT_STATUSES.map(item => <option key={item}>{item}</option>)}
            </select>
          </FormField>
          <FormField className="sm:col-span-2" label="Customer feedback">
            <textarea className="field min-h-28 resize-y" onChange={event => setForm(current => ({ ...current, customerFeedback: event.target.value }))} value={form.customerFeedback} />
          </FormField>
          <FormField className="sm:col-span-2" label="Next follow-up date">
            <input className="field" onChange={event => setForm(current => ({ ...current, nextFollowUpDate: event.target.value }))} type="date" value={form.nextFollowUpDate} />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        busy={busy}
        confirmLabel="Delete visit"
        description={deleting ? `Delete the site visit for ${deleting.lead?.customerName || deleting.lead?.name || 'this lead'}?` : ''}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        open={Boolean(deleting)}
        title="Delete this site visit?"
      />
    </div>
  );
}
