import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-5 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-100 text-brand-800"><SearchX size={28} /></span>
        <p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-brand-600">404</p>
        <h1 className="mt-2 font-display text-3xl font-black">This page wandered off.</h1>
        <p className="mt-2 text-sm text-ink-600">The CRM record or page you requested could not be found.</p>
        <Link className="btn-primary mt-6" to="/"><ArrowLeft size={17} /> Back to dashboard</Link>
      </div>
    </main>
  );
}
