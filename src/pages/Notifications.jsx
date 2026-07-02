import {
  Bell,
  CheckCheck,
  CheckSquare2,
  Clock3,
  ContactRound,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import Loader from '../components/Loader';
import { EmptyState, PageHeader, Pagination } from '../components/UI';
import { notificationService } from '../services/notificationService';
import { formatDateTime, relativeTime } from '../utils/formatDate';

const typeIcons = {
  task_assigned: CheckSquare2,
  lead_assigned: ContactRound,
  follow_up: Clock3,
  task_overdue: Clock3,
  status_changed: TrendingUp,
  general: Bell
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.list({ page, limit: 20, isRead: filter || undefined });
      setNotifications(result.notifications);
      setPagination(result.pagination);
      setUnread(result.unread);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const openNotification = async notification => {
    if (!notification.isRead) {
      try { await notificationService.markRead(notification._id); } catch { /* Navigation still works. */ }
    }
    if (notification.relatedLead?._id) navigate(`/leads/${notification.relatedLead._id}`);
    else if (notification.relatedTask?._id) navigate('/tasks');
    else load();
  };

  const markAll = async () => {
    try {
      await notificationService.markAllRead();
      toast.success('All notifications marked as read');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (event, id) => {
    event.stopPropagation();
    try {
      await notificationService.remove(id);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader actions={unread ? <button className="btn-secondary" onClick={markAll} type="button"><CheckCheck size={17} /> Mark all read</button> : null} description="Assignments, reminders, status changes, and overdue work in one feed." eyebrow="Inbox" title="Notifications" />
      <div className="mb-4 flex gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm">
        {[['', 'All'], ['false', `Unread${unread ? ` (${unread})` : ''}`], ['true', 'Read']].map(([value, label]) => <button className={`rounded-xl px-4 py-2 text-sm font-bold transition ${filter === value ? 'bg-brand-950 text-white' : 'text-ink-600 hover:bg-gray-100'}`} key={value} onClick={() => { setFilter(value); setPage(1); }} type="button">{label}</button>)}
      </div>
      {loading ? <Loader /> : notifications.length ? (
        <div className="card divide-y divide-line overflow-hidden">
          {notifications.map(notification => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <article
                className={`flex w-full cursor-pointer items-start gap-4 px-4 py-4 text-left transition hover:bg-brand-50 sm:px-6 ${notification.isRead ? 'bg-white' : 'bg-brand-50/50'}`}
                key={notification._id}
                onClick={() => openNotification(notification)}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') openNotification(notification); }}
                role="button"
                tabIndex={0}
              >
                <span className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${notification.isRead ? 'bg-gray-100 text-ink-600' : 'bg-brand-100 text-brand-800'}`}><Icon size={19} />{!notification.isRead ? <i className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-accent-600" /> : null}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm font-extrabold text-ink-950">{notification.title}</strong><small className="text-xs text-ink-400" title={formatDateTime(notification.createdAt)}>{relativeTime(notification.createdAt)}</small></span>
                  <span className="mt-1 block text-sm leading-6 text-ink-600">{notification.message}</span>
                </span>
                <button aria-label="Delete notification" className="icon-button text-red-500 hover:bg-red-50" onClick={event => remove(event, notification._id)} type="button"><Trash2 size={17} /></button>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="No notifications" description="You are all caught up." />}
      <Pagination onPageChange={setPage} pagination={pagination} />
    </div>
  );
}
