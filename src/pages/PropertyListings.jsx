import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { FormField, PageHeader, StatusBadge } from '../components/UI';
import { propertyService } from '../services/propertyService';
import { AVAILABILITY_STATUSES, PROPERTY_LISTING_TYPES } from '../utils/constants';
import { formatCurrency } from '../utils/formatDate';

const emptyProperty = {
  title: '',
  slug: '',
  type: 'Residential',
  location: '',
  price: '',
  startFrom: '',
  size: '',
  bedrooms: '',
  status: 'Available',
  logoUrl: '',
  heroImage: '',
  heroHeadline: '',
  heroSubheadline: '',
  units: '',
  images: '',
  amenities: '',
  highlights: '',
  floorPlans: '',
  nearbyPlaces: '',
  description: '',
  isPublished: false,
  isFeatured: false
};

const toList = value => value.split(',').map(item => item.trim()).filter(Boolean);
const toLines = value => value.split('\n').map(item => item.trim()).filter(Boolean);
const unitsToText = units => (units || []).map(unit => [unit.title, unit.area, unit.price].filter(Boolean).join(' | ')).join('\n');
const toUnits = value => toLines(value).map(row => {
  const [title = '', area = '', price = ''] = row.split('|').map(part => part.trim());
  return { title, area, price };
}).filter(unit => unit.title);

export default function PropertyListings() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [properties, setProperties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyProperty);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProperties(await propertyService.list());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = property => {
    setEditing(property || null);
    setModalOpen(true);
    setForm(property ? {
      title: property.title || '',
      slug: property.slug || '',
      type: property.type || 'Residential',
      location: property.location || '',
      price: property.price ?? '',
      startFrom: property.startFrom || '',
      size: property.size || '',
      bedrooms: property.bedrooms ?? '',
      status: property.status || 'Available',
      logoUrl: property.logoUrl || '',
      heroImage: property.heroImage || '',
      heroHeadline: property.heroHeadline || '',
      heroSubheadline: property.heroSubheadline || '',
      units: unitsToText(property.units),
      images: (property.images || []).join(', '),
      amenities: (property.amenities || []).join(', '),
      highlights: (property.highlights || []).join('\n'),
      floorPlans: (property.floorPlans || []).join('\n'),
      nearbyPlaces: (property.nearbyPlaces || []).join('\n'),
      description: property.description || '',
      isPublished: Boolean(property.isPublished),
      isFeatured: Boolean(property.isFeatured)
    } : emptyProperty);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        location: form.location.trim(),
        price: Number(form.price),
        slug: form.slug.trim() || undefined,
        startFrom: form.startFrom.trim() || undefined,
        size: form.size.trim() || undefined,
        bedrooms: form.bedrooms === '' ? undefined : Number(form.bedrooms),
        images: toList(form.images),
        amenities: toList(form.amenities),
        highlights: toLines(form.highlights),
        floorPlans: toLines(form.floorPlans),
        nearbyPlaces: toLines(form.nearbyPlaces),
        units: toUnits(form.units),
        logoUrl: form.logoUrl.trim() || undefined,
        heroImage: form.heroImage.trim() || undefined,
        heroHeadline: form.heroHeadline.trim() || undefined,
        heroSubheadline: form.heroSubheadline.trim() || undefined,
        description: form.description.trim() || undefined
      };
      if (editing) {
        await propertyService.update(editing._id || editing.id, payload);
        toast.success('Property updated');
      } else {
        await propertyService.create(payload);
        toast.success('Property listing created');
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

  const uploadImages = async files => {
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = await propertyService.uploadImages(files);
      setForm(current => ({
        ...current,
        images: [...toList(current.images), ...uploaded.map(image => image.url)].join(', ')
      }));
      toast.success(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await propertyService.remove(deleting._id || deleting.id);
      toast.success('Property deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'title',
      header: 'Property',
      render: property => (
        <div className="flex items-center gap-3">
          {property.images?.[0] ? <img alt="" className="h-11 w-11 rounded-xl object-cover" src={property.images[0]} /> : <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><ImagePlus size={18} /></span>}
          <div><p className="font-bold text-ink-950">{property.title}</p><p className="mt-0.5 text-xs text-ink-400">{property.location}</p></div>
        </div>
      )
    },
    { key: 'type', header: 'Type', render: property => property.type },
    { key: 'price', header: 'Price', render: property => formatCurrency(property.price) },
    { key: 'status', header: 'Availability', render: property => <StatusBadge value={property.status} /> },
    { key: 'website', header: 'Website', render: property => <StatusBadge value={property.isPublished ? 'Published' : 'Draft'} /> },
    {
      key: 'actions', header: '', cellClassName: 'w-28', render: property => (
        <div className="flex justify-end gap-1">
          <button aria-label={`Edit ${property.title}`} className="icon-button" onClick={() => open(property)} type="button"><Pencil size={17} /></button>
          <button aria-label={`Delete ${property.title}`} className="icon-button text-red-600 hover:bg-red-50" onClick={() => setDeleting(property)} type="button"><Trash2 size={17} /></button>
        </div>
      )
    }
  ]), []);

  if (loading) return <Loader fullPage label="Loading property listings…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={<button className="btn-primary" onClick={() => open(null)} type="button"><Plus size={17} /> Add property</button>}
        description="Create, publish, and manage properties displayed on the Jiva Space website."
        eyebrow="Master"
        title="Property Listings"
      />
      <DataTable columns={columns} emptyMessage="No property listings found" rows={properties} />

      <Modal
        description="Published properties are available through the public website listings API."
        footer={<><button className="btn-secondary" onClick={() => { setEditing(null); setModalOpen(false); }} type="button">Cancel</button><button className="btn-primary" disabled={busy || !form.title.trim() || !form.location.trim() || form.price === ''} onClick={save} type="button">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create property'}</button></>}
        onClose={() => { setEditing(null); setModalOpen(false); }}
        open={modalOpen}
        size="lg"
        title={editing ? 'Edit property listing' : 'Add property listing'}
      >
        <PropertyForm busy={busy} form={form} onUploadImages={uploadImages} setForm={setForm} />
      </Modal>

      <ConfirmDialog busy={busy} confirmLabel="Delete property" description={deleting ? `Delete ${deleting.title}?` : ''} onClose={() => setDeleting(null)} onConfirm={remove} open={Boolean(deleting)} title="Delete this property?" />
    </div>
  );
}

function PropertyForm({ busy, form, onUploadImages, setForm }) {
  const update = (field, value) => setForm(current => ({ ...current, [field]: value }));
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField className="sm:col-span-2" label="Property title" required><input autoFocus className="field" maxLength={200} onChange={event => update('title', event.target.value)} required value={form.title} /></FormField>
      <FormField label="Website slug" hint="Example: jashn-elevate"><input className="field" maxLength={220} onChange={event => update('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="jashn-elevate" value={form.slug} /></FormField>
      <FormField label="Property type" required><select className="field" onChange={event => update('type', event.target.value)} value={form.type}>{PROPERTY_LISTING_TYPES.map(type => <option key={type}>{type}</option>)}</select></FormField>
      <FormField label="Location" required><input className="field" maxLength={300} onChange={event => update('location', event.target.value)} required value={form.location} /></FormField>
      <FormField label="Price" required><input className="field" min="0" onChange={event => update('price', event.target.value)} required type="number" value={form.price} /></FormField>
      <FormField label="Starting from"><input className="field" maxLength={100} onChange={event => update('startFrom', event.target.value)} placeholder="e.g. 65 - 70 Lacs*" value={form.startFrom} /></FormField>
      <FormField label="Size"><input className="field" maxLength={100} onChange={event => update('size', event.target.value)} placeholder="e.g. 1,250 sq ft" value={form.size} /></FormField>
      <FormField label="Bedrooms"><input className="field" min="0" onChange={event => update('bedrooms', event.target.value)} type="number" value={form.bedrooms} /></FormField>
      <FormField label="Availability"><select className="field" onChange={event => update('status', event.target.value)} value={form.status}>{AVAILABILITY_STATUSES.map(status => <option key={status}>{status}</option>)}</select></FormField>
      <FormField label="Logo image URL"><input className="field" onChange={event => update('logoUrl', event.target.value)} placeholder="https://.../logo.png" value={form.logoUrl} /></FormField>
      <FormField label="Hero image URL"><input className="field" onChange={event => update('heroImage', event.target.value)} placeholder="https://.../hero.jpg" value={form.heroImage} /></FormField>
      <FormField label="Hero headline"><input className="field" maxLength={200} onChange={event => update('heroHeadline', event.target.value)} placeholder="e.g. 2BHK & 3BHK" value={form.heroHeadline} /></FormField>
      <FormField label="Hero subheadline"><input className="field" maxLength={200} onChange={event => update('heroSubheadline', event.target.value)} placeholder="e.g. PREMIUM FLATS" value={form.heroSubheadline} /></FormField>
      <FormField className="sm:col-span-2" hint="One configuration per line: title | area | price" label="Unit configurations"><textarea className="field min-h-28 resize-y" onChange={event => update('units', event.target.value)} placeholder={'2 BHK | 950 sq.ft | ₹65 Lacs onwards\n3 BHK | 1,250 sq.ft | ₹85 Lacs onwards'} value={form.units} /></FormField>
      <FormField className="sm:col-span-2" hint="Upload up to 10 JPG, PNG, or WEBP files at once, or add image URLs separated by commas." label="Property images">
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800 transition hover:bg-brand-100">
            <ImagePlus size={18} /> {busy ? 'Uploading…' : 'Upload multiple images'}
            <input accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} multiple onChange={event => { void onUploadImages(Array.from(event.target.files || [])); event.target.value = ''; }} type="file" />
          </label>
          <textarea className="field min-h-24 resize-y" onChange={event => update('images', event.target.value)} placeholder="https://…/image-1.jpg, https://…/image-2.jpg" value={form.images} />
        </div>
      </FormField>
      <FormField className="sm:col-span-2" hint="Add amenities separated by commas." label="Amenities"><input className="field" onChange={event => update('amenities', event.target.value)} placeholder="Parking, Gym, Swimming pool" value={form.amenities} /></FormField>
      <FormField hint="One highlight per line." label="Project highlights"><textarea className="field min-h-24 resize-y" onChange={event => update('highlights', event.target.value)} placeholder={'Near metro station\nRERA approved'} value={form.highlights} /></FormField>
      <FormField hint="One floor plan name or URL per line." label="Floor plans"><textarea className="field min-h-24 resize-y" onChange={event => update('floorPlans', event.target.value)} placeholder={'2 BHK floor plan\n3 BHK floor plan'} value={form.floorPlans} /></FormField>
      <FormField className="sm:col-span-2" hint="One nearby landmark or place per line." label="Nearby places"><textarea className="field min-h-24 resize-y" onChange={event => update('nearbyPlaces', event.target.value)} placeholder={'Airport - 25 min\nMetro station - 5 min'} value={form.nearbyPlaces} /></FormField>
      <FormField className="sm:col-span-2" label="Description"><textarea className="field min-h-28 resize-y" maxLength={5000} onChange={event => update('description', event.target.value)} value={form.description} /></FormField>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line p-3 text-sm font-semibold"><span>Publish on website</span><input checked={form.isPublished} onChange={event => update('isPublished', event.target.checked)} type="checkbox" /></label>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line p-3 text-sm font-semibold"><span>Feature this property</span><input checked={form.isFeatured} onChange={event => update('isFeatured', event.target.checked)} type="checkbox" /></label>
    </div>
  );
}
