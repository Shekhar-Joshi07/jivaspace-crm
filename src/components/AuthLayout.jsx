import { CheckCircle2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function AuthLayout({ title, subtitle, children }) {
  const { isAuthenticated, bootstrapping } = useAuth();
  if (bootstrapping) return <Loader fullPage label="Restoring your session…" />;
  if (!bootstrapping && isAuthenticated) return <Navigate replace to="/" />;

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent-500/25 blur-3xl" />
        <div className="relative z-10 flex flex-1 items-center justify-center pointer-events-none">
          <img
            alt="Jiva Space Realty"
            className="h-52 w-auto object-contain"
            src="/jiva-space-logo.png"
          />
        </div>
        <div className="relative z-10 grid max-w-xl grid-cols-2 gap-4 pointer-events-none">
          {['One clear pipeline', 'Team-aware access', 'Every touchpoint logged', 'Reports that explain'].map(item => (
            <span className="flex items-center gap-2 text-sm font-semibold text-white/85" key={item}><CheckCircle2 className="text-white" size={17} /> {item}</span>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10 sm:px-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 lg:hidden">
            <div className="inline-flex rounded-2xl bg-brand-500 px-4 py-3 shadow-card">
              <img alt="Jiva Space Realty" className="h-24 w-auto" src="/jiva-space-logo.png" />
            </div>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-brand-600">Welcome</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
