import { CheckCircle2, Sparkles } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function AuthLayout({ title, subtitle, children }) {
  const { isAuthenticated, bootstrapping } = useAuth();
  if (bootstrapping) return <Loader fullPage label="Restoring your session…" />;
  if (!bootstrapping && isAuthenticated) return <Navigate replace to="/" />;

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 font-display text-sm font-black">JS</span>
            <span className="font-display text-lg font-extrabold">Jivaspace CRM</span>
          </div>
          <div className="mt-24 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80">
              <Sparkles size={14} /> Your customer workspace
            </span>
            <h1 className="mt-6 font-display text-5xl font-black leading-[1.08] tracking-tight">Move every relationship forward.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/65">Leads, tasks, conversations, documents, and revenue—all organized around the people your team serves.</p>
          </div>
        </div>
        <div className="relative grid max-w-xl grid-cols-2 gap-4">
          {['One clear pipeline', 'Team-aware access', 'Every touchpoint logged', 'Reports that explain'].map(item => (
            <span className="flex items-center gap-2 text-sm font-semibold text-white/75" key={item}><CheckCircle2 className="text-brand-500" size={17} /> {item}</span>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10 sm:px-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 lg:hidden">
            <span className="inline-flex items-center gap-3 font-display text-lg font-extrabold text-brand-950">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-900 text-xs text-white">JS</span>
              Jivaspace CRM
            </span>
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
