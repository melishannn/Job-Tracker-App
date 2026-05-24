import React, { useMemo } from 'react';
import { useAppStore } from '../store';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, YAxis, 
  PieChart, Pie, Cell, AreaChart, Area, ReferenceLine, CartesianGrid 
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Briefcase, TrendingUp, Inbox, Activity } from 'lucide-react';

const COLORS = ['#6366F1', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Statistics() {
  const { applications } = useAppStore();
  const today = new Date();

  // Metrics
  const totalApps = applications.length;
  const thisWeekApps = applications.filter(a => a.createdAt >= subDays(today, 7).getTime()).length;
  const lastWeekApps = applications.filter(a => a.createdAt >= subDays(today, 14).getTime() && a.createdAt < subDays(today, 7).getTime()).length;
  const trend = lastWeekApps > 0 ? Math.round(((thisWeekApps - lastWeekApps) / lastWeekApps) * 100) : 100;
  
  const respondedApps = applications.filter(a => a.status === 'interview' || a.status === 'offer' || a.status === 'rejected').length;
  const responseRate = totalApps > 0 ? Math.round((respondedApps / totalApps) * 100) : 0;
  
  const activeProcess = applications.filter(a => a.status === 'interview' || a.status === 'pending').length;

  // 30 Days Bar Chart
  const last30DaysData = useMemo(() => {
    const data = Array.from({ length: 30 }).map((_, i) => {
      const d = subDays(today, 29 - i);
      const count = applications.filter(a => new Date(a.createdAt).toDateString() === d.toDateString()).length;
      return { date: format(d, 'dd MMM', { locale: tr }), count };
    });
    return data;
  }, [applications]);
  const avgAppsPerDay = totalApps > 0 ? (last30DaysData.reduce((sum, d) => sum + d.count, 0) / 30).toFixed(1) : 0;

  // Status Donut
  const statusData = useMemo(() => {
    const map = new Map();
    applications.forEach(a => {
      map.set(a.status, (map.get(a.status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [applications]);

  // Source Horizontal Bar
  const sourceData = useMemo(() => {
    const map = new Map();
    applications.forEach(a => {
      map.set(a.source, (map.get(a.source) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
  }, [applications]);

  // Company Diversity
  const companyData = useMemo(() => {
    const map = new Map();
    applications.forEach(a => {
      map.set(a.company, (map.get(a.company) || 0) + 1);
    });
    const sorted = Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    return { unique: sorted.length, top5: sorted.slice(0, 5) };
  }, [applications]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">İstatistikler</h1>
        <p className="text-slate-500 mt-1 text-sm">Başvuru süreçlerinizin performans ve metrik analizleri.</p>
      </header>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Başvuru</p>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><Briefcase className="w-4 h-4 text-indigo-600" /></div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalApps}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bu Hafta</p>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{thisWeekApps}</p>
            <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Yanıt Oranı</p>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><Inbox className="w-4 h-4 text-blue-600" /></div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">%{responseRate}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aktif Süreç</p>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg"><Activity className="w-4 h-4 text-amber-600" /></div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{activeProcess}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-80 flex flex-col">
          <h2 className="text-base font-semibold mb-6">Son 30 Günlük Başvuru Hızı</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30DaysData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} minTickGap={20} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#64748b', fontSize: '12px' }}
                />
                <ReferenceLine y={Number(avgAppsPerDay)} stroke="#94a3b8" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut & Company List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-80 flex flex-col items-center">
            <h2 className="text-base font-semibold w-full mb-2">Durum Dağılımı</h2>
            <div className="relative w-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold">{totalApps}</p>
                  <p className="text-xs text-slate-500">Toplam</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-80 overflow-y-auto">
            <h2 className="text-base font-semibold mb-1">Şirket Çeşitliliği</h2>
            <p className="text-sm text-slate-500 mb-6">{companyData.unique} farklı şirkete başvuruldu</p>
            <div className="space-y-4">
              {companyData.top5.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{c.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.value / (companyData.top5[0]?.value || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-4">{c.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Horizontal Bar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-80 flex flex-col lg:col-span-2">
          <h2 className="text-base font-semibold mb-6">Kaynak Performansı</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

