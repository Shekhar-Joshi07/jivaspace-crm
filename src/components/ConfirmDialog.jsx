import Modal from './Modal';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm action',
  description,
  confirmLabel = 'Confirm',
  busy = false,
  danger = true
}) {
  return (
    <Modal
      description={description}
      footer={(
        <>
          <button className="btn-secondary" disabled={busy} onClick={onClose} type="button">Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} disabled={busy} onClick={onConfirm} type="button">
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      )}
      onClose={onClose}
      open={open}
      size="sm"
      title={title}
    >
      <p className="text-sm leading-6 text-ink-600">This action may affect related CRM records. Please confirm that you want to continue.</p>
    </Modal>
  );
}
