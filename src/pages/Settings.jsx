import { KeyRound, LockKeyhole, Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import { FormField, PageHeader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ROLE_LABELS } from '../utils/constants';

export default function Settings() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crm_preferences')) || { compactTables: false, emailDigest: true };
    } catch {
      return { compactTables: false, emailDigest: true };
    }
  });

  const changePassword = async event => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('New passwords do not match');
    setBusy(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const savePreferences = () => {
    localStorage.setItem('crm_preferences', JSON.stringify(preferences));
    toast.success('Preferences saved on this device');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader description="Your profile, security, and local workspace preferences." eyebrow="Account" title="Settings" />
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 font-display text-xl font-black text-brand-800">{user?.name?.slice(0, 1).toUpperCase()}</span>
              <div><h2 className="font-display text-lg font-extrabold">{user?.name}</h2><p className="text-sm text-ink-400">{ROLE_LABELS[user?.role]}</p></div>
            </div>
            <div className="mt-6 space-y-3">
              <p className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm text-ink-600"><Mail size={17} /> {user?.email}</p>
              <p className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm text-ink-600"><Phone size={17} /> {user?.phone || 'No phone recorded'}</p>
              <p className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm text-ink-600"><ShieldCheck size={17} /> {user?.isActive === false ? 'Inactive account' : 'Active account'}</p>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><UserRound size={18} /></span><div><h2 className="font-display text-base font-extrabold">Workspace preferences</h2><p className="text-xs text-ink-400">Saved in this browser</p></div></div>
            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line p-3 text-sm font-semibold"><span>Compact data tables</span><input checked={preferences.compactTables} onChange={event => setPreferences({ ...preferences, compactTables: event.target.checked })} type="checkbox" /></label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line p-3 text-sm font-semibold"><span>Email digest reminders</span><input checked={preferences.emailDigest} onChange={event => setPreferences({ ...preferences, emailDigest: event.target.checked })} type="checkbox" /></label>
            </div>
            <button className="btn-secondary mt-4 w-full" onClick={savePreferences} type="button"><Save size={17} /> Save preferences</button>
          </section>
        </div>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><LockKeyhole size={19} /></span><div><h2 className="font-display text-lg font-extrabold">Change password</h2><p className="mt-0.5 text-sm text-ink-600">Use a strong password that you do not reuse elsewhere.</p></div></div>
          <form className="mt-6 max-w-xl space-y-4" onSubmit={changePassword}>
            <FormField label="Current password" required><input autoComplete="current-password" className="field" onChange={event => setPasswords({ ...passwords, currentPassword: event.target.value })} required type="password" value={passwords.currentPassword} /></FormField>
            <FormField hint="At least 8 characters with a letter and number." label="New password" required><input autoComplete="new-password" className="field" minLength={8} onChange={event => setPasswords({ ...passwords, newPassword: event.target.value })} required type="password" value={passwords.newPassword} /></FormField>
            <FormField label="Confirm new password" required><input autoComplete="new-password" className="field" minLength={8} onChange={event => setPasswords({ ...passwords, confirmPassword: event.target.value })} required type="password" value={passwords.confirmPassword} /></FormField>
            <button className="btn-primary" disabled={busy} type="submit"><KeyRound size={17} /> {busy ? 'Updating…' : 'Update password'}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
