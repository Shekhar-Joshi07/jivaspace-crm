import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { FormField, PageHeader, Pagination, StatusBadge } from '../components/UI';
import { bookingService } from '../services/bookingService';
import { leadService } from '../services/leadService';
import { projectService } from '../services/projectService';
import { propertyUnitService } from '../services/propertyUnitService';
import { BOOKING_STATUSES } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatDate';

const paymentModes = ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card', 'Other'];
const emptyForm = {
  lead: '',
  project: '',
  propertyUnit: '',
  bookingAmount: '',
  bookingDate: '',
  paymentMode: 'Cash',
  bookingStatus: 'Pending',
  documents: '',
  remarks: ''
};

export default function Bookings() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingResult, leadResult, projectResult] = await Promise.all([
        bookingService.list({
          page,
          limit: 10,
          search: search || undefined,
          bookingStatus: status || undefined
        }),
        leadService.list({ limit: 200 }),
        projectService.list({ limit: 200 })
      ]);
      setBookings(bookingResult.bookings);
      setPagination(bookingResult.pagination);
      setLeads(leadResult.leads);
      setProjects(projectResult.projects);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!form.project) {
      setUnits([]);
      return;
    }
    propertyUnitService.list({ limit: 500, project: form.project })
      .then(result => setUnits(result.propertyUnits))
      .catch(() => setUnits([]));
  }, [form.project]);

  const open = booking => {
    setEditing(booking || null);
    setModalOpen(true);
    setForm(booking ? {
      lead: booking.lead?._id || booking.lead || '',
      project: booking.project?._id || booking.project || '',
      propertyUnit: booking.propertyUnit?._id || booking.propertyUnit || '',
      bookingAmount: booking.bookingAmount ?? '',
      bookingDate: booking.bookingDate ? String(booking.bookingDate).slice(0, 10) : '',
      paymentMode: booking.paymentMode || 'Cash',
      bookingStatus: booking.bookingStatus || 'Pending',
      documents: Array.isArray(booking.documents) ? booking.documents.join(', ') : '',
      remarks: booking.remarks || ''
    } : emptyForm);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        lead: form.lead,
        project: form.project,
        propertyUnit: form.propertyUnit,
        bookingAmount: form.bookingAmount === '' ? undefined : Number(form.bookingAmount),
        bookingDate: form.bookingDate || undefined,
        paymentMode: form.paymentMode,
        bookingStatus: form.bookingStatus,
        documents: form.documents.split(',').map(item => item.trim()).filter(Boolean),
        remarks: form.remarks || undefined
      };
      if (editing) {
        await bookingService.update(editing._id, payload);
        toast.success('Booking updated');
      } else {
        await bookingService.create(payload);
        toast.success('Booking created');
      }
      setEditing(null);
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await bookingService.remove(deleting._id);
      toast.success('Booking deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => ([
    { key: 'lead', header: 'Lead', render: row => row.lead?.customerName || row.lead?.name || '—' },
    { key: 'project', header: 'Project', render: row => row.project?.projectName || row.project?.name || '—' },
    { key: 'unit', header: 'Unit', render: row => row.propertyUnit?.unitNumber || '—' },
    { key: 'amount', header: 'Amount', render: row => formatCurrency(row.bookingAmount) },
    { key: 'date', header: 'Booking date', render: row => formatDate(row.bookingDate) },
    { key: 'status', header: 'Status', render: row => <StatusBadge value={row.bookingStatus} /> },
    { key: 'paymentMode', header: 'Payment', render: row => row.paymentMode || '—' },
    { key: 'actions', header: '', cellClassName: 'w-28', render: row => <div className="flex justify-end gap-1"><button className="icon-button" onClick={() => open(row)} type="button"><Pencil size={17} /></button><button className="icon-button text-red-600 hover:bg-red-50" onClick={() => setDeleting(row)} type="button"><Trash2 size={17} /></button></div> }
  ]), []);

  if (loading) return <Loader fullPage label="Loading bookings…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={<button className="btn-primary" onClick={() => open(null)} type="button"><Plus size={17} /> Add booking</button>}
        description="Create bookings and keep unit state aligned."
        eyebrow="Operations"
        title="Bookings"
      />

      <FilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: BOOKING_STATUSES,
            value: status,
            allLabel: 'All statuses'
          }
        ]}
        onClear={() => { setSearch(''); setStatus(''); setPage(1); }}
        onFilterChange={(_, value) => { setStatus(value); setPage(1); }}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        search={search}
        searchPlaceholder="Search bookings"
      />

      <DataTable columns={columns} emptyMessage="No bookings found" loading={loading} rows={bookings} />
      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal
        description="Create or edit a booking."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => { setEditing(null); setModalOpen(false); }} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy || !form.lead || !form.project || !form.propertyUnit} onClick={save} type="button">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create booking'}</button>
          </>
        )}
        onClose={() => { setEditing(null); setModalOpen(false); }}
        open={modalOpen}
        size="lg"
        title={editing ? 'Edit booking' : 'Create booking'}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Lead" required>
            <select className="field" onChange={event => setForm(current => ({ ...current, lead: event.target.value }))} value={form.lead}>
              <option value="">Select lead</option>
              {leads.map(lead => <option key={lead._id} value={lead._id}>{lead.customerName || lead.name}</option>)}
            </select>
          </FormField>
          <FormField label="Project" required>
            <select className="field" onChange={event => setForm(current => ({ ...current, project: event.target.value, propertyUnit: '' }))} value={form.project}>
              <option value="">Select project</option>
              {projects.map(project => <option key={project._id} value={project._id}>{project.projectName}</option>)}
            </select>
          </FormField>
          <FormField label="Property unit" required>
            <select className="field" onChange={event => setForm(current => ({ ...current, propertyUnit: event.target.value }))} value={form.propertyUnit}>
              <option value="">Select unit</option>
              {units.map(unit => <option key={unit._id} value={unit._id}>{unit.unitNumber}</option>)}
            </select>
          </FormField>
          <FormField label="Booking amount">
            <input className="field" min="0" onChange={event => setForm(current => ({ ...current, bookingAmount: event.target.value }))} type="number" value={form.bookingAmount} />
          </FormField>
          <FormField label="Booking date">
            <input className="field" onChange={event => setForm(current => ({ ...current, bookingDate: event.target.value }))} type="date" value={form.bookingDate} />
          </FormField>
          <FormField label="Payment mode">
            <select className="field" onChange={event => setForm(current => ({ ...current, paymentMode: event.target.value }))} value={form.paymentMode}>
              {paymentModes.map(mode => <option key={mode}>{mode}</option>)}
            </select>
          </FormField>
          <FormField label="Booking status">
            <select className="field" onChange={event => setForm(current => ({ ...current, bookingStatus: event.target.value }))} value={form.bookingStatus}>
              {BOOKING_STATUSES.map(item => <option key={item}>{item}</option>)}
            </select>
          </FormField>
          <FormField className="sm:col-span-2" label="Documents">
            <textarea className="field min-h-24 resize-y" onChange={event => setForm(current => ({ ...current, documents: event.target.value }))} placeholder="Document URL or file ID, separated by commas" value={form.documents} />
          </FormField>
          <FormField className="sm:col-span-2" label="Remarks">
            <textarea className="field min-h-28 resize-y" onChange={event => setForm(current => ({ ...current, remarks: event.target.value }))} value={form.remarks} />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        busy={busy}
        confirmLabel="Delete booking"
        description={deleting ? `Delete booking for ${deleting.lead?.customerName || deleting.lead?.name || 'this lead'}?` : ''}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        open={Boolean(deleting)}
        title="Delete this booking?"
      />
    </div>
  );
}
