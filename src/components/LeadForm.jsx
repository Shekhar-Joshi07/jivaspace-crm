import { useEffect, useMemo, useState } from 'react';
import { FormField } from './UI';
import { LEAD_STATUSES, LEAD_SOURCES, PRIORITIES } from '../utils/constants';
import { toDateInput } from '../utils/formatDate';

const initialState = {
  customerName: '',
  mobile: '',
  alternateMobile: '',
  email: '',
  leadSource: 'Other',
  interestedProject: '',
  interestedPropertyType: '',
  budget: '',
  locationPreference: '',
  status: 'New',
  priority: 'Medium',
  assignedTo: '',
  followUpDate: '',
  remarks: ''
};

const normalizeLead = lead => ({
  ...initialState,
  ...(lead || {}),
  customerName: lead?.customerName || lead?.name || '',
  mobile: lead?.mobile || lead?.phone || '',
  alternateMobile: lead?.alternateMobile || lead?.alternatePhone || '',
  leadSource: lead?.leadSource || lead?.source || 'Other',
  interestedProject: lead?.interestedProject?._id || lead?.interestedProject || lead?.project?._id || lead?.project || '',
  interestedPropertyType: lead?.interestedPropertyType || lead?.propertyType || '',
  locationPreference: lead?.locationPreference || lead?.preferredLocation || '',
  assignedTo: lead?.assignedTo?._id || lead?.assignedTo || '',
  followUpDate: toDateInput(lead?.followUpDate || lead?.nextFollowUp),
  budget: lead?.budget ?? '',
  remarks: lead?.remarks || ''
});

export default function LeadForm({ lead, users = [], projects = [], canAssign = false, onSubmit, busy }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    setForm(normalizeLead(lead));
  }, [lead]);

  const projectOptions = useMemo(
    () => projects.map(project => ({
      id: project._id || project.id,
      label: project.projectName || project.name
    })),
    [projects]
  );

  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const submit = event => {
    event.preventDefault();
    const payload = {
      customerName: form.customerName.trim(),
      mobile: form.mobile.trim(),
      alternateMobile: form.alternateMobile.trim() || undefined,
      email: form.email.trim() || undefined,
      leadSource: form.leadSource,
      interestedProject: form.interestedProject || undefined,
      interestedPropertyType: form.interestedPropertyType || undefined,
      budget: form.budget === '' ? undefined : Number(form.budget),
      locationPreference: form.locationPreference.trim() || undefined,
      status: form.status,
      priority: form.priority,
      assignedTo: form.assignedTo || undefined,
      followUpDate: form.followUpDate || undefined,
      remarks: form.remarks.trim() || undefined
    };
    onSubmit(payload);
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" id="lead-form" onSubmit={submit}>
      <FormField label="Customer name" required>
        <input autoFocus className="field" maxLength={150} name="customerName" onChange={change} required value={form.customerName} />
      </FormField>
      <FormField label="Mobile number" required>
        <input className="field" inputMode="numeric" maxLength={20} name="mobile" onChange={change} required value={form.mobile} />
      </FormField>
      <FormField label="Alternate mobile">
        <input className="field" inputMode="numeric" maxLength={20} name="alternateMobile" onChange={change} value={form.alternateMobile} />
      </FormField>
      <FormField label="Email">
        <input className="field" name="email" onChange={change} type="email" value={form.email} />
      </FormField>
      <FormField label="Lead source">
        <select className="field" name="leadSource" onChange={change} value={form.leadSource}>
          {LEAD_SOURCES.map(source => <option key={source}>{source}</option>)}
        </select>
      </FormField>
      <FormField label="Interested project">
        <select className="field" name="interestedProject" onChange={change} value={form.interestedProject}>
          <option value="">Select project</option>
          {projectOptions.map(project => <option key={project.id} value={project.id}>{project.label}</option>)}
        </select>
      </FormField>
      <FormField label="Property type">
        <input className="field" maxLength={100} name="interestedPropertyType" onChange={change} value={form.interestedPropertyType} />
      </FormField>
      <FormField label="Budget">
        <input className="field" min="0" name="budget" onChange={change} step="1" type="number" value={form.budget} />
      </FormField>
      <FormField label="Location preference">
        <input className="field" maxLength={300} name="locationPreference" onChange={change} value={form.locationPreference} />
      </FormField>
      <FormField label="Status">
        <select className="field" name="status" onChange={change} value={form.status}>
          {LEAD_STATUSES.map(status => <option key={status}>{status}</option>)}
        </select>
      </FormField>
      <FormField label="Priority">
        <select className="field" name="priority" onChange={change} value={form.priority}>
          {PRIORITIES.map(priority => <option key={priority}>{priority}</option>)}
        </select>
      </FormField>
      <FormField label="Follow-up date">
        <input className="field" name="followUpDate" onChange={change} type="date" value={form.followUpDate || ''} />
      </FormField>
      {canAssign ? (
        <FormField label="Assigned to">
          <select className="field" name="assignedTo" onChange={change} value={form.assignedTo || ''}>
            <option value="">Unassigned</option>
            {users.map(user => <option key={user._id} value={user._id}>{user.name} · {user.role.replaceAll('_', ' ')}</option>)}
          </select>
        </FormField>
      ) : null}
      <FormField className="sm:col-span-2" label="Remarks">
        <textarea className="field min-h-28 resize-y" maxLength={5000} name="remarks" onChange={change} value={form.remarks} />
      </FormField>
      <button className="hidden" disabled={busy} form="lead-form" type="submit" />
    </form>
  );
}
