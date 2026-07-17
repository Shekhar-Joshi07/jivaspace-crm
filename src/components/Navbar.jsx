import { Bell, ChevronDown, KeyRound, LogOut, Menu, Search, UserCircle2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/constants';

const titleMap = {
  '/dashboard': 'Dashboard',
  '/leads': 'Lead Management',
  '/leads/create': 'Create Lead',
  '/lead-responses': 'Lead Responses',
  '/lead-pending': 'Pending Leads',
  '/lead-bulk-import': 'Bulk Import',
  '/lead-transfer': 'Lead Transfer',
  '/users/create': 'Create User',
  '/users': 'User Management',
  '/teams': 'My Teams',
  '/projects': 'Projects',
  '/property-inventory': 'Property Inventory',
  '/property-listings': 'Property Listings',
  '/site-visits': 'Site Visits',
  '/bookings': 'Bookings',
  '/download': 'Downloads',
  '/reports': 'Reports',
  '/reports/people': 'People Report',
  '/lead-transfer-logs': 'Lead Transfer Logs',
  '/tasks': 'Tasks',
  '/notifications': 'Notifications',
  '/settings': 'Settings'
};

const resolveTitle = (pathname, search) => {
  const params = new URLSearchParams(search);
  return titleMap[pathname] || 'Real Estate CRM';
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const title = useMemo(() => resolveTitle(location.pathname, location.search), [location.pathname, location.search]);

  const submitSearch = event => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/leads?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  useEffect(() => {
    const closeProfileMenu = event => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', closeProfileMenu);
    return () => document.removeEventListener('mousedown', closeProfileMenu);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center border-b border-line bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button aria-label="Open navigation" className="icon-button mr-2 lg:hidden" onClick={onMenuClick} type="button">
        <Menu size={21} />
      </button>

      <div className="min-w-0">
        <p className="truncate font-display text-lg font-black tracking-tight text-ink-950">{title}</p>
        <p className="hidden text-xs font-medium text-ink-500 sm:block">A focused workspace for sales, inventory, and follow-ups.</p>
      </div>

      <form className="relative ml-auto hidden w-full max-w-sm xl:block" onSubmit={submitSearch}>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
        <input
          aria-label="Search leads"
          className="field min-h-10 bg-canvas pl-9"
          onChange={event => setSearch(event.target.value)}
          placeholder="Search leads"
          value={search}
        />
      </form>

      <Link aria-label="Notifications" className="icon-button relative ml-2" to="/notifications">
        <Bell size={20} />
      </Link>

      <div className="relative ml-2 hidden lg:block" ref={profileMenuRef}>
        <button
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-3 py-2 text-left transition hover:border-brand-300 hover:bg-brand-100 focus:outline-none focus:ring-4 focus:ring-brand-100"
          onClick={() => setProfileOpen(value => !value)}
          type="button"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500 text-xs font-black text-white">
            {user?.name?.slice(0, 1)?.toUpperCase() || 'U'}
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-xs font-black text-ink-950">{user?.name}</strong>
            <small className="block truncate text-[10px] text-ink-500">{ROLE_LABELS[user?.role] || user?.role}</small>
          </span>
          <ChevronDown className={`shrink-0 text-ink-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} size={16} />
        </button>

        {profileOpen ? (
          <div aria-label="Profile menu" className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift" role="menu">
            <Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-800" onClick={() => setProfileOpen(false)} role="menuitem" to="/settings">
              <KeyRound size={17} /> Change password
            </Link>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50" onClick={() => { setProfileOpen(false); void logout(); }} role="menuitem" type="button">
              <LogOut size={17} /> Logout
            </button>
          </div>
        ) : null}
      </div>

      <Link className="ml-2 grid h-10 w-10 place-items-center rounded-xl border border-brand-100 bg-white text-ink-600 lg:hidden" to="/settings">
        <UserCircle2 size={19} />
      </Link>
    </header>
  );
}
