import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { FormField, PageHeader, Pagination, StatusBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { ROLE_LABELS, ROLES, canManageUsers } from '../utils/constants';
import { formatDate } from '../utils/formatDate';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: ROLES.SALES_EXECUTIVE,
  isActive: true,
  employeeId: '',
  reportingManager: ''
};

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export default function Users() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [deleting, setDeleting] = useState(null);
  const canManage = canManageUsers(user?.role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userService.list({
        page,
        limit: 10,
        search: search || undefined,
        role: filters.role || undefined,
        isActive: filters.status === '' ? undefined : filters.status === 'Active'
      });
      setUsers(result.users);
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

  const openModal = record => {
    setEditing(record || null);
    setForm(record ? {
      name: record.name || '',
      email: record.email || '',
      phone: record.phone || '',
      password: '',
      role: record.role || ROLES.SALES_EXECUTIVE,
      isActive: record.isActive ?? true,
      employeeId: record.employeeId || '',
      reportingManager: record.reportingManager?._id || record.reportingManager || ''
    } : initialForm);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        ...form,
        employeeId: form.employeeId || undefined,
        reportingManager: form.reportingManager || undefined
      };
      if (editing) {
        const updatePayload = { ...payload };
        if (!updatePayload.password) delete updatePayload.password;
        await userService.update(editing._id, updatePayload);
        toast.success('User updated');
      } else {
        await userService.create(payload);
        toast.success('User created');
      }
      setEditing(null);
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
      await userService.remove(deleting._id);
      toast.success('User deactivated');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'name',
      header: 'User',
      render: record => (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 font-black text-brand-700">
            {record.name?.slice(0, 1)?.toUpperCase() || 'U'}
          </span>
          <div>
            <p className="font-bold text-ink-950">{record.name}</p>
            <p className="text-xs text-ink-400">{record.email}</p>
          </div>
        </div>
      )
    },
    { key: 'role', header: 'Role', render: record => ROLE_LABELS[record.role] || record.role },
    { key: 'phone', header: 'Phone', render: record => record.phone || '—' },
    { key: 'status', header: 'Status', render: record => <StatusBadge value={record.isActive ? 'Active' : 'Inactive'} /> },
    { key: 'lastLoginAt', header: 'Last login', render: record => formatDate(record.lastLoginAt) },
    {
      key: 'actions',
      header: '',
      cellClassName: 'w-28',
      render: record => (
        <div className="flex justify-end gap-1">
          {canManage ? <button className="icon-button" onClick={() => openModal(record)} type="button"><Pencil size={17} /></button> : null}
          {canManage && String(record._id) !== String(user?._id) ? <button className="icon-button text-red-600 hover:bg-red-50" onClick={() => setDeleting(record)} type="button"><Trash2 size={17} /></button> : null}
        </div>
      )
    }
  ]), [canManage, user?._id]);

  if (loading) return <Loader fullPage label="Loading users…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={canManage ? <Link className="btn-primary" to="/users/create"><Plus size={17} /> Create user</Link> : null}
        description="Manage CRM accounts, roles, and activation state."
        eyebrow="Administration"
        title="Users"
      />

      <FilterBar
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: roleOptions,
            value: filters.role,
            allLabel: 'All roles'
          },
          {
            key: 'status',
            label: 'Status',
            options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }],
            value: filters.status,
            allLabel: 'All statuses'
          }
        ]}
        onClear={() => { setSearch(''); setFilters({ role: '', status: '' }); setPage(1); }}
        onFilterChange={(key, value) => { setFilters(current => ({ ...current, [key]: value })); setPage(1); }}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        search={search}
        searchPlaceholder="Search users by name, email, phone, or employee id"
      />

      <DataTable
        columns={columns}
        emptyMessage="No users found"
        loading={loading}
        rows={users}
      />

      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal
        description={editing ? 'Update account details.' : 'Create a new CRM user.'}
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setEditing(null)} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy} onClick={save} type="button">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create user'}</button>
          </>
        )}
        onClose={() => setEditing(null)}
        open={Boolean(editing)}
        size="md"
        title={editing ? 'Edit user' : 'Create user'}
      >
        <UserForm form={form} setForm={setForm} editing={Boolean(editing)} />
      </Modal>

      <ConfirmDialog
        busy={busy}
        confirmLabel="Deactivate user"
        description={deleting ? `Deactivate ${deleting.name}?` : ''}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        open={Boolean(deleting)}
        title="Deactivate this user?"
      />
    </div>
  );
}

function UserForm({ form, setForm, editing }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField className="sm:col-span-2" label="Full name" required>
        <input autoFocus className="field" onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required value={form.name} />
      </FormField>
      <FormField label="Email" required>
        <input className="field" disabled={editing} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} required type="email" value={form.email} />
      </FormField>
      <FormField label="Phone">
        <input className="field" onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} value={form.phone} />
      </FormField>
      {!editing ? (
        <FormField className="sm:col-span-2" label="Temporary password" required>
          <input className="field" minLength={8} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} required type="password" value={form.password} />
        </FormField>
      ) : null}
      <FormField label="Employee ID">
        <input className="field" onChange={event => setForm(current => ({ ...current, employeeId: event.target.value }))} value={form.employeeId} />
      </FormField>
      <FormField label="Role">
        <select className="field" onChange={event => setForm(current => ({ ...current, role: event.target.value }))} value={form.role}>
          {roleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </FormField>
      <FormField label="Status">
        <select className="field" onChange={event => setForm(current => ({ ...current, isActive: event.target.value === 'true' }))} value={String(form.isActive)}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </FormField>
      <FormField label="Reporting manager">
        <input className="field" onChange={event => setForm(current => ({ ...current, reportingManager: event.target.value }))} placeholder="Manager user id" value={form.reportingManager} />
      </FormField>
    </div>
  );
}
