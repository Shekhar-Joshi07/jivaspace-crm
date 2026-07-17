import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md'
}) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = event => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

  return createPortal(
    <div className="fixed inset-0 z-[60] grid items-end bg-ink-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={onClose}>
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className={`flex max-h-[calc(100vh-2rem)] w-full ${widths[size] || widths.md} animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:mx-auto sm:max-h-[calc(100vh-2.5rem)] sm:rounded-3xl`}
        role="dialog"
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink-950" id="modal-title">{title}</h2>
            {description ? <p className="mt-1 text-sm text-ink-600">{description}</p> : null}
          </div>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-line bg-gray-50/70 px-5 py-4 sm:px-6">{footer}</footer> : null}
      </section>
    </div>,
    document.body
  );
}
