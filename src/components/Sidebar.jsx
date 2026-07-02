import {
  Bookmark,
  Building2,
  CalendarCheck2,
  ChevronRight,
  Download,
  FileClock,
  Gauge,
  Layers3,
  ListChecks,
  LogOut,
  MenuSquare,
  Users2,
  UserRoundPlus
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ADMIN_ROLES, CRM_ROLES, ROLE_LABELS, SUPERADMIN_ROLES } from '../utils/constants';

const sections = [
  {
    title: 'Main',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: Gauge, end: true, roles: CRM_ROLES }]
  },
  {
    title: 'Lead Management',
    items: [
      { label: 'Create Lead', to: '/leads/create', icon: UserRoundPlus, roles: ADMIN_ROLES },
      { label: 'Lead', to: '/leads', icon: ListChecks, roles: CRM_ROLES },
      { label: 'Lead Responses', to: '/lead-responses', icon: Bookmark, roles: CRM_ROLES },
      { label: 'Lead Pending', to: '/lead-pending', icon: FileClock, roles: CRM_ROLES },
      { label: 'Bulk Import', to: '/lead-bulk-import', icon: Download, roles: ADMIN_ROLES },
      { label: 'Lead Transfer', to: '/lead-transfer', icon: ChevronRight, roles: ADMIN_ROLES }
    ]
  },
  {
    title: 'User Management',
    items: [
      { label: 'Create User', to: '/users/create', icon: UserRoundPlus, roles: SUPERADMIN_ROLES },
      { label: 'User', to: '/users', icon: Users2, roles: SUPERADMIN_ROLES }
    ]
  },
  {
    title: 'Teams',
    items: [{ label: 'My Teams', to: '/teams', icon: MenuSquare, roles: ADMIN_ROLES }]
  },
  {
    title: 'Project',
    items: [
      { label: 'Project', to: '/projects', icon: Building2, roles: ADMIN_ROLES },
      { label: 'Property Inventory', to: '/property-inventory', icon: Layers3, roles: ADMIN_ROLES }
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Site Visit', to: '/site-visits', icon: CalendarCheck2, roles: CRM_ROLES },
      { label: 'Booking', to: '/bookings', icon: ListChecks, roles: CRM_ROLES },
      { label: 'Download', to: '/download', icon: Download, roles: ADMIN_ROLES },
      { label: 'Report', to: '/reports', icon: Bookmark, roles: ADMIN_ROLES },
      { label: 'People Report', to: '/reports/people', icon: Users2, roles: ADMIN_ROLES },
      { label: 'Lead Transfer Logs', to: '/lead-transfer-logs', icon: FileClock, roles: ADMIN_ROLES }
    ]
  }
];

const isVisible = (item, role) => !item.roles || item.roles.includes(role);

const normalizePath = pathname => pathname.split('?')[0].replace(/\/+$/, '') || '/';

const isItemActive = (item, pathname) => {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(item.to);

  if (targetPath === '/leads/create') {
    return currentPath === '/leads/create' || currentPath === '/create-lead';
  }

  if (targetPath === '/leads') {
    return currentPath === '/leads'
      || (currentPath.startsWith('/leads/') && currentPath !== '/leads/create');
  }

  if (item.end) {
    return currentPath === targetPath;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

const itemClass = isActive => [
  'group flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition',
  isActive
    ? 'bg-white text-brand-800 shadow-[0_8px_20px_rgba(87,36,0,0.2)]'
    : 'text-white/78 hover:bg-white/10 hover:text-white'
].join(' ');

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {open ? <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden" onClick={onClose} type="button" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col border-r border-white/10 bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-sidebar transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-[132px] items-center border-b border-white/15 px-5">
          <img alt="Jiva Space Realty" className="h-[110px] w-auto object-contain object-left" src="/jiva-space-logo.png" />
          <button aria-label="Close sidebar" className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-white/65 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} type="button">
            <ChevronRight size={18} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map(section => {
            const visibleItems = section.items.filter(item => isVisible(item, user?.role));
            if (!visibleItems.length) return null;
            return (
              <div className="mb-5" key={section.title}>
                <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/35">{section.title}</p>
                <div className="space-y-1">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const active = isItemActive(item, location.pathname);
                    return (
                      <NavLink className={() => itemClass(active)} end={item.end} key={item.to} onClick={onClose} to={item.to}>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/8 text-white/85 transition group-hover:bg-white/12">
                          <Icon size={17} strokeWidth={2.1} />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {active ? <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> : null}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-sm font-black text-brand-700">
              {user?.name?.slice(0, 1)?.toUpperCase() || 'U'}
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-sm">{user?.name}</strong>
              <small className="block truncate text-[11px] text-white/55">{ROLE_LABELS[user?.role] || user?.role}</small>
            </span>
          </div>
          <button className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white" onClick={logout} type="button">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
