import { Building2, CalendarClock, GripVertical, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/axios';
import Loader from '../components/Loader';
import { EmptyState, PageHeader, StatusBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { leadService } from '../services/leadService';
import { canManageLeads, LEAD_STATUSES } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatDate';

const stageAccent = {
  New: 'bg-blue-500',
  Calling: 'bg-cyan-500',
  'Face to Face': 'bg-indigo-500',
  'Site Visit': 'bg-sky-500',
  'Follow-up Needed': 'bg-amber-500',
  Negotiation: 'bg-amber-500',
  'Booking Done': 'bg-emerald-500',
  Closure: 'bg-emerald-600',
  'Not Interested': 'bg-gray-400',
  Lost: 'bg-red-500'
};

export default function Pipeline() {
  const { user } = useAuth();
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [overStage, setOverStage] = useState(null);
  const canDrag = canManageLeads(user?.role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPipeline(await leadService.pipeline());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stages = useMemo(() => {
    const extra = Object.keys(pipeline).filter(stage => !LEAD_STATUSES.includes(stage));
    return [...LEAD_STATUSES, ...extra];
  }, [pipeline]);

  const drop = async targetStage => {
    setOverStage(null);
    if (!dragging || dragging.status === targetStage || !canDrag) return;
    const source = dragging.status;
    const lead = (pipeline[source] || []).find(item => item._id === dragging.id);
    if (!lead) return;

    setPipeline(current => ({
      ...current,
      [source]: (current[source] || []).filter(item => item._id !== lead._id),
      [targetStage]: [{ ...lead, status: targetStage }, ...(current[targetStage] || [])]
    }));
    setDragging(null);
    try {
      await leadService.update(lead._id, { status: targetStage });
      toast.success(`${lead.name} moved to ${targetStage}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      load();
    }
  };

  if (loading) return <Loader label="Arranging pipeline…" />;
  const totalLeads = Object.values(pipeline).reduce((sum, leads) => sum + leads.length, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        description={canDrag ? 'Drag lead cards between columns to update their status instantly.' : 'A read-only view of every accessible opportunity by stage.'}
        eyebrow="Sales flow"
        title="Pipeline"
      />
      {!totalLeads ? <EmptyState title="Your pipeline is empty" description="Create a lead to begin tracking opportunities." /> : (
        <div className="flex snap-x gap-4 overflow-x-auto pb-5">
          {stages.map(stage => {
            const leads = pipeline[stage] || [];
            const stageValue = leads.reduce((sum, lead) => sum + Number(lead.estimatedValue || 0), 0);
            return (
              <section
                className={`w-[300px] shrink-0 snap-start rounded-2xl border bg-gray-100/70 transition ${overStage === stage ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-100' : 'border-line'}`}
                key={stage}
                onDragEnter={() => canDrag && setOverStage(stage)}
                onDragOver={event => event.preventDefault()}
                onDrop={() => drop(stage)}
              >
                <header className="rounded-t-2xl border-b border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-display text-sm font-extrabold text-ink-950"><i className={`h-2.5 w-2.5 rounded-full ${stageAccent[stage] || 'bg-gray-400'}`} /> {stage}</span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-black text-ink-600">{leads.length}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-ink-400">{formatCurrency(stageValue)}</p>
                </header>
                <div className="min-h-[480px] space-y-3 p-3">
                  {leads.map(lead => (
                    <article
                      className={`group rounded-2xl border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-card ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      draggable={canDrag}
                      key={lead._id}
                      onDragEnd={() => { setDragging(null); setOverStage(null); }}
                      onDragStart={() => setDragging({ id: lead._id, status: stage })}
                    >
                      <div className="flex items-start gap-2">
                        {canDrag ? <GripVertical className="-ml-2 mt-0.5 shrink-0 text-ink-400 opacity-0 transition group-hover:opacity-100" size={17} /> : null}
                        <div className="min-w-0 flex-1">
                          <Link className="block truncate font-bold text-ink-950 hover:text-brand-700" to={`/leads/${lead._id}`}>{lead.name}</Link>
                          <p className="mt-1 truncate text-xs text-ink-400">{lead.company || lead.phone}</p>
                        </div>
                        <StatusBadge value={lead.priority} />
                      </div>
                      <div className="mt-4 space-y-2 text-xs text-ink-600">
                        <p className="flex items-center gap-2"><Building2 size={14} /> <span className="font-bold text-ink-800">{formatCurrency(lead.estimatedValue)}</span></p>
                        <p className="flex items-center gap-2"><UserRound size={14} /> {lead.assignedTo?.name || 'Unassigned'}</p>
                        <p className="flex items-center gap-2"><CalendarClock size={14} /> {formatDate(lead.followUpDate || lead.nextFollowUp)}</p>
                      </div>
                    </article>
                  ))}
                  {!leads.length ? <div className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-line bg-white/60 text-xs font-semibold text-ink-400">Drop a lead here</div> : null}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
