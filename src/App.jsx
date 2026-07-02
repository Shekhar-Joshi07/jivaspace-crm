import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loader from './components/Loader';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import { ADMIN_ROLES, CRM_ROLES, SUPERADMIN_ROLES } from './utils/constants';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const BulkImport = lazy(() => import('./pages/BulkImport'));
const Bookings = lazy(() => import('./pages/Bookings'));
const CreateLead = lazy(() => import('./pages/CreateLead'));
const CreateUser = lazy(() => import('./pages/CreateUser'));
const Downloads = lazy(() => import('./pages/Downloads'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const LeadDetails = lazy(() => import('./pages/LeadDetails'));
const LeadPending = lazy(() => import('./pages/LeadPending'));
const LeadResponses = lazy(() => import('./pages/LeadResponses'));
const LeadTransfer = lazy(() => import('./pages/LeadTransfer'));
const Leads = lazy(() => import('./pages/Leads'));
const PropertyInventory = lazy(() => import('./pages/PropertyInventory'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Projects = lazy(() => import('./pages/Projects'));
const Register = lazy(() => import('./pages/Register'));
const Reports = lazy(() => import('./pages/Reports'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Settings = lazy(() => import('./pages/Settings'));
const SiteVisits = lazy(() => import('./pages/SiteVisits'));
const Teams = lazy(() => import('./pages/Teams'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Users = lazy(() => import('./pages/Users'));

const sectionContent = {
  teams: {
    title: 'My Teams',
    description: 'Review reporting teams and their members.'
  },
  projects: {
    title: 'Project',
    description: 'Manage builders, project inventory, and availability in one workspace.'
  },
  'property-inventory': {
    title: 'Property Inventory',
    description: 'Track unit-level availability, pricing, and booking readiness.'
  },
  'site-visits': {
    title: 'Site Visit',
    description: 'Plan, reschedule, and follow up on property visits.'
  },
  bookings: {
    title: 'Booking',
    description: 'Handle booking records and unit state changes.'
  },
  download: {
    title: 'Download',
    description: 'Export leads, reports, and CRM data files.'
  },
  'reports/people': {
    title: 'People Report',
    description: 'Review team performance, lead allocation, and conversion ownership.'
  },
  'lead-transfer-logs': {
    title: 'Lead Transfer Logs',
    description: 'Audit how leads move between people and teams.'
  }
};

function SectionPage({ title, description }) {
  return (
    <div className="animate-fade-in">
      <div className="card p-6 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Real Estate CRM</p>
        <h1 className="mt-2 font-display text-2xl font-black text-ink-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">{description}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loader fullPage label="Loading workspace…" />}>
      <Routes>
        <Route element={<Login />} path="/login" />
        <Route element={<Register />} path="/register" />
        <Route element={<ForgotPassword />} path="/forgot-password" />
        <Route element={<ResetPassword />} path="/reset-password/:token" />

        <Route
          element={(
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          )}
        >
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <CreateLead />
              </RoleRoute>
            )}
            path="leads/create"
          />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route
            element={(
              <RoleRoute roles={SUPERADMIN_ROLES}>
                <Users />
              </RoleRoute>
            )}
            path="users"
          />
          <Route
            element={(
              <RoleRoute roles={SUPERADMIN_ROLES}>
                <CreateUser />
              </RoleRoute>
            )}
            path="users/create"
          />
          <Route path="lead-responses" element={<LeadResponses />} />
          <Route path="lead-pending" element={<LeadPending />} />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <BulkImport />
              </RoleRoute>
            )}
            path="lead-bulk-import"
          />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <LeadTransfer />
              </RoleRoute>
            )}
            path="lead-transfer"
          />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <Teams />
              </RoleRoute>
            )}
            path="teams"
          />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <Projects />
              </RoleRoute>
            )}
            path="projects"
          />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <PropertyInventory />
              </RoleRoute>
            )}
            path="property-inventory"
          />
          <Route path="site-visits" element={<SiteVisits />} />
          <Route path="bookings" element={<Bookings />} />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <Downloads />
              </RoleRoute>
            )}
            path="download"
          />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <Reports />
              </RoleRoute>
            )}
            path="reports"
          />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <SectionPage {...sectionContent['reports/people']} />
              </RoleRoute>
            )}
            path="reports/people"
          />
          <Route
            element={(
              <RoleRoute roles={ADMIN_ROLES}>
                <SectionPage {...sectionContent['lead-transfer-logs']} />
              </RoleRoute>
            )}
            path="lead-transfer-logs"
          />

          <Route
            element={(
              <RoleRoute roles={CRM_ROLES}>
                <Tasks />
              </RoleRoute>
            )}
            path="tasks"
          />
        </Route>

        <Route element={<Navigate replace to="/dashboard" />} path="/" />
        <Route element={<NotFound />} path="*" />
      </Routes>
    </Suspense>
  );
}
