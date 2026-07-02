import { Download, FileText, FolderDown, Home, ListChecks, UsersRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import { PageHeader } from '../components/UI';
import { bookingService } from '../services/bookingService';
import { leadService } from '../services/leadService';
import { projectService } from '../services/projectService';
import { siteVisitService } from '../services/siteVisitService';
import { teamService } from '../services/teamService';
import { downloadCsv } from '../utils/downloadCsv';

export default function Downloads() {
  const exportLeads = async () => {
    try {
      const { leads } = await leadService.list({ limit: 5000, page: 1 });
      downloadCsv('leads.csv', [
        ['customerName', 'mobile', 'email', 'status', 'project', 'assignedTo', 'followUpDate'],
        ...leads.map(lead => [
          lead.customerName || lead.name || '',
          lead.mobile || lead.phone || '',
          lead.email || '',
          lead.status || '',
          lead.interestedProject?.projectName || lead.interestedProject?.name || lead.project?.projectName || lead.project?.name || '',
          lead.assignedTo?.name || '',
          lead.followUpDate || ''
        ])
      ]);
      toast.success('Leads downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const exportPendingLeads = async () => {
    try {
      const { leads } = await leadService.pending({ limit: 5000, page: 1 });
      downloadCsv('pending-leads.csv', [
        ['customerName', 'mobile', 'status', 'project', 'assignedTo', 'followUpDate'],
        ...leads.map(lead => [
          lead.customerName || lead.name || '',
          lead.mobile || lead.phone || '',
          lead.status || '',
          lead.interestedProject?.projectName || lead.project?.projectName || '',
          lead.assignedTo?.name || '',
          lead.followUpDate || ''
        ])
      ]);
      toast.success('Pending leads downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const exportSiteVisits = async () => {
    try {
      const { siteVisits } = await siteVisitService.list({ limit: 5000, page: 1 });
      downloadCsv('site-visits.csv', [
        ['lead', 'project', 'visitDate', 'visitTime', 'assignedSalesPerson', 'visitStatus'],
        ...siteVisits.map(item => [
          item.lead?.customerName || item.lead?.name || '',
          item.project?.projectName || item.project?.name || '',
          item.visitDate || '',
          item.visitTime || '',
          item.assignedSalesPerson?.name || '',
          item.visitStatus || ''
        ])
      ]);
      toast.success('Site visits downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const exportBookings = async () => {
    try {
      const { bookings } = await bookingService.list({ limit: 5000, page: 1 });
      downloadCsv('bookings.csv', [
        ['lead', 'project', 'propertyUnit', 'bookingAmount', 'bookingDate', 'paymentMode', 'bookingStatus'],
        ...bookings.map(item => [
          item.lead?.customerName || item.lead?.name || '',
          item.project?.projectName || item.project?.name || '',
          item.propertyUnit?.unitNumber || '',
          item.bookingAmount ?? '',
          item.bookingDate || '',
          item.paymentMode || '',
          item.bookingStatus || ''
        ])
      ]);
      toast.success('Bookings downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const exportTeamReport = async () => {
    try {
      const teams = await teamService.list();
      downloadCsv('team-report.csv', [
        ['team', 'manager', 'members', 'status'],
        ...teams.map(team => [
          team.name || '',
          team.manager?.name || '',
          (team.members || []).map(member => member.name).join('; '),
          team.status || ''
        ])
      ]);
      toast.success('Team report downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const exportProjectReport = async () => {
    try {
      const { projects } = await projectService.list({ limit: 5000, page: 1 });
      downloadCsv('project-report.csv', [
        ['projectName', 'builderName', 'location', 'status', 'totalUnits', 'availableUnits'],
        ...projects.map(project => [
          project.projectName || '',
          project.builderName || '',
          project.location || '',
          project.status || '',
          project.totalUnits ?? '',
          project.availableUnits ?? ''
        ])
      ]);
      toast.success('Project report downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const buttons = [
    { label: 'Leads', icon: FileText, onClick: exportLeads, desc: 'All leads in CSV format' },
    { label: 'Pending Leads', icon: ListChecks, onClick: exportPendingLeads, desc: 'Open and follow-up leads' },
    { label: 'Site Visits', icon: Home, onClick: exportSiteVisits, desc: 'Scheduled and completed visits' },
    { label: 'Booking Report', icon: FolderDown, onClick: exportBookings, desc: 'Bookings and status' },
    { label: 'Team Report', icon: UsersRound, onClick: exportTeamReport, desc: 'Teams and reporting lines' },
    { label: 'Project Report', icon: Download, onClick: exportProjectReport, desc: 'Projects and unit counts' }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        description="Download key CRM datasets as CSV files for sharing or offline analysis."
        eyebrow="Exports"
        title="Downloads"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {buttons.map(button => (
          <button
            className="card flex min-h-40 flex-col items-start gap-4 p-5 text-left transition hover:border-[#d8b04f] hover:bg-[#fffaf0]"
            key={button.label}
            onClick={button.onClick}
            type="button"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#3d1515] text-[#f4d06f]">
              <button.icon size={22} />
            </span>
            <span>
              <strong className="block text-base text-ink-950">{button.label}</strong>
              <span className="mt-1 block text-sm text-ink-600">{button.desc}</span>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}
