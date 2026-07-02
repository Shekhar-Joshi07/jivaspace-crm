import { Pencil, Plus, Trash2, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { FormField, PageHeader, StatusBadge } from '../components/UI';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { ADMIN_ROLES, ROLE_LABELS } from '../utils/constants';

const emptyTeam = { name: '', manager: '', members: [], description: '', status: 'Active' };

export default function Teams() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTeam);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [teamResult, userResult] = await Promise.all([
        teamService.list(),
        userService.list({ limit: 500, isActive: true })
      ]);
      setTeams(teamResult);
      setUsers(userResult.users);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const open = team => {
    setEditing(team || null);
    setModalOpen(true);
    setForm(team ? {
      name: team.name || '',
      manager: team.manager?._id || team.manager || '',
      members: (team.members || []).map(member => member._id || member),
      description: team.description || '',
      status: team.status || 'Active'
    } : emptyTeam);
  };

  const save = async () => {
    setBusy(true);
    try {
      if (editing) {
        await teamService.update(editing._id, form);
        toast.success('Team updated');
      } else {
        await teamService.create(form);
        toast.success('Team created');
      }
      setEditing(null);
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await teamService.remove(deleting._id);
      toast.success('Team deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => ([
    { key: 'name', header: 'Team', render: team => <div><p className="font-bold text-ink-950">{team.name}</p><p className="mt-0.5 max-w-sm truncate text-xs text-ink-400">{team.description || 'No description'}</p></div> },
    { key: 'manager', header: 'Manager', render: team => team.manager?.name || 'Unassigned' },
    { key: 'members', header: 'Members', render: team => <div className="flex -space-x-2">{team.members?.slice(0, 5).map(member => <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-brand-100 text-[10px] font-black text-brand-800" key={member._id || member}>{(member.name || '').slice(0, 1).toUpperCase()}</span>)}{team.members?.length > 5 ? <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-black">+{team.members.length - 5}</span> : null}</div> },
    { key: 'status', header: 'Status', render: team => <StatusBadge value={team.status} /> },
    { key: 'actions', header: '', cellClassName: 'w-28', render: team => <div className="flex justify-end gap-1"><button className="icon-button" onClick={() => open(team)} type="button"><Pencil size={17} /></button><button className="icon-button text-red-600 hover:bg-red-50" onClick={() => setDeleting(team)} type="button"><Trash2 size={17} /></button></div> }
  ]), []);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={<button className="btn-primary" onClick={() => open(null)} type="button"><Plus size={17} /> Add team</button>}
        description="Manage reporting groups and team members."
        eyebrow="Administration"
        title="Teams"
      />

      <DataTable columns={columns} emptyMessage="No teams found" loading={loading} rows={teams} />

      <Modal
        description="Create or update a reporting team."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => { setEditing(null); setModalOpen(false); }} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy} onClick={save} type="button">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create team'}</button>
          </>
        )}
        onClose={() => { setEditing(null); setModalOpen(false); }}
        open={modalOpen}
        size="md"
        title={editing ? 'Edit team' : 'Create team'}
      >
        <TeamForm form={form} setForm={setForm} users={users} />
      </Modal>

      <ConfirmDialog
        busy={busy}
        confirmLabel="Delete team"
        description={deleting ? `Delete ${deleting.name}?` : ''}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        open={Boolean(deleting)}
        title="Delete this team?"
      />
    </div>
  );
}

function TeamForm({ form, setForm, users }) {
  return (
    <div className="grid gap-4">
      <FormField label="Team name" required>
        <input autoFocus className="field" onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required value={form.name} />
      </FormField>
      <FormField label="Manager">
        <select className="field" onChange={event => setForm(current => ({ ...current, manager: event.target.value }))} value={form.manager}>
          <option value="">No manager</option>
          {users.filter(user => ADMIN_ROLES.includes(user.role)).map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
        </select>
      </FormField>
      <FormField label="Members">
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-2xl border border-line p-2">
          {users.map(user => (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-brand-50" key={user._id}>
              <input
                checked={form.members.includes(user._id)}
                onChange={event => setForm(current => ({
                  ...current,
                  members: event.target.checked
                    ? [...current.members, user._id]
                    : current.members.filter(id => id !== user._id)
                }))}
                type="checkbox"
              />
              <span>{user.name}</span>
              <small className="ml-auto text-ink-400">{ROLE_LABELS[user.role]}</small>
            </label>
          ))}
        </div>
      </FormField>
      <FormField label="Description">
        <textarea className="field min-h-28 resize-y" onChange={event => setForm(current => ({ ...current, description: event.target.value }))} value={form.description} />
      </FormField>
      <FormField label="Status">
        <select className="field" onChange={event => setForm(current => ({ ...current, status: event.target.value }))} value={form.status}>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </FormField>
    </div>
  );
}
