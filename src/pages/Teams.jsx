import { Pencil, Trash2, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { FormField, PageHeader, StatusBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { ADMIN_ROLES, ROLE_LABELS } from '../utils/constants';

const emptyTeam = { name: '', manager: '', members: [], description: '', status: 'Active' };

export default function Teams() {
  const { user: currentUser } = useAuth();
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

  const superAdminMembers = useMemo(() => {
    const currentUserId = String(currentUser?._id || currentUser?.id || '');
    if (currentUser?.role !== 'superadmin' || !currentUserId) return [];
    return users.filter(member => {
      const manager = member.reportingManager;
      const managerId = manager?._id || manager?.id || manager || '';
      return String(managerId) === currentUserId;
    });
  }, [currentUser?.id, currentUser?._id, currentUser?.role, users]);

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
        description="Manage reporting groups and team members."
        eyebrow="Administration"
        title="Teams"
      />

      {currentUser?.role === 'superadmin' ? (
        <section className="card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"><UsersRound size={20} /></span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Reporting structure</p>
              <h2 className="mt-1 font-display text-xl font-black text-ink-950">My team members</h2>
              <p className="mt-1 text-sm text-ink-600">Active users who report directly to you.</p>
            </div>
          </div>

          {superAdminMembers.length ? (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr>
                    <th className="table-heading w-16">#</th>
                    <th className="table-heading">Team member</th>
                    <th className="table-heading">Email</th>
                    <th className="table-heading">Role</th>
                    <th className="table-heading">Phone</th>
                    <th className="table-heading">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {superAdminMembers.map((member, index) => (
                    <tr className="transition hover:bg-brand-50/50" key={member._id || member.id}>
                      <td className="table-cell text-ink-400">{index + 1}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-black text-brand-700">{member.name?.slice(0, 1)?.toUpperCase() || 'U'}</span>
                          <strong className="text-ink-950">{member.name}</strong>
                        </div>
                      </td>
                      <td className="table-cell">{member.email || '—'}</td>
                      <td className="table-cell">{ROLE_LABELS[member.role] || member.role}</td>
                      <td className="table-cell">{member.phone || '—'}</td>
                      <td className="table-cell"><StatusBadge value={member.isActive ? 'Active' : 'Inactive'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="mt-5 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-ink-600">No active users are assigned to you as reporting manager.</p>}
        </section>
      ) : null}

      {teams.length || loading ? <DataTable columns={columns} emptyMessage="No teams found" loading={loading} rows={teams} /> : null}

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
