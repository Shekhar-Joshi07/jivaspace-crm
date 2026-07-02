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
import { propertyUnitService } from '../services/propertyUnitService';
import { AVAILABILITY_STATUSES } from '../utils/constants';
import { formatCurrency } from '../utils/formatDate';

const emptyForm = {
  project: '',
  unitNumber: '',
  towerBlock: '',
  floor: '',
  bhk: '',
  areaSqft: '',
  facing: '',
  price: '',
  availabilityStatus: 'Available'
};

export default function PropertyInventory() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [units, setUnits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [unitResult, projectResult] = await Promise.all([
        propertyUnitService.list({
          page,
          limit: 10,
          search: search || undefined,
          project: project || undefined,
          availabilityStatus: status || undefined
        }),
        projectService.list({ limit: 200 })
      ]);
      setUnits(unitResult.propertyUnits);
      setPagination(unitResult.pagination);
      setProjects(projectResult.projects);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, project, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const open = unit => {
    setEditing(unit || null);
    setModalOpen(true);
    setForm(unit ? {
      project: unit.project?._id || unit.project || '',
      unitNumber: unit.unitNumber || '',
      towerBlock: unit.towerBlock || '',
      floor: unit.floor ?? '',
      bhk: unit.bhk || '',
      areaSqft: unit.areaSqft ?? '',
      facing: unit.facing || '',
      price: unit.price ?? '',
      availabilityStatus: unit.availabilityStatus || 'Available'
    } : emptyForm);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        project: form.project,
        unitNumber: form.unitNumber,
        towerBlock: form.towerBlock || undefined,
        floor: form.floor === '' ? undefined : Number(form.floor),
        bhk: form.bhk || undefined,
        areaSqft: form.areaSqft === '' ? undefined : Number(form.areaSqft),
        facing: form.facing || undefined,
        price: form.price === '' ? undefined : Number(form.price),
        availabilityStatus: form.availabilityStatus
      };
      if (editing) {
        await propertyUnitService.update(editing._id, payload);
        toast.success('Property unit updated');
      } else {
        await propertyUnitService.create(payload);
        toast.success('Property unit created');
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
      await propertyUnitService.remove(deleting._id);
      toast.success('Property unit deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => ([
    { key: 'unit', header: 'Unit', render: row => <div><p className="font-bold text-ink-950">{row.unitNumber}</p><p className="text-xs text-ink-400">{row.towerBlock || '—'}</p></div> },
    { key: 'project', header: 'Project', render: row => row.project?.projectName || row.project?.name || '—' },
    { key: 'floor', header: 'Floor', render: row => row.floor ?? '—' },
    { key: 'bhk', header: 'BHK', render: row => row.bhk || '—' },
    { key: 'price', header: 'Price', render: row => formatCurrency(row.price) },
    { key: 'availabilityStatus', header: 'Status', render: row => <StatusBadge value={row.availabilityStatus} /> },
    { key: 'actions', header: '', cellClassName: 'w-28', render: row => <div className="flex justify-end gap-1"><button className="icon-button" onClick={() => open(row)} type="button"><Pencil size={17} /></button><button className="icon-button text-red-600 hover:bg-red-50" onClick={() => setDeleting(row)} type="button"><Trash2 size={17} /></button></div> }
  ]), []);

  if (loading) return <Loader fullPage label="Loading property inventory…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={<button className="btn-primary" onClick={() => open(null)} type="button"><Plus size={17} /> Add unit</button>}
        description="Track unit availability, pricing, and booking readiness."
        eyebrow="Property Management"
        title="Property Inventory"
      />

      <FilterBar
        filters={[
          {
            key: 'project',
            label: 'Project',
            options: projects.map(item => ({ value: item._id, label: item.projectName })),
            value: project,
            allLabel: 'All projects'
          },
          {
            key: 'status',
            label: 'Availability',
            options: AVAILABILITY_STATUSES,
            value: status,
            allLabel: 'All statuses'
          }
        ]}
        onClear={() => { setSearch(''); setProject(''); setStatus(''); setPage(1); }}
        onFilterChange={(key, value) => {
          if (key === 'project') setProject(value);
          if (key === 'status') setStatus(value);
          setPage(1);
        }}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        search={search}
        searchPlaceholder="Search unit number or tower/block"
      />

      <DataTable columns={columns} emptyMessage="No property units found" loading={loading} rows={units} />
      <Pagination onPageChange={setPage} pagination={pagination} />

      <Modal
        description="Create or edit a property unit."
        footer={(
          <>
            <button className="btn-secondary" onClick={() => { setEditing(null); setModalOpen(false); }} type="button">Cancel</button>
            <button className="btn-primary" disabled={busy || !form.project} onClick={save} type="button">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create unit'}</button>
          </>
        )}
        onClose={() => { setEditing(null); setModalOpen(false); }}
        open={modalOpen}
        size="lg"
        title={editing ? 'Edit unit' : 'Create unit'}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField className="sm:col-span-2" label="Project" required>
            <select className="field" onChange={event => setForm(current => ({ ...current, project: event.target.value }))} value={form.project}>
              <option value="">Select project</option>
              {projects.map(item => <option key={item._id} value={item._id}>{item.projectName}</option>)}
            </select>
          </FormField>
          <FormField label="Unit number" required>
            <input className="field" onChange={event => setForm(current => ({ ...current, unitNumber: event.target.value }))} required value={form.unitNumber} />
          </FormField>
          <FormField label="Tower / Block">
            <input className="field" onChange={event => setForm(current => ({ ...current, towerBlock: event.target.value }))} value={form.towerBlock} />
          </FormField>
          <FormField label="Floor">
            <input className="field" min="0" onChange={event => setForm(current => ({ ...current, floor: event.target.value }))} type="number" value={form.floor} />
          </FormField>
          <FormField label="BHK">
            <input className="field" onChange={event => setForm(current => ({ ...current, bhk: event.target.value }))} placeholder="2 BHK" value={form.bhk} />
          </FormField>
          <FormField label="Area (sqft)">
            <input className="field" min="0" onChange={event => setForm(current => ({ ...current, areaSqft: event.target.value }))} type="number" value={form.areaSqft} />
          </FormField>
          <FormField label="Facing">
            <input className="field" onChange={event => setForm(current => ({ ...current, facing: event.target.value }))} value={form.facing} />
          </FormField>
          <FormField label="Price">
            <input className="field" min="0" onChange={event => setForm(current => ({ ...current, price: event.target.value }))} type="number" value={form.price} />
          </FormField>
          <FormField className="sm:col-span-2" label="Availability">
            <select className="field" onChange={event => setForm(current => ({ ...current, availabilityStatus: event.target.value }))} value={form.availabilityStatus}>
              {AVAILABILITY_STATUSES.map(item => <option key={item}>{item}</option>)}
            </select>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        busy={busy}
        confirmLabel="Delete unit"
        description={deleting ? `Delete unit ${deleting.unitNumber}?` : ''}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        open={Boolean(deleting)}
        title="Delete this property unit?"
      />
    </div>
  );
}
