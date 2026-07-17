import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import { FormField, PageHeader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { ROLE_LABELS, ROLES, canManageUsers } from '../utils/constants';

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export default function CreateUser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [reportingManagers, setReportingManagers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ROLES.SALES_EXECUTIVE,
    isActive: true,
    reportingManager: ''
  });

  useEffect(() => {
    let active = true;
    userService.list({ limit: 500, isActive: true }).then(result => {
      if (active) setReportingManagers(result.users);
    }).catch(error => {
      if (active) toast.error(getErrorMessage(error));
    });
    return () => { active = false; };
  }, []);

  const save = async event => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const { confirmPassword, ...payload } = form;
      await userService.create({
        ...payload,
        reportingManager: form.reportingManager || undefined
      });
      toast.success('User created');
      navigate('/users');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (!canManageUsers(user?.role)) {
    return (
      <div className="animate-fade-in space-y-6">
        <PageHeader eyebrow="Administration" title="Create User" description="You do not have permission to create users." />
        <Link className="btn-secondary" to="/users"><ArrowLeft size={17} /> Back to users</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link className="btn-secondary" to="/users"><ArrowLeft size={17} /> Back to users</Link>
      </div>
      <section className="card p-5 sm:p-6">
        <PageHeader
          description="Create a new CRM account and assign the correct role."
          eyebrow="Administration"
          title="Create User"
        />
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <FormField className="sm:col-span-2" label="Full name" required>
            <input autoFocus className="field" onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required value={form.name} />
          </FormField>
          <FormField label="Email" required>
            <input className="field" onChange={event => setForm(current => ({ ...current, email: event.target.value }))} required type="email" value={form.email} />
          </FormField>
          <FormField label="Phone">
            <input className="field" onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} value={form.phone} />
          </FormField>
          <FormField label="Password" required>
            <input className="field" minLength={8} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} required type="password" value={form.password} />
          </FormField>
          <FormField label="Confirm password" required>
            <input className="field" minLength={8} onChange={event => setForm(current => ({ ...current, confirmPassword: event.target.value }))} required type="password" value={form.confirmPassword} />
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
            <select className="field" onChange={event => setForm(current => ({ ...current, reportingManager: event.target.value }))} value={form.reportingManager}>
              <option value="">No reporting manager</option>
              {reportingManagers
                .filter(manager => ['superadmin', 'admin'].includes(manager.role))
                .map(manager => {
                  const managerId = manager._id || manager.id;
                  return <option key={managerId} value={managerId}>{manager.name} ({ROLE_LABELS[manager.role] || manager.role})</option>;
                })}
            </select>
          </FormField>
          <div className="sm:col-span-2 flex justify-end">
            <button className="btn-primary" disabled={busy} type="submit">
              <Save size={17} />
              {busy ? 'Saving…' : 'Create user'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
