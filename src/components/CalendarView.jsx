import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

const STATUS_TONES = {
  Calling: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  New: 'bg-blue-100 text-blue-800 ring-blue-200',
  'Not Interested': 'bg-red-100 text-red-800 ring-red-200',
  'Site Visit': 'bg-orange-100 text-orange-800 ring-orange-200',
  Closure: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  'Follow-up Needed': 'bg-violet-100 text-violet-800 ring-violet-200'
};

const VIEW_LENGTH = { month: 30, week: 7, day: 1 };

const startOfDay = date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const localKey = date => {
  const next = new Date(date);
  return [
    next.getFullYear(),
    String(next.getMonth() + 1).padStart(2, '0'),
    String(next.getDate()).padStart(2, '0')
  ].join('-');
};

const shiftDate = (date, amount, unit) => {
  const next = new Date(date);
  if (unit === 'month') next.setMonth(next.getMonth() + amount);
  else next.setDate(next.getDate() + amount * VIEW_LENGTH[unit]);
  return next;
};

const getRange = (date, view) => {
  const current = startOfDay(date);
  if (view === 'day') return { from: current, to: current };
  if (view === 'week') {
    const from = new Date(current);
    const day = from.getDay();
    from.setDate(from.getDate() - day);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { from, to };
  }
  const from = new Date(current.getFullYear(), current.getMonth(), 1);
  const to = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  return { from, to };
};

const buildEventMap = events => {
  const map = new Map();
  for (const event of events) {
    const key = localKey(event.followUpDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(event);
  }
  return map;
};

const getMonthGrid = date => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(gridStart);
    next.setDate(gridStart.getDate() + index);
    return next;
  });
};

const getDisplayDates = (date, view) => {
  const current = startOfDay(date);
  if (view === 'day') return [current];

  if (view === 'week') {
    const start = new Date(current);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const next = new Date(start);
      next.setDate(start.getDate() + index);
      return next;
    });
  }

  const start = new Date(current.getFullYear(), current.getMonth(), 1);
  const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

function EventChip({ event }) {
  return (
    <Link
      className={`block rounded-xl px-2.5 py-2 text-left text-xs font-semibold ring-1 ring-inset ${STATUS_TONES[event.status] || 'bg-gray-100 text-gray-700 ring-gray-200'}`}
      to={`/leads/${event.leadId}`}
    >
      <span className="block truncate">{event.customerName}</span>
      <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] opacity-75">{event.status}</span>
    </Link>
  );
}

export default function CalendarView({ events = [], loading = false, initialView = 'month', onRangeChange }) {
  const [view, setView] = useState(initialView);
  const [currentDate, setCurrentDate] = useState(() => startOfDay(new Date()));

  const eventMap = useMemo(() => buildEventMap(events), [events]);
  const displayDates = useMemo(() => getDisplayDates(currentDate, view), [currentDate, view]);
  const monthGrid = useMemo(() => getMonthGrid(currentDate), [currentDate]);
  const today = startOfDay(new Date());

  const jumpToday = () => setCurrentDate(today);
  const goPrevious = () => setCurrentDate(previous => shiftDate(previous, -1, view));
  const goNext = () => setCurrentDate(previous => shiftDate(previous, 1, view));

  const title = useMemo(() => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
      const first = displayDates[0];
      const last = displayDates[displayDates.length - 1];
      return `${formatDate(first)} - ${formatDate(last)}`;
    }
    return currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, [currentDate, displayDates, view]);

  useEffect(() => {
    if (typeof onRangeChange === 'function') {
      onRangeChange(getRange(currentDate, view), view);
    }
  }, [currentDate, onRangeChange, view]);

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f2dfac] text-[#351111]">
            <CalendarDays size={18} />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-950">Calendar</h2>
            <p className="text-sm text-ink-600">Follow-up work by date, week, or month</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-secondary min-h-10 px-3" onClick={jumpToday} type="button">Today</button>
          <button className="icon-button" onClick={goPrevious} type="button"><ChevronLeft size={18} /></button>
          <button className="icon-button" onClick={goNext} type="button"><ChevronRight size={18} /></button>
          <div className="rounded-2xl border border-line bg-white p-1">
            {['month', 'week', 'day'].map(option => (
              <button
                className={`min-h-9 rounded-xl px-3 text-sm font-bold transition ${view === option ? 'bg-[#3d1515] text-white' : 'text-ink-600 hover:bg-[#f6ede0]'}`}
                key={option}
                onClick={() => setView(option)}
                type="button"
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-line px-5 py-4 sm:px-6">
        <p className="text-sm font-bold text-ink-700">{title}</p>
      </div>

      {loading ? (
        <div className="p-6">
          <div className="grid min-h-48 place-items-center rounded-3xl border border-dashed border-line bg-[#fcfbf7] text-sm font-semibold text-ink-400">
            Loading calendar…
          </div>
        </div>
      ) : view === 'month' ? (
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-3xl border border-line bg-line">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div className="bg-[#fcfbf7] px-3 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-ink-500" key={day}>{day}</div>
            ))}
            {monthGrid.map(date => {
              const key = localKey(date);
              const dayEvents = eventMap.get(key) || [];
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = key === localKey(today);
              return (
                <div className={`min-h-36 bg-white p-2 ${isCurrentMonth ? '' : 'opacity-40'}`} key={`${key}-${date.getTime()}`}>
                  <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-[#3d1515] text-white' : 'text-ink-700'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.slice(0, 2).map(event => <EventChip event={event} key={`${key}-${event.leadId}`} />)}
                    {dayEvents.length > 2 ? (
                      <div className="rounded-xl bg-[#f7f1e2] px-2.5 py-2 text-xs font-bold text-[#7a5a14]">
                        +{dayEvents.length - 2} more
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <div className="grid gap-4">
            {displayDates.map(date => {
              const key = localKey(date);
              const dayEvents = eventMap.get(key) || [];
              return (
                <section className="rounded-3xl border border-line bg-white p-4" key={key}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">Date</p>
                      <h3 className="mt-1 font-display text-base font-black text-ink-950">{formatDate(date)}</h3>
                    </div>
                    <span className="rounded-full bg-[#f6ede0] px-3 py-1 text-xs font-bold text-[#7a5a14]">{dayEvents.length} items</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {dayEvents.length ? dayEvents.map(event => <EventChip event={event} key={`${key}-${event.leadId}`} />) : (
                      <div className="rounded-2xl border border-dashed border-line bg-[#fcfbf7] px-4 py-4 text-sm text-ink-500">
                        No follow-up items.
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
