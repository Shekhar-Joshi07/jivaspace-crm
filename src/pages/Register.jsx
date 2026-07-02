import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import AuthLayout from '../components/AuthLayout';
import { FormField } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = form;
      await register(payload);
      toast.success('Workspace account created');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your CRM account" subtitle="The first account becomes the workspace superadmin. Later users can be invited from User Management.">
      <form className="grid gap-4" onSubmit={submit}>
        <FormField label="Full name" required>
          <input autoFocus className="field" maxLength={100} onChange={event => setForm({ ...form, name: event.target.value })} required value={form.name} />
        </FormField>
        <FormField label="Work email" required>
          <input className="field" onChange={event => setForm({ ...form, email: event.target.value })} required type="email" value={form.email} />
        </FormField>
        <FormField label="Phone">
          <input className="field" maxLength={30} onChange={event => setForm({ ...form, phone: event.target.value })} type="tel" value={form.phone} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Password" required>
            <input className="field" minLength={8} onChange={event => setForm({ ...form, password: event.target.value })} required type="password" value={form.password} />
          </FormField>
          <FormField label="Confirm password" required>
            <input className="field" minLength={8} onChange={event => setForm({ ...form, confirmPassword: event.target.value })} required type="password" value={form.confirmPassword} />
          </FormField>
        </div>
        <p className="text-xs leading-5 text-ink-400">Use at least 8 characters with a letter and a number.</p>
        <button className="btn-primary mt-1 w-full" disabled={busy} type="submit"><UserPlus size={18} /> {busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">Already have an account? <Link className="font-bold text-brand-700" to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}
