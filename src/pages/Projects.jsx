import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { FormField, PageHeader, Pagination, StatusBadge } from '../components/UI';
import { projectService } from '../services/projectService';
import { PROJECT_STATUSES } from '../utils/constants';
import { formatDate } from '../utils/formatDate';

const emptyForm = {
  projectName: '',
  builderName: '',
  location: '',
  propertyType: '',
  priceRange: '',
  totalUnits: '',
  availableUnits: '',
  status: 'Upcoming',
  amenities: '',
  description: '',
  brochure: '',
  images: ''
};

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await projectService.list({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined
      });
      setProjects(result.projects);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const open = project => {
    setEditing(project || null);
    setModalOpen(true);
    setForm(project ? {
      projectName: project.projectName || '',
      builderName: project.builderName || '',
      location: project.location || '',
      propertyType: project.propertyType || '',
      priceRange: project.priceRange || '',
      totalUnits: project.totalUnits ?? '',
      availableUnits: project.availableUnits ?? '',
      status: project.status || 'Upcoming',
      amenities: (project.amenities || []).join(', '),
      description: project.description || '',
      brochure: project.brochure || '',
      images: (project.images || []).join(', ')
    } : emptyForm);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        projectName: form.projectName,
        builderName: form.builderName,
        location: form.location,
        propertyType: form.propertyType || undefined,
        priceRange: form.priceRange || undefined,
        totalUnits: form.totalUnits === '' ? undefined : Number(form.totalUnits),
        availableUnits: form.availableUnits === '' ? undefined : Number(form.availableUnits),
        status: form.status,
        amenities: form.amenities.split(',').map(item => item.trim()).filter(Boolean),
        description: form.description || undefined,
        brochure: form.brochure || undefined,
        images: form.images.split(',').map(item => item.trim()).filter(Boolean)
      };
      if (editing) {
        await projectService.update(editing._id, payload);
        toast.success('Project updated');
      } else {
        await projectService.create(payload);
        toast.success('Project created');
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
      await projectService.remove(deleting._id);
      toast.success('Project deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => ([
    { key: 'projectName', header: 'Project', render: row => <div><p className="font-bold text-ink-950">{row.projectName}</p><p className="text-xs text-ink-400">{row.builderName}</p></div> },
    { key: 'location', header: 'Location', render: row => row.location || '—' },
    { key: 'propertyType', header: 'Type', render: row => row.propertyType || '—' },
    { key: 'units', header: 'Units', render: row => `${row.availableUnits ?? 0}/${row.totalUnits ?? 0}` },
    { key: 'status', header: 'Status', render: row => <StatusBadge value={row.status} /> },
    { key: 'createdAt', header: 'Created', render: row => formatDate(row.createdAt) },
    { key: 'actions', header: '', cellClassName: 'w-28', render: row => <div className="flex justify-end gap-1"><button className="icon-button" onClick={() => open(row)} type="button"><Pencil size={17} /></button><button className="icon-button text-red-600 hover:bg-red-50" onClick={() => setDeleting(row)} type="button"><Trash2 size={17} /></button></div> }
  ]), []);

  if (loading) return <Loader fullPage label="Loading projects…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={<button className="btn-primary" onClick={() => open(null)} type="button"><Plus size={17} /> Add project</button>}
        description="Manage builders, pricing, units, and project visibility."
        eyebrow="Project Management"
        title="Projects"
      />

      <FilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: PROJECT_STATUSES,
            value: status,
            allLabel: 'All statuses'
          }
        ]}
        onClear={() => { setSearch(''); setStatus(''); setPage(1); }}
        onFilterChange={(_, value) => { setStatus(value); setPage(1); }}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        search={search}
        searchPlaceholder="Search projects by name, builder, or location"
      />

      <DataTable columns={columns} emptyMessage="No projects found" loading={loading} rows={projects} />
      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal
        description="Add or edit a project."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => { setEditing(null); setModalOpen(false); }} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy} onClick={save} type="button">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create project'}</button>
          </>
        )}
        onClose={() => { setEditing(null); setModalOpen(false); }}
        open={modalOpen}
        size="lg"
        title={editing ? 'Edit project' : 'Create project'}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField className="sm:col-span-2" label="Project name" required>
            <input autoFocus className="field" onChange={event => setForm(current => ({ ...current, projectName: event.target.value }))} required value={form.projectName} />
          </FormField>
          <FormField label="Builder name" required>
            <input className="field" onChange={event => setForm(current => ({ ...current, builderName: event.target.value }))} required value={form.builderName} />
          </FormField>
          <FormField label="Location" required>
            <input className="field" onChange={event => setForm(current => ({ ...current, location: event.target.value }))} required value={form.location} />
          </FormField>
          <FormField label="Property type">
            <input className="field" onChange={event => setForm(current => ({ ...current, propertyType: event.target.value }))} value={form.propertyType} />
          </FormField>
          <FormField label="Price range">
            <input className="field" onChange={event => setForm(current => ({ ...current, priceRange: event.target.value }))} value={form.priceRange} />
          </FormField>
          <FormField label="Total units">
            <input className="field" min="0" onChange={event => setForm(current => ({ ...current, totalUnits: event.target.value }))} type="number" value={form.totalUnits} />
          </FormField>
          <FormField label="Available units">
            <input className="field" min="0" onChange={event => setForm(current => ({ ...current, availableUnits: event.target.value }))} type="number" value={form.availableUnits} />
          </FormField>
          <FormField label="Status">
            <select className="field" onChange={event => setForm(current => ({ ...current, status: event.target.value }))} value={form.status}>
              {PROJECT_STATUSES.map(item => <option key={item}>{item}</option>)}
            </select>
          </FormField>
          <FormField label="Amenities" className="sm:col-span-2">
            <input className="field" onChange={event => setForm(current => ({ ...current, amenities: event.target.value }))} placeholder="Clubhouse, gym, parking" value={form.amenities} />
          </FormField>
          <FormField className="sm:col-span-2" label="Brochure URL">
            <input className="field" onChange={event => setForm(current => ({ ...current, brochure: event.target.value }))} value={form.brochure} />
          </FormField>
          <FormField className="sm:col-span-2" label="Image URLs">
            <textarea className="field min-h-24 resize-y" onChange={event => setForm(current => ({ ...current, images: event.target.value }))} placeholder="URL1, URL2" value={form.images} />
          </FormField>
          <FormField className="sm:col-span-2" label="Description">
            <textarea className="field min-h-28 resize-y" onChange={event => setForm(current => ({ ...current, description: event.target.value }))} value={form.description} />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        busy={busy}
        confirmLabel="Delete project"
        description={deleting ? `Delete ${deleting.projectName}?` : ''}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        open={Boolean(deleting)}
        title="Delete this project?"
      />
    </div>
  );
}
