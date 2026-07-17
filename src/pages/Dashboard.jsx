import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  ContactRound,
  House,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import CalendarView from '../components/CalendarView';
import Loader from '../components/Loader';
import StatusCard from '../components/StatusCard';
import { PageHeader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { canManageLeads } from '../utils/constants';

const cardConfig = [
  { key: 'totalLeads', title: 'Total Leads', icon: ContactRound, tone: 'blue' },
  { key: 'callingCount', title: 'Calling', icon: PhoneCall, tone: 'yellow' },
  { key: 'faceToFaceCount', title: 'Face to Face', icon: House, tone: 'violet' },
  { key: 'siteVisitCount', title: 'Site Visit', icon: CalendarClock, tone: 'orange' },
  { key: 'followUpNeededCount', title: 'Follow-up Needed', icon: Clock3, tone: 'purple' },
  { key: 'closureCount', title: 'Closure', icon: CheckCircle2, tone: 'green' },
  { key: 'notInterestedCount', title: 'Not Interested', icon: Circle, tone: 'red' },
  { key: 'newLeadsCount', title: 'New Leads', icon: Sparkles, tone: 'brand' }
];

const localDateString = value => {
  const date = new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
};

const flattenCalendarGroups = groups => groups.flatMap(group => (group.items || []).map(item => ({
  ...item,
  followUpDate: item.followUpDate || group.followUpDate
})));

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dashboardService.getStats()
      .then(result => { if (active) setStats(result); })
      .catch(error => { if (active) toast.error(error?.response?.data?.message || error.message || 'Unable to load dashboard'); })
      .finally(() => { if (active) setStatsLoading(false); });
    return () => { active = false; };
  }, []);

  const loadCalendar = useCallback(async range => {
    setCalendarLoading(true);
    try {
      const result = await dashboardService.getCalendar({
        from: localDateString(range.from),
        to: localDateString(range.to)
      });
      setCalendarEvents(flattenCalendarGroups(result || []));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to load calendar');
      setCalendarEvents([]);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  const cardData = useMemo(() => cardConfig.map(card => ({
    ...card,
    count: stats?.[card.key] ?? 0
  })), [stats]);

  if (statsLoading && !stats) return <Loader label="Building your dashboard…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={canManageLeads(user?.role) ? <Link className="btn-primary" to="/leads/create"><ContactRound size={17} /> Create lead</Link> : null}
        description="Track real estate leads, next follow-ups, and today’s activity from one workspace."
        eyebrow="Dashboard"
        title="JivaSpace Reality CRM"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map(card => (
          <StatusCard
            count={card.count}
            icon={card.icon}
            key={card.key}
            title={card.title}
            tone={card.tone}
          />
        ))}
      </section>

      <CalendarView events={calendarEvents} loading={calendarLoading} onRangeChange={loadCalendar} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <article className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold text-ink-950">Quick focus</h2>
          <p className="mt-1 text-sm text-ink-600">Use the dashboard to keep follow-ups moving and bookings visible.</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Lead flow</p>
              <p className="mt-2 text-sm leading-6 text-ink-700">Calling and follow-up leads need the fastest attention.</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">Operations</p>
              <p className="mt-2 text-sm leading-6 text-ink-700">Site visits and bookings should stay synced with the assigned salesperson.</p>
            </div>
          </div>
        </article>

        <article className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold text-ink-950">Next action</h2>
          <p className="mt-1 text-sm text-ink-600">Jump to the work that matters next.</p>
          <div className="mt-5 space-y-2">
            <Link className="flex items-center justify-between rounded-2xl bg-brand-500 p-4 text-sm font-bold text-white transition hover:bg-brand-600" to="/lead-pending">
              <span>Review pending leads</span>
              <ArrowRight size={16} />
            </Link>
            <Link className="flex items-center justify-between rounded-2xl border border-line p-4 text-sm font-bold text-ink-800 transition hover:border-brand-500 hover:bg-brand-50" to="/site-visits">
              <span>Open site visits</span>
              <ArrowRight size={16} />
            </Link>
            <Link className="flex items-center justify-between rounded-2xl border border-line p-4 text-sm font-bold text-ink-800 transition hover:border-brand-500 hover:bg-brand-50" to="/bookings">
              <span>Check bookings</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
