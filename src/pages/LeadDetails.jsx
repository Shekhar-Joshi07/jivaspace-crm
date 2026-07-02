import { ArrowLeft, Clock3, Pencil, Send, Shuffle, StickyNote, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import LeadForm from '../components/LeadForm';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { EmptyState, FormField, PageHeader, StatusBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { activityService } from '../services/activityService';
import { leadService } from '../services/leadService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { ADMIN_ROLES, CRM_ROLES, canManageLeads, canUpdateLeadStatus, LEAD_STATUSES } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/formatDate';
import { getLeadEmail, getLeadMobile, getLeadName, getLeadOwnerName, getLeadProjectName } from '../utils/leadHelpers';

const canAssignLead = role => ADMIN_ROLES.includes(role);

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [remark, setRemark] = useState('');
  const [activity, setActivity] = useState({ type: 'Call', description: '' });
  const [transfer, setTransfer] = useState({ toUser: '', reason: '' });

  const canEdit = canManageLeads(user?.role);
  const canTransfer = ADMIN_ROLES.includes(user?.role);
  const canUpdateStatus = canUpdateLeadStatus(user?.role);
  const canInteract = CRM_ROLES.includes(user?.role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leadData, activityData] = await Promise.all([
        leadService.get(id),
        activityService.list({ lead: id, limit: 100 })
      ]);
      setLead(leadData);
      setActivities(activityData.activities || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
      navigate('/leads', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    Promise.allSettled([
      userService.list({ limit: 200, isActive: true }),
      projectService.list({ limit: 200 })
    ]).then(([usersResult, projectsResult]) => {
      setUsers(usersResult.status === 'fulfilled' ? usersResult.value.users : []);
      setProjects(projectsResult.status === 'fulfilled' ? projectsResult.value.projects : []);
    });
  }, []);

  const updateStatus = async status => {
    if (!lead || status === lead.status) return;
    setBusy(true);
    try {
      const updated = await leadService.updateStatus(id, { status });
      setLead(updated);
      toast.success('Status updated');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const saveLead = async payload => {
    setBusy(true);
    try {
      const updated = await leadService.update(id, payload);
      setLead(updated);
      setEditOpen(false);
      toast.success('Lead updated');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const saveRemark = async () => {
    if (!remark.trim()) return;
    setBusy(true);
    try {
      const updated = await leadService.addRemark(id, remark.trim());
      setLead(updated);
      toast.success('Remark added');
      setRemark('');
      setRemarkOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const saveActivity = async () => {
    if (!activity.description.trim()) return;
    setBusy(true);
    try {
      await leadService.addTimelineEntry(id, activity);
      toast.success('Activity added');
      setActivity({ type: 'Call', description: '' });
      setActivityOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const saveTransfer = async () => {
    if (!transfer.toUser) return toast.error('Choose an assignee');
    setBusy(true);
    try {
      const result = await leadService.transfer({
        leadId: id,
        toUser: transfer.toUser,
        reason: transfer.reason || undefined
      });
      setLead(result?.lead || lead);
      toast.success('Lead transferred');
      setTransfer({ toUser: '', reason: '' });
      setTransferOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader fullPage label="Loading lead details…" />;
  if (!lead) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link className="btn-secondary" to="/leads"><ArrowLeft size={17} /> Back to leads</Link>
        <div className="flex flex-wrap gap-2">
          {canEdit ? <button className="btn-secondary" onClick={() => setEditOpen(true)} type="button"><Pencil size={17} /> Edit</button> : null}
          {canInteract ? <button className="btn-secondary" onClick={() => setRemarkOpen(true)} type="button"><StickyNote size={17} /> Add remark</button> : null}
          {canInteract ? <button className="btn-primary" onClick={() => setActivityOpen(true)} type="button"><Clock3 size={17} /> Add activity</button> : null}
          {canTransfer ? <button className="btn-secondary" onClick={() => setTransferOpen(true)} type="button"><Shuffle size={17} /> Transfer</button> : null}
        </div>
      </div>

      <PageHeader
        eyebrow="Lead Details"
        title={getLeadName(lead)}
        description={`${getLeadMobile(lead) || 'No mobile'} · ${getLeadEmail(lead) || 'No email'} · ${getLeadProjectName(lead)}`}
      />

      <section className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={lead.status} />
              <StatusBadge value={lead.priority} />
            </div>
            <p className="text-sm text-ink-600">
              Assigned to <strong className="text-ink-950">{getLeadOwnerName(lead)}</strong>
            </p>
            <p className="text-sm text-ink-600">Follow-up: {formatDate(lead.followUpDate || lead.nextFollowUp)}</p>
          </div>
          {canUpdateStatus ? (
            <div className="min-w-[220px]">
              <label className="block">
                <span className="field-label">Update status</span>
                <select className="field min-h-11" disabled={busy} onChange={event => updateStatus(event.target.value)} value={lead.status || 'New'}>
                  {LEAD_STATUSES.map(status => <option key={status}>{status}</option>)}
                </select>
              </label>
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="Customer name" value={getLeadName(lead)} />
          <InfoCard label="Mobile" value={getLeadMobile(lead)} />
          <InfoCard label="Email" value={getLeadEmail(lead)} />
          <InfoCard label="Project" value={getLeadProjectName(lead)} />
          <InfoCard label="Property type" value={lead.interestedPropertyType || lead.propertyType || '—'} />
          <InfoCard label="Location" value={lead.locationPreference || lead.preferredLocation || '—'} />
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-gray-50/60 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">Remarks</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-700">{lead.remarks || 'No remarks recorded.'}</p>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-950">Activity timeline</h2>
            <p className="mt-1 text-sm text-ink-600">Status changes, remarks, and manual log entries appear here.</p>
          </div>
          {canInteract ? <button className="btn-secondary" onClick={() => setActivityOpen(true)} type="button"><Send size={16} /> Add activity</button> : null}
        </div>

        {activities.length ? (
          <div className="relative mt-6 space-y-5 before:absolute before:bottom-3 before:left-[17px] before:top-3 before:w-px before:bg-line">
            {activities.map(item => (
              <div className="relative flex gap-4" key={item._id}>
                <span className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700">
                  <Clock3 size={16} />
                </span>
                <div className="min-w-0 flex-1 rounded-2xl border border-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-ink-950">{item.type}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-600">{item.description}</p>
                    </div>
                    <span className="text-xs text-ink-400">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-ink-400">by {item.user?.name || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState title="No activity recorded" />
          </div>
        )}
      </section>

      <Modal
        description="Update the lead details."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setEditOpen(false)} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy} form="lead-form" type="submit">{busy ? 'Saving…' : 'Save changes'}</button>
          </>
        )}
        onClose={() => setEditOpen(false)}
        open={editOpen}
        size="lg"
        title="Edit lead"
      >
        <LeadForm
          busy={busy}
          canAssign={canAssignLead(user?.role)}
          lead={lead}
          onSubmit={saveLead}
          projects={projects}
          users={users}
        />
      </Modal>

      <Modal
        description="Add a note or customer remark."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setRemarkOpen(false)} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy || !remark.trim()} onClick={saveRemark} type="button">Save remark</button>
          </>
        )}
        onClose={() => setRemarkOpen(false)}
        open={remarkOpen}
        size="md"
        title="Add remark"
      >
        <FormField label="Remark" required>
          <textarea autoFocus className="field min-h-36 resize-y" onChange={event => setRemark(event.target.value)} value={remark} />
        </FormField>
      </Modal>

      <Modal
        description="Create an activity record for this lead."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setActivityOpen(false)} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy || !activity.description.trim()} onClick={saveActivity} type="button">Save activity</button>
          </>
        )}
        onClose={() => setActivityOpen(false)}
        open={activityOpen}
        size="md"
        title="Add activity"
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="field-label">Activity type</span>
            <select className="field" onChange={event => setActivity(current => ({ ...current, type: event.target.value }))} value={activity.type}>
              {['Call', 'Visit', 'Email', 'SMS', 'Note', 'Meeting', 'Payment', 'Follow-up'].map(type => <option key={type}>{type}</option>)}
            </select>
          </label>
          <FormField label="Description" required>
            <textarea autoFocus className="field min-h-36 resize-y" onChange={event => setActivity(current => ({ ...current, description: event.target.value }))} value={activity.description} />
          </FormField>
        </div>
      </Modal>

      <Modal
        description="Move this lead to another owner."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setTransferOpen(false)} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy || !transfer.toUser} onClick={saveTransfer} type="button">Transfer lead</button>
          </>
        )}
        onClose={() => setTransferOpen(false)}
        open={transferOpen}
        size="md"
        title="Transfer lead"
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="field-label">Transfer to</span>
            <select className="field" onChange={event => setTransfer(current => ({ ...current, toUser: event.target.value }))} value={transfer.toUser}>
              <option value="">Select user</option>
              {users.map(option => <option key={option._id} value={option._id}>{option.name} · {option.role.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          <FormField label="Reason">
            <textarea className="field min-h-28 resize-y" onChange={event => setTransfer(current => ({ ...current, reason: event.target.value }))} value={transfer.reason} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-gray-50/60 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink-800">{value || '—'}</p>
    </div>
  );
}
