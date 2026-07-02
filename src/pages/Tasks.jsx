import { Check, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import Table from '../components/Table';
import TaskForm from '../components/TaskForm';
import { PageHeader, Pagination, StatusBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { leadService } from '../services/leadService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { ADMIN_ROLES, PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { formatDate, isOverdue } from '../utils/formatDate';

export default function Tasks() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultLead = searchParams.get('lead') || '';
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', overdue: '', relatedLead: defaultLead });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const canAssign = ADMIN_ROLES.includes(user?.role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await taskService.list({
        page,
        limit: 20,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        overdue: filters.overdue || undefined,
        relatedLead: filters.relatedLead || undefined
      });
      setTasks(result.tasks);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    leadService.list({ limit: 100 })
      .then(result => setLeads(result.leads))
      .catch(() => setLeads([]));
    if (canAssign) userService.list({ limit: 100, isActive: true }).then(result => setUsers(result.users)).catch(() => setUsers([]));
  }, [canAssign]);

  const saveTask = async payload => {
    setBusy(true);
    try {
      if (editing) {
        await taskService.update(editing._id, payload);
        toast.success('Task updated');
      } else {
        await taskService.create(payload);
        toast.success('Task created');
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const completeTask = async task => {
    try {
      await taskService.update(task._id, { status: 'Completed' });
      toast.success('Task completed');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const removeTask = async () => {
    setBusy(true);
    try {
      await taskService.remove(deleting._id);
      toast.success('Task deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Task',
      render: task => (
        <div>
          <p className="font-bold text-ink-950">{task.title}</p>
          {task.description ? <p className="mt-1 max-w-xs truncate text-xs text-ink-400">{task.description}</p> : null}
        </div>
      )
    },
    { key: 'status', header: 'Status', render: task => <StatusBadge value={task.status} /> },
    { key: 'priority', header: 'Priority', render: task => <StatusBadge value={task.priority} /> },
    {
      key: 'dueDate',
      header: 'Due',
      render: task => <span className={isOverdue(task.dueDate, task.status) ? 'font-bold text-red-600' : ''}>{formatDate(task.dueDate)}{isOverdue(task.dueDate, task.status) ? ' · Overdue' : ''}</span>
    },
    { key: 'lead', header: 'Lead', render: task => task.relatedLead || task.lead ? <Link className="font-semibold text-brand-700 hover:underline" to={`/leads/${(task.relatedLead || task.lead)._id}`}>{(task.relatedLead || task.lead).name}</Link> : '—' },
    { key: 'assignedTo', header: 'Owner', render: task => task.assignedTo?.name || '—' },
    {
      key: 'actions',
      header: '',
      render: task => (
        <div className="flex justify-end gap-1">
          {!['Completed', 'Cancelled'].includes(task.status) ? <button aria-label="Complete task" className="icon-button text-emerald-700 hover:bg-emerald-50" onClick={() => completeTask(task)} type="button"><Check size={17} /></button> : null}
          <button aria-label="Edit task" className="icon-button" onClick={() => { setEditing(task); setFormOpen(true); }} type="button"><Pencil size={17} /></button>
          <button aria-label="Delete task" className="icon-button text-red-600 hover:bg-red-50" onClick={() => setDeleting(task)} type="button"><Trash2 size={17} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader actions={<button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }} type="button"><Plus size={17} /> Add task</button>} description="Plan follow-ups, assign work, and keep deadlines visible." eyebrow="Execution" title="Tasks" />
      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <select className="field" onChange={event => { setFilters({ ...filters, status: event.target.value }); setPage(1); }} value={filters.status}><option value="">All statuses</option>{TASK_STATUSES.map(status => <option key={status}>{status}</option>)}</select>
        <select className="field" onChange={event => { setFilters({ ...filters, priority: event.target.value }); setPage(1); }} value={filters.priority}><option value="">All priorities</option>{PRIORITIES.map(priority => <option key={priority}>{priority}</option>)}</select>
        <select className="field" onChange={event => { setFilters({ ...filters, overdue: event.target.value }); setPage(1); }} value={filters.overdue}><option value="">All due dates</option><option value="true">Overdue only</option></select>
        <select className="field" onChange={event => { setFilters({ ...filters, relatedLead: event.target.value }); setPage(1); }} value={filters.relatedLead}><option value="">All leads</option>{leads.map(lead => <option key={lead._id} value={lead._id}>{lead.name}</option>)}</select>
      </div>
      <Table columns={columns} emptyMessage="No tasks match these filters" loading={loading} rows={tasks} />
      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal description="Connect work to a customer and choose when it should be completed." footer={<><button className="btn-secondary" onClick={() => setFormOpen(false)} type="button">Cancel</button><button className="btn-primary" disabled={busy} form="task-form" type="submit"><CheckCircle2 size={17} /> {busy ? 'Saving…' : editing ? 'Save changes' : 'Create task'}</button></>} onClose={() => { setFormOpen(false); setEditing(null); }} open={formOpen} size="md" title={editing ? 'Edit task' : 'Add task'}>
        <TaskForm busy={busy} canAssign={canAssign} defaultLead={defaultLead} leads={leads} onSubmit={saveTask} task={editing} users={users} />
      </Modal>
      <ConfirmDialog busy={busy} confirmLabel="Delete task" description={deleting ? `Delete “${deleting.title}”?` : ''} onClose={() => setDeleting(null)} onConfirm={removeTask} open={Boolean(deleting)} title="Delete this task?" />
    </div>
  );
}
