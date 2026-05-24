import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Briefcase, Clock, Calendar, AlertTriangle, ArrowRight, AlertCircle, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobStatus, JobApplication } from '../types';

const statusColors: Record<JobStatus, string> = {
  applied: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  interview: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  offer: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const statusLabels: Record<JobStatus, string> = {
  applied: 'Başvuruldu',
  interview: 'Mülakat',
  offer: 'Teklif Geldi',
  rejected: 'Reddedildi',
  pending: 'Beklemede'
};

export default function Dashboard() {
  const { applications, reminders, user } = useAppStore();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { auth } = await import('../lib/firebase');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert('Giriş yapılamadı.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const today = new Date();
  
  // 1. Welcome Message Data
  const todayAppsCount = applications.filter(a => a.createdAt >= subDays(today, 1).getTime()).length;
  const upcomingInterviewsCount = applications.filter(a => a.status === 'interview').length;

  // 2. Metric Cards
  const totalApps = applications.length;
  // This week vs last week logic could be complex. Let's do simple: applied in last 7 days.
  const thisWeekApps = applications.filter(a => a.createdAt >= subDays(today, 7).getTime());
  const pendingApps = applications.filter(a => a.status === 'pending' || a.status === 'applied').length;

  // 3. Last 5 Applications
  const recentApps = [...applications].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  // 4. Upcoming reminders
  const upcomingReminders = [...reminders]
    .filter(r => !r.isCompleted && new Date(r.date).getTime() >= today.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // 5. Mini 7-day Bar Chart Data
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(today, 6 - i);
      const count = applications.filter(a => new Date(a.createdAt).toDateString() === d.toDateString()).length;
      return { 
        name: format(d, 'EEEEEE', { locale: tr }), 
        count 
      };
    });
  }, [applications]);

  // 6. Ghosted Apps
  const ghostedApps = applications
    .filter(a => (a.status === 'applied' || a.status === 'pending') && differenceInDays(today, new Date(a.updatedAt)) > 14)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header>
        <h1 className="text-2xl font-semibold">Merhaba 👋</h1>
        <p className="text-slate-500 mt-1">Bugün {todayAppsCount} başvurun var, {upcomingInterviewsCount} mülakatın yaklaşıyor.</p>
      </header>

      {/* Guest Mode Alert */}
      {!user && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm">
              <strong>Misafir olarak kullanıyorsunuz.</strong> Bilgileriniz tarayıcınızın yerel depolamasında (Local Storage) saklanmaktadır. Eğer tarayıcı verilerini temizlerseniz tü‌m verileriniz silinir.
            </p>
          </div>
          <button onClick={handleSignIn} disabled={isSigningIn} className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
            <Cloud className="w-4 h-4" /> {isSigningIn ? 'Bağlanıyor...' : 'Firebase ile Kaydol'}
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Başvuru', value: totalApps, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Bu Hafta', value: thisWeekApps.length, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Yanıt Bekliyor', value: pendingApps, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Yaklaşan Mülakatlar', value: upcomingInterviewsCount, icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Son Başvurular</h2>
              <Link to="/applications" className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">Tümünü gör <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="space-y-4">
              {recentApps.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Henüz başvuru bulunmuyor.</p>
              ) : recentApps.map(app => (
                <div key={app.id} className="flex items-center justify-between group p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold uppercase text-slate-600 dark:text-slate-300">
                      {app.company.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-50">{app.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{app.company} • {format(app.createdAt, 'dd MMM yyyy', { locale: tr })}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ghosted Apps */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
            <h2 className="text-base font-semibold mb-4">Dönüş Yapmayanlar <span className="text-xs font-normal text-slate-500 ml-2">&gt;14 Gün</span></h2>
            <div className="space-y-3">
               {ghostedApps.length === 0 ? (
                 <p className="text-sm text-slate-500">Durumu geciken başvuru yok.</p>
               ) : ghostedApps.map(app => (
                 <div key={app.id} className="flex items-center justify-between text-sm">
                   <div className="truncate flex-1">
                     <span className="font-medium mr-2">{app.company}</span>
                     <span className="text-slate-500">{app.title}</span>
                   </div>
                   <button className="text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded hover:bg-indigo-100">
                     Takip et
                   </button>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 h-64 flex flex-col">
            <h2 className="text-base font-semibold mb-4">Aktivite (Son 7 Gün)</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Yaklaşan Hatırlatıcılar</h2>
              <Link to="/reminders" className="text-indigo-600 text-sm font-medium hover:underline">Tümü</Link>
            </div>
            <div className="space-y-4">
              {upcomingReminders.length === 0 ? (
                 <p className="text-sm text-slate-500 text-center py-2">Yaklaşan hatırlatıcı yok.</p>
              ) : upcomingReminders.map(rem => (
                <div key={rem.id} className="flex gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium">{rem.type}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{format(new Date(rem.date), 'dd MMM HH:mm', { locale: tr })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

