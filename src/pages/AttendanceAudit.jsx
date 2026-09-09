import { ArrowLeft, MapPinned, Save, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { FormField, PageHeader, Pagination, StatusBadge } from '../components/UI';
import { attendanceService } from '../services/attendanceService';
import { formatDateTime } from '../utils/formatDate';

const blankConfiguration = { name: '', latitude: '', longitude: '', radiusMeters: 200, isEnabled: true };

export default function AttendanceAudit() {
  const [configuration, setConfiguration] = useState(blankConfiguration);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', status: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [savedConfiguration, audit] = await Promise.all([
        attendanceService.getConfiguration(),
        attendanceService.audit({ page, limit: 20, ...filters })
      ]);
      if (savedConfiguration) setConfiguration(savedConfiguration);
      setRecords(audit.records);
      setPagination(audit.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const saveConfiguration = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await attendanceService.saveConfiguration({
        ...configuration,
        latitude: Number(configuration.latitude),
        longitude: Number(configuration.longitude),
        radiusMeters: Number(configuration.radiusMeters)
      });
      setConfiguration(saved);
      toast.success('Attendance location saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: record => <div><p className="font-bold text-ink-950">{record.user?.name || 'Deleted user'}</p><p className="text-xs text-ink-400">{record.user?.email || '—'}</p></div>
    },
    { key: 'dateKey', header: 'Date', render: record => record.dateKey },
    { key: 'checkIn', header: 'Check-in', render: record => formatDateTime(record.checkIn?.at) },
    { key: 'checkOut', header: 'Check-out', render: record => record.checkOut ? formatDateTime(record.checkOut.at) : '—' },
    {
      key: 'status',
      header: 'Status',
      render: record => <StatusBadge value={record.attendanceStatus} />
    },
    {
      key: 'location',
      header: 'Verification',
      render: record => <span className="text-sm text-ink-600">In {record.checkIn?.distanceMeters} m · Out {record.checkOut?.distanceMeters ?? '—'} m</span>
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={<Link className="btn-secondary" to="/attendance"><ArrowLeft size={17} /> My attendance</Link>}
        description="Set the permitted office geofence and review every employee check-in and check-out."
        eyebrow="Administration"
        title="Attendance Audit"
      />

      <section className="card p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><MapPinned size={20} /></span><div><h2 className="font-display text-lg font-extrabold">Office attendance location</h2><p className="text-sm text-ink-600">Only users inside this radius can check in or check out.</p></div></div>
        <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={saveConfiguration}>
          <FormField className="xl:col-span-1" label="Location name" required><input className="field" onChange={event => setConfiguration(current => ({ ...current, name: event.target.value }))} required value={configuration.name || ''} /></FormField>
          <FormField label="Latitude" required><input className="field" max="90" min="-90" onChange={event => setConfiguration(current => ({ ...current, latitude: event.target.value }))} required step="any" type="number" value={configuration.latitude ?? ''} /></FormField>
          <FormField label="Longitude" required><input className="field" max="180" min="-180" onChange={event => setConfiguration(current => ({ ...current, longitude: event.target.value }))} required step="any" type="number" value={configuration.longitude ?? ''} /></FormField>
          <FormField label="Allowed radius (metres)" required><input className="field" max="10000" min="25" onChange={event => setConfiguration(current => ({ ...current, radiusMeters: event.target.value }))} required type="number" value={configuration.radiusMeters ?? 200} /></FormField>
          <div className="flex items-end gap-3"><label className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-700"><input checked={Boolean(configuration.isEnabled)} onChange={event => setConfiguration(current => ({ ...current, isEnabled: event.target.checked }))} type="checkbox" /> Enable</label><button className="btn-primary flex-1" disabled={saving} type="submit"><Save size={17} /> {saving ? 'Saving…' : 'Save location'}</button></div>
        </form>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-700"><ShieldCheck size={19} /></span><div><h2 className="font-display text-lg font-extrabold">Attendance records</h2><p className="text-sm text-ink-600">GPS distance is stored with every check-in and check-out.</p></div></div>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <FormField label="From"><input className="field" onChange={event => { setFilters(current => ({ ...current, from: event.target.value })); setPage(1); }} type="date" value={filters.from} /></FormField>
          <FormField label="To"><input className="field" onChange={event => { setFilters(current => ({ ...current, to: event.target.value })); setPage(1); }} type="date" value={filters.to} /></FormField>
          <FormField label="Status"><select className="field" onChange={event => { setFilters(current => ({ ...current, status: event.target.value })); setPage(1); }} value={filters.status}><option value="">All records</option><option value="in-progress">In progress</option><option value="present">Present</option></select></FormField>
        </div>
        {loading ? <Loader /> : <DataTable columns={columns} emptyMessage="No attendance records found" rows={records} />}
        <Pagination onPageChange={setPage} pagination={pagination} />
      </section>
    </div>
  );
}
