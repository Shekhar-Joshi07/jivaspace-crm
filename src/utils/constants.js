export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  SALES_EXECUTIVE: 'sales_executive'
};

export const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  sales_executive: 'Sales Executive'
};

export const LEAD_STATUSES = [
  'New',
  'Calling',
  'Face to Face',
  'Site Visit',
  'Follow-up Needed',
  'Negotiation',
  'Booking Done',
  'Closure',
  'Not Interested',
  'Lost'
];

export const PIPELINE_STATUSES = [
  'New',
  'Calling',
  'Face to Face',
  'Site Visit',
  'Follow-up Needed',
  'Negotiation',
  'Booking Done',
  'Closure',
  'Not Interested',
  'Lost'
];

export const LEAD_SOURCES = [
  'Website',
  'Facebook',
  'Instagram',
  'Google Ads',
  '99acres',
  'MagicBricks',
  'Housing.com',
  'Referral',
  'Walk-in',
  'Email',
  'Phone',
  'Outbound Call',
  'Partner',
  'Channel Partner',
  'Other'
];

export const PRIORITIES = ['Low', 'Medium', 'High'];
export const PROPERTY_TYPES = ['Residential', 'Commercial', 'Plots', 'Villas', 'Apartment', 'Villa', 'Plot', 'Builder Floor', 'Office', 'Shop', 'Warehouse', 'Other'];
export const PROPERTY_LISTING_TYPES = ['Residential', 'Commercial', 'Plots', 'Villas'];
export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
export const PROJECT_STATUSES = ['Upcoming', 'Ongoing', 'Ready to Move', 'Sold Out'];
export const AVAILABILITY_STATUSES = ['Available', 'Hold', 'Booked', 'Sold'];
export const SITE_VISIT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'];
export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Converted to Sale'];

export const STATUS_STYLES = {
  New: 'bg-blue-50 text-blue-700 ring-blue-200',
  Calling: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  'Face to Face': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'Site Visit': 'bg-sky-50 text-sky-700 ring-sky-200',
  'Follow-up Needed': 'bg-amber-50 text-amber-800 ring-amber-200',
  Negotiation: 'bg-amber-50 text-amber-800 ring-amber-200',
  'Booking Done': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Closure: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Not Interested': 'bg-gray-100 text-gray-600 ring-gray-200',
  Lost: 'bg-red-50 text-red-700 ring-red-200',
  Pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Cancelled: 'bg-gray-100 text-gray-600 ring-gray-200',
  Scheduled: 'bg-blue-50 text-blue-700 ring-blue-200',
  Rescheduled: 'bg-violet-50 text-violet-700 ring-violet-200',
  'No Show': 'bg-gray-100 text-gray-600 ring-gray-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Converted to Sale': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Upcoming: 'bg-sky-50 text-sky-700 ring-sky-200',
  Ongoing: 'bg-blue-50 text-blue-700 ring-blue-200',
  'Ready to Move': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Sold Out': 'bg-gray-100 text-gray-600 ring-gray-200',
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Hold: 'bg-amber-50 text-amber-800 ring-amber-200',
  Booked: 'bg-blue-50 text-blue-700 ring-blue-200',
  Sold: 'bg-gray-100 text-gray-600 ring-gray-200',
  High: 'bg-red-50 text-red-700 ring-red-200',
  Medium: 'bg-amber-50 text-amber-800 ring-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Inactive: 'bg-gray-100 text-gray-600 ring-gray-200'
};

export const CHART_COLORS = ['#ef7900', '#f5b51b', '#c65300', '#ff9d3f', '#9d4100', '#f7c65c', '#e15f2f', '#8b6a55'];

export const SUPERADMIN_ROLES = ['superadmin'];
export const ADMIN_ROLES = ['superadmin', 'admin'];
export const CRM_ROLES = ['superadmin', 'admin', 'sales_executive'];

export const canManageLeads = role => ADMIN_ROLES.includes(role);
export const canUpdateLeadStatus = role => CRM_ROLES.includes(role);
export const canManageUsers = role => role === 'superadmin';
export const canViewReports = role => ADMIN_ROLES.includes(role);
export const canViewTasks = role => CRM_ROLES.includes(role);
