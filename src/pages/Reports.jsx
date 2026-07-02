import { CalendarRange, Download, Target, TrendingUp, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { getErrorMessage } from '../api/axios';
import Loader from '../components/Loader';
import DataTable from '../components/DataTable';
import { EmptyState, MetricCard, PageHeader } from '../components/UI';
import { reportService } from '../services/reportService';
import { CHART_COLORS, LEAD_STATUSES } from '../utils/constants';
import { downloadBlob } from '../utils/download';
import { formatCompactNumber, formatCurrency } from '../utils/formatDate';

const labelFromMonth = item => new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' }).format(new Date(item._id.year, item._id.month - 1, 1));

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await reportService.summary({
        from: filters.from || undefined,
        to: filters.to || undefined
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const exportWorkbook = async () => {
    try {
      const blob = await reportService.export({
        from: filters.from || undefined,
        to: filters.to || undefined
      });
      downloadBlob(blob, `real-estate-reports-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Report workbook downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const totalLeads = summary?.totals?.totalLeads || summary?.conversion?.totalLeads || 0;
  const pipeline = summary?.pipeline || summary?.leadsByStatus || [];
  const sources = summary?.sources || summary?.leadsBySource || [];
  const revenue = summary?.revenue || {};
  const users = summary?.users || [];
  const monthlyLeads = (summary?.monthlyLeads || []).map(item => ({ ...item, label: labelFromMonth(item) }));
  const monthlyRevenue = (revenue.monthly || []).map(item => ({ ...item, label: labelFromMonth(item) }));
  const tasks = summary?.tasks || {};

  const statusRows = useMemo(() => LEAD_STATUSES.map(status => ({
    status,
    leads: (summary?.leadsByStatus || []).find(item => item._id === status)?.leads || 0
  })), [summary]);

  const userColumns = [
    { key: 'name', header: 'User', render: row => <div><p className="font-bold text-ink-950">{row.name}</p><p className="text-xs text-ink-400">{row.role?.replaceAll('_', ' ')}</p></div> },
    { key: 'leads', header: 'Leads' },
    { key: 'converted', header: 'Converted' },
    { key: 'conversionRate', header: 'Conversion', render: row => `${row.conversionRate}%` },
    { key: 'tasks', header: 'Tasks' },
    { key: 'revenue', header: 'Revenue', render: row => formatCurrency(row.revenue) }
  ];

  if (loading && !summary) return <Loader fullPage label="Loading reports…" />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        actions={<button className="btn-primary" onClick={exportWorkbook} type="button"><Download size={17} /> Export workbook</button>}
        description="Monitor lead flow, project performance, revenue, and team output."
        eyebrow="Analytics"
        title="Reports"
      />

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <CalendarRange className="mb-2 hidden text-[#8b6520] sm:block" size={21} />
        <label className="block flex-1"><span className="field-label">From</span><input className="field" max={filters.to || undefined} onChange={event => setFilters(current => ({ ...current, from: event.target.value }))} type="date" value={filters.from} /></label>
        <label className="block flex-1"><span className="field-label">To</span><input className="field" min={filters.from || undefined} onChange={event => setFilters(current => ({ ...current, to: event.target.value }))} type="date" value={filters.to} /></label>
        <button className="btn-secondary" onClick={() => setFilters({ from: '', to: '' })} type="button">Clear</button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard helper={`${summary?.conversion?.convertedLeads || 0} converted`} icon={Target} label="Conversion rate" tone="green" value={`${summary?.conversion?.conversionRate || 0}%`} />
        <MetricCard helper={`${summary?.totals?.totalProperties || 0} projects / units`} icon={TrendingUp} label="Pipeline leads" tone="blue" value={formatCompactNumber(totalLeads)} />
        <MetricCard helper={`${tasks.overdueTasks || 0} overdue`} icon={UsersRound} label="Task completion" tone="amber" value={`${tasks.completionRate || 0}%`} />
        <MetricCard helper={`${summary?.totals?.totalTransfers || 0} transfers`} icon={UsersRound} label="Revenue" tone="violet" value={formatCompactNumber(revenue.summary?.totalRevenue || 0)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold">Monthly lead trend</h2>
          <p className="mt-1 text-sm text-ink-600">Created and converted leads over time</p>
          {monthlyLeads.length ? (
            <div className="mt-5 h-72">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={monthlyLeads}>
                  <defs>
                    <linearGradient id="leadArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#3d1515" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3d1515" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e7ecea" strokeDasharray="4 4" vertical={false} />
                  <XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} />
                  <YAxis axisLine={false} allowDecimals={false} fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area dataKey="leads" fill="url(#leadArea)" name="Leads" stroke="#3d1515" strokeWidth={2.5} type="monotone" />
                  <Area dataKey="converted" fill="transparent" name="Converted" stroke="#d8b04f" strokeWidth={2} type="monotone" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="mt-5"><EmptyState title="No monthly data" /></div>}
        </article>

        <article className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold">Pipeline health</h2>
          <p className="mt-1 text-sm text-ink-600">Lead count in each stage</p>
          {pipeline.length ? (
            <div className="mt-5 h-72">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={pipeline}>
                  <CartesianGrid stroke="#e7ecea" strokeDasharray="4 4" vertical={false} />
                  <XAxis axisLine={false} dataKey="_id" fontSize={10} interval={0} tickLine={false} />
                  <YAxis axisLine={false} allowDecimals={false} fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#7564bf" name="Leads" radius={[7, 7, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="mt-5"><EmptyState title="No pipeline data" /></div>}
        </article>

        <article className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold">Lead sources</h2>
          <p className="mt-1 text-sm text-ink-600">Where opportunities enter the CRM</p>
          {sources.length ? (
            <div className="mt-5 h-72">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie cx="50%" cy="50%" data={sources} dataKey="leads" innerRadius={60} nameKey="_id" outerRadius={100} paddingAngle={3}>
                    {sources.map((item, index) => <Cell fill={CHART_COLORS[index % CHART_COLORS.length]} key={item._id} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="mt-5"><EmptyState title="No source data" /></div>}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {sources.map((source, index) => (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-600" key={source._id}>
                <i className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                {source._id} ({source.leads})
              </span>
            ))}
          </div>
        </article>

        <article className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold">Monthly revenue</h2>
          <p className="mt-1 text-sm text-ink-600">Revenue recognized from converted leads</p>
          {monthlyRevenue.length ? (
            <div className="mt-5 h-72">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid stroke="#e7ecea" strokeDasharray="4 4" vertical={false} />
                  <XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} />
                  <YAxis axisLine={false} fontSize={11} tickFormatter={formatCompactNumber} tickLine={false} />
                  <Tooltip formatter={value => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#23916d" name="Revenue" radius={[7, 7, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="mt-5"><EmptyState title="No revenue data" /></div>}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <article className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold">Lead status table</h2>
            <span className="text-xs text-ink-400">Current summary</span>
          </div>
          <div className="mt-4">
            <DataTable
              columns={[
                { key: 'status', header: 'Status', render: row => row.status },
                { key: 'leads', header: 'Leads' }
              ]}
              emptyMessage="No status data"
              rows={statusRows}
            />
          </div>
        </article>

        <article className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold">User performance</h2>
          <p className="mt-1 text-sm text-ink-600">Lead and task outcomes for the team</p>
          <div className="mt-4 h-[420px] overflow-auto">
            <DataTable columns={userColumns} emptyMessage="No user performance data" loading={false} rows={users} />
          </div>
        </article>
      </section>
    </div>
  );
}
