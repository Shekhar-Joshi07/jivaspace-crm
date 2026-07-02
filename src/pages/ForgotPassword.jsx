import { ArrowLeft, Mail } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import AuthLayout from '../components/AuthLayout';
import { FormField } from '../components/UI';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await authService.forgotPassword(email);
      setSent(true);
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your work email. If the account exists, we’ll send a time-limited reset link.">
      {sent ? (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm leading-6 text-brand-900">
          <Mail className="mb-3" size={22} />
          Check your inbox and follow the reset link. You can close this page safely.
        </div>
      ) : (
        <form className="space-y-5" onSubmit={submit}>
          <FormField label="Email address" required>
            <input autoFocus className="field" onChange={event => setEmail(event.target.value)} required type="email" value={email} />
          </FormField>
          <button className="btn-primary w-full" disabled={busy} type="submit"><Mail size={18} /> {busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700" to="/login"><ArrowLeft size={16} /> Back to sign in</Link>
    </AuthLayout>
  );
}
