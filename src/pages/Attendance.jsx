import { CalendarDays, Clock3, LocateFixed, LogIn, LogOut, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import Loader from '../components/Loader';
import { PageHeader, StatusBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { formatDateTime } from '../utils/formatDate';

const getCurrentLocation = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Location access is not supported by this browser'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    position => resolve({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracyMeters: position.coords.accuracy
    }),
    error => reject(new Error(error.message || 'Location access is required to mark attendance')),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
  );
});

export default function Attendance() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [location, setLocation] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await attendanceService.today());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const captureLocation = async () => {
    setBusy(true);
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      toast.success('Latitude and longitude captured');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const markAttendance = async action => {
    if (!location) {
      toast.error('Get your current location before marking attendance');
      return;
    }
    setBusy(true);
    try {
      const attendance = action === 'check-in'
        ? await attendanceService.checkIn(location)
        : await attendanceService.checkOut(location);
      setData(current => ({ ...current, attendance }));
      toast.success(action === 'check-in' ? 'Check-in recorded' : 'Check-out recorded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader fullPage label="Loading attendance…" />;

  const configuration = data?.configuration;
  const attendance = data?.attendance;
  const isConfigured = configuration?.configured && configuration?.isEnabled;
  const attendanceStatus = attendance?.checkOut ? 'Present' : attendance?.checkIn ? 'In progress' : 'Pending';
  const hasLocation = Boolean(location);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={user?.role === 'superadmin' ? <Link className="btn-secondary" to="/attendance/audit"><ShieldCheck size={17} /> Attendance audit</Link> : null}
        description="Use your current location to check in and check out for today."
        eyebrow="Workday"
        title="Attendance"
      />

      <section className="card p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <label className="block"><span className="field-label">Latitude</span><input className="field bg-gray-50" placeholder="Get location to fill" readOnly value={location?.latitude?.toFixed(6) || ''} /></label>
          <label className="block"><span className="field-label">Longitude</span><input className="field bg-gray-50" placeholder="Get location to fill" readOnly value={location?.longitude?.toFixed(6) || ''} /></label>
          <label className="block"><span className="field-label">GPS accuracy</span><input className="field bg-gray-50" placeholder="—" readOnly value={location?.accuracyMeters ? `±${Math.round(location.accuracyMeters)} metres` : ''} /></label>
          <button className="btn-secondary min-h-11" disabled={busy} onClick={captureLocation} type="button"><LocateFixed size={17} /> {busy ? 'Getting location…' : hasLocation ? 'Update location' : 'Get current location'}</button>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="grid gap-4 bg-gradient-to-r from-brand-50 via-white to-white p-5 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><CalendarDays size={22} /></span>
            <div>
              <p className="font-display text-xl font-black text-ink-950">{new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(now)}</p>
              <p className="text-sm font-medium text-ink-600">{new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(now)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Live time · IST</p>
            <p className="mt-1 font-display text-xl font-black tabular-nums text-ink-950">{new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).format(now)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <StatusBadge value={attendanceStatus} />
            <button className="btn-primary min-h-10 px-4" disabled={!isConfigured || !hasLocation || busy || Boolean(attendance?.checkIn)} onClick={() => markAttendance('check-in')} type="button"><LogIn size={17} /> {attendance?.checkIn ? 'Checked in' : 'Check in'}</button>
            <button className="btn-secondary min-h-10 px-4" disabled={!isConfigured || !hasLocation || busy || !attendance?.checkIn || Boolean(attendance?.checkOut)} onClick={() => markAttendance('check-out')} type="button"><LogOut size={17} /> {attendance?.checkOut ? 'Checked out' : 'Check out'}</button>
          </div>
        </div>
      </section>

      <section className="hidden card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-extrabold text-ink-950">Verify your current location</p>
            <p className="mt-1 text-sm text-ink-600">Allow browser location access to automatically fill your latitude and longitude before check-in or check-out.</p>
          </div>
          <button className="btn-secondary" disabled={busy} onClick={captureLocation} type="button"><LocateFixed size={17} /> {busy ? 'Getting location…' : hasLocation ? 'Update location' : 'Get current location'}</button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block"><span className="field-label">Latitude</span><input className="field bg-gray-50" readOnly value={location?.latitude?.toFixed(6) || ''} /></label>
          <label className="block"><span className="field-label">Longitude</span><input className="field bg-gray-50" readOnly value={location?.longitude?.toFixed(6) || ''} /></label>
          <label className="block"><span className="field-label">GPS accuracy</span><input className="field bg-gray-50" readOnly value={location?.accuracyMeters ? `±${Math.round(location.accuracyMeters)} metres` : ''} /></label>
        </div>
      </section>

      {!isConfigured ? (
        <section className="card border-amber-200 bg-amber-50 p-5 text-amber-900">
          <strong>Attendance location is not available yet.</strong>
          <p className="mt-1 text-sm">Ask a Super Admin to configure the office latitude, longitude, and permitted radius.</p>
        </section>
      ) : null}

      <section className="card overflow-hidden">
        <div className="border-b border-line bg-gray-50/70 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-extrabold text-ink-950">Today’s attendance</p>
              <p className="mt-1 text-sm text-ink-600">Location permission is required. Allowed radius: {configuration?.radiusMeters || '—'} metres.</p>
            </div>
            <button aria-label="Refresh attendance" className="icon-button" disabled={loading || busy} onClick={load} type="button"><RefreshCw size={17} /></button>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <AttendanceEvent label="Check-in" location={attendance?.checkIn} />
          <AttendanceEvent label="Check-out" location={attendance?.checkOut} />
        </div>

        <div className="hidden flex-col gap-3 border-t border-line p-5 sm:flex-row sm:p-6">
          <button className="btn-primary flex-1" disabled={!isConfigured || !hasLocation || busy || Boolean(attendance?.checkIn)} onClick={() => markAttendance('check-in')} type="button">
            <LogIn size={18} /> {busy ? 'Getting location…' : attendance?.checkIn ? 'Checked in' : 'Check in'}
          </button>
          <button className="btn-secondary flex-1" disabled={!isConfigured || !hasLocation || busy || !attendance?.checkIn || Boolean(attendance?.checkOut)} onClick={() => markAttendance('check-out')} type="button">
            <LogOut size={18} /> {busy ? 'Getting location…' : attendance?.checkOut ? 'Checked out' : 'Check out'}
          </button>
        </div>
      </section>
    </div>
  );
}

function AttendanceEvent({ label, location }) {
  const complete = Boolean(location);
  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-ink-900">{label}</p>
        <StatusBadge value={complete ? 'Completed' : 'Pending'} />
      </div>
      {complete ? (
        <div className="mt-4 space-y-2 text-sm text-ink-600">
          <p className="flex items-center gap-2"><Clock3 size={16} /> {formatDateTime(location.at)}</p>
          <p className="flex items-center gap-2"><MapPin size={16} /> Verified within {location.distanceMeters} m of the office</p>
          {location.accuracyMeters ? <p className="text-xs text-ink-400">GPS accuracy: ±{Math.round(location.accuracyMeters)} m</p> : null}
        </div>
      ) : <p className="mt-4 text-sm text-ink-500">Not recorded yet.</p>}
    </article>
  );
}
