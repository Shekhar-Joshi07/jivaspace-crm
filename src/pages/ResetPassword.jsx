import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import AuthLayout from '../components/AuthLayout';
import { FormField } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateCurrentUser } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      const result = await authService.resetPassword(token, form.password);
      localStorage.setItem('crm_token', result.token);
      updateCurrentUser(result.user);
      toast.success('Password updated');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Your new password must be at least 8 characters and include a letter and number.">
      <form className="space-y-5" onSubmit={submit}>
        <FormField label="New password" required>
          <input autoFocus className="field" minLength={8} onChange={event => setForm({ ...form, password: event.target.value })} required type="password" value={form.password} />
        </FormField>
        <FormField label="Confirm password" required>
          <input className="field" minLength={8} onChange={event => setForm({ ...form, confirmPassword: event.target.value })} required type="password" value={form.confirmPassword} />
        </FormField>
        <button className="btn-primary w-full" disabled={busy} type="submit"><KeyRound size={18} /> {busy ? 'Updating…' : 'Set new password'}</button>
      </form>
    </AuthLayout>
  );
}
