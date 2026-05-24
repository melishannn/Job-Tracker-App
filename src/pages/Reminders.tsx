import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { ReminderType, Reminder } from '../types';
import { Bell, BellOff, CheckCircle2, Trash2, CalendarClock, Plus, X } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Reminders() {
  const { reminders, applications, addReminder, updateReminder, deleteReminder } = useAppStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(setPermission);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addReminder({
      type: fd.get('type') as ReminderType,
      jobId: fd.get('jobId') as string,
      date: new Date(`${fd.get('date')}T${fd.get('time')}`).toISOString(),
      notes: fd.get('notes') as string,
      isCompleted: false,
    });
    setIsModalOpen(false);
  };

  const getAppName = (jobId?: string) => {
    if (!jobId) return null;
    const app = applications.find(a => a.id === jobId);
    return app ? `${app.company} - ${app.title}` : null;
  };

  const formatRelDate = (iso: string) => {
    const d = new Date(iso);
    if (isToday(d)) return `Bugün ${format(d, 'HH:mm')}`;
    if (isTomorrow(d)) return `Yarın ${format(d, 'HH:mm')}`;
    return format(d, 'dd MMM HH:mm', { locale: tr });
  };

  const overdue = reminders.filter(r => !r.isCompleted && isPast(new Date(r.date))).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcoming = reminders.filter(r => !r.isCompleted && !isPast(new Date(r.date))).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completed = reminders.filter(r => r.isCompleted).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Hatırlatıcılar</h1>
          <p className="text-slate-500 mt-1 text-sm">Görevlerinizi ve mülakatlarınızı takip edin.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Ekle
        </button>
      </header>

      {permission === 'default' && (
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-xl flex items-start gap-4">
          <Bell className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Bildirimlere İzin Verin</h3>
            <p className="text-sm mt-1 opacity-90">Hatırlatıcı zamanı geldiğinde tarayıcı üzerinden bildirim alabilmek için lütfen izin verin.</p>
          </div>
          <button onClick={handleRequestPermission} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            İzin Ver
          </button>
        </div>
      )}
      
      {permission === 'denied' && (
        <div className="bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 p-4 rounded-xl flex items-center gap-4">
          <BellOff className="w-5 h-5 shrink-0" />
          <p className="text-sm">Tarayıcı bildirimleri engellendi. Hatırlatıcılar sessizce eklenecektir.</p>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-xl overflow-hidden">
          <div className="bg-red-100/50 dark:bg-red-900/30 px-4 py-2 border-b border-red-100 dark:border-red-900/50 font-semibold text-red-700 dark:text-red-400 text-sm">
            Gecikenler
          </div>
          <div className="divide-y divide-red-100 dark:divide-red-900/50">
            {overdue.map(r => (
              <ReminderRow key={r.id} reminder={r} appName={getAppName(r.jobId)} onUpdate={updateReminder} onDelete={deleteReminder} isOverdue />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <span className="text-sm">Yaklaşanlar</span>
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{upcoming.length}</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Yaklaşan hatırlatıcı yok.</p>
          ) : upcoming.map(r => (
            <ReminderRow key={r.id} reminder={r} appName={getAppName(r.jobId)} onUpdate={updateReminder} onDelete={deleteReminder} />
          ))}
        </div>
      </section>

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <button onClick={() => setShowCompleted(!showCompleted)} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4" /> Tamamlananları {showCompleted ? 'Gizle' : 'Göster'} ({completed.length})
          </button>
          
          {showCompleted && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800 opacity-75">
              {completed.map(r => (
                <ReminderRow key={r.id} reminder={r} appName={getAppName(r.jobId)} onUpdate={updateReminder} onDelete={deleteReminder} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold">Yeni Hatırlatıcı</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Tür <span className="text-red-500">*</span></label>
                <select name="type" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option value="Takip e-postası">Takip e-postası</option>
                  <option value="Mülakat hazırlığı">Mülakat hazırlığı</option>
                  <option value="Yanıt bekleme">Yanıt bekleme</option>
                  <option value="Özel">Özel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">İlgili Başvuru</label>
                <select name="jobId" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                  <option value="">-- Bağımsız --</option>
                  {applications.filter(a => a.status !== 'rejected').map(a => (
                    <option key={a.id} value={a.id}>{a.company} - {a.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Tarih <span className="text-red-500">*</span></label>
                  <input type="date" name="date" required defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Saat <span className="text-red-500">*</span></label>
                  <input type="time" name="time" required defaultValue="10:00" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Notlar</label>
                <textarea name="notes" rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                  İptal
                </button>
                <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium mb-4">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReminderRow({ reminder, appName, onUpdate, onDelete, isOverdue }: any) {
  const formatRelDate = (iso: string) => {
    const d = new Date(iso);
    if (isToday(d)) return `Bugün ${format(d, 'HH:mm')}`;
    if (isTomorrow(d)) return `Yarın ${format(d, 'HH:mm')}`;
    return format(d, 'dd MMM HH:mm', { locale: tr });
  };

  return (
    <div className={`p-4 flex items-center justify-between group transition-colors ${reminder.isCompleted ? 'opacity-70' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => onUpdate(reminder.id, { isCompleted: !reminder.isCompleted })} 
          className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors 
            ${reminder.isCompleted ? 'bg-primary border-primary text-white' : 'border-slate-300 hover:border-primary text-transparent'}`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className={`text-sm font-medium ${reminder.isCompleted ? 'line-through text-slate-500' : isOverdue ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {reminder.type}
            </h4>
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
              reminder.isCompleted ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 
              isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
            }`}>
              <CalendarClock className="w-3.5 h-3.5" /> 
              {formatRelDate(reminder.date)}
            </div>
          </div>
          
          {appName && <p className="text-xs text-slate-500 mb-1">💼 {appName}</p>}
          {reminder.notes && <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{reminder.notes}</p>}
        </div>
      </div>

      <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onDelete(reminder.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

