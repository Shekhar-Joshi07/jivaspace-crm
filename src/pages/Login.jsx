import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { FormField } from '../components/UI';
import { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      await login(form);
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Sign in to your workspace" subtitle="Use your CRM account to continue where your team left off.">
      <form className="space-y-5" onSubmit={submit}>
        <FormField label="Email address" required>
          <input autoComplete="email" autoFocus className="field" onChange={event => setForm({ ...form, email: event.target.value })} placeholder="Write your email" required type="email" value={form.email} />
        </FormField>
        <FormField label="Password" required>
          <span className="relative block">
            <input autoComplete="current-password" className="field pr-12" minLength={8} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" required type={showPassword ? 'text' : 'password'} value={form.password} />
            <button aria-label={showPassword ? 'Hide password' : 'Show password'} className="icon-button absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(value => !value)} type="button">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </FormField>
        <div className="flex justify-end">
          <Link className="text-sm font-bold text-brand-700 hover:text-brand-900" to="/forgot-password">Forgot password?</Link>
        </div>
        <button className="btn-primary w-full" disabled={busy} type="submit">
          <LogIn size={18} /> {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">Setting up the workspace? <Link className="font-bold text-brand-700" to="/register">Create the first account</Link></p>
    </AuthLayout>
  );
}
