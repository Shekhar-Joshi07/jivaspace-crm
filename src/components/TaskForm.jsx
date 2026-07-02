import { useEffect, useState } from 'react';
import { PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { toDateInput, toDateTimeInput } from '../utils/formatDate';
import { FormField } from './UI';

const emptyTask = {
  title: '',
  description: '',
  assignedTo: '',
  relatedLead: '',
  dueDate: '',
  reminderAt: '',
  priority: 'Medium',
  status: 'Pending'
};

export default function TaskForm({ task, users = [], leads = [], canAssign, defaultLead, onSubmit, busy }) {
  const [form, setForm] = useState(emptyTask);
  useEffect(() => {
    setForm(task ? {
      ...emptyTask,
      ...task,
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      relatedLead: task.relatedLead?._id || task.relatedLead || task.lead?._id || task.lead || '',
      dueDate: toDateInput(task.dueDate),
      reminderAt: toDateTimeInput(task.reminderAt)
    } : { ...emptyTask, relatedLead: defaultLead || '' });
  }, [defaultLead, task]);

  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = event => {
    event.preventDefault();
    onSubmit({
      ...form,
      assignedTo: form.assignedTo || undefined,
      relatedLead: form.relatedLead || undefined,
      reminderAt: form.reminderAt || undefined
    });
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" id="task-form" onSubmit={submit}>
      <FormField className="sm:col-span-2" label="Task title" required>
        <input autoFocus className="field" maxLength={200} name="title" onChange={change} required value={form.title} />
      </FormField>
      <FormField className="sm:col-span-2" label="Description">
        <textarea className="field min-h-24 resize-y" maxLength={5000} name="description" onChange={change} value={form.description || ''} />
      </FormField>
      <FormField label="Due date" required>
        <input className="field" name="dueDate" onChange={change} required type="date" value={form.dueDate} />
      </FormField>
      <FormField label="Reminder">
        <input className="field" name="reminderAt" onChange={change} type="datetime-local" value={form.reminderAt || ''} />
      </FormField>
      <FormField label="Priority">
        <select className="field" name="priority" onChange={change} value={form.priority}>{PRIORITIES.map(priority => <option key={priority}>{priority}</option>)}</select>
      </FormField>
      <FormField label="Status">
        <select className="field" name="status" onChange={change} value={form.status}>{TASK_STATUSES.map(status => <option key={status}>{status}</option>)}</select>
      </FormField>
      {canAssign ? (
        <FormField className="sm:col-span-2" label="Assign to">
          <select className="field" name="assignedTo" onChange={change} value={form.assignedTo || ''}>
            <option value="">Assign to me</option>
            {users.map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
          </select>
        </FormField>
      ) : null}
      <FormField className="sm:col-span-2" label="Related lead">
        <select className="field" name="relatedLead" onChange={change} value={form.relatedLead || ''}>
          <option value="">No related lead</option>
          {leads.map(lead => <option key={lead._id} value={lead._id}>{lead.name} · {lead.phone}</option>)}
        </select>
      </FormField>
      <button className="hidden" disabled={busy} type="submit" />
    </form>
  );
}
