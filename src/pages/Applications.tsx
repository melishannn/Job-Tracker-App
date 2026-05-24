import React, { useState } from 'react';
import { KanbanBoard } from '../components/KanbanBoard';
import { JobApplication, JobSource, JobStatus } from '../types';
import { useAppStore } from '../store';
import { Plus, X, List, LayoutGrid } from 'lucide-react';

export default function Applications() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  
  const { addApplication, updateApplication, deleteApplication, applications } = useAppStore();

  const handleOpenNew = () => {
    setEditingApp(null);
    setIsModalOpen(true);
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get('title') as string,
      company: fd.get('company') as string,
      source: fd.get('source') as JobSource,
      url: fd.get('url') as string,
      status: fd.get('status') as JobStatus,
      location: fd.get('location') as string,
      workType: fd.get('workType') as any,
      salaryExpectation: fd.get('salaryExpectation') as string,
      notes: fd.get('notes') as string,
      dateApplied: new Date().toISOString(),
      isFavorite: editingApp ? editingApp.isFavorite : false,
    };

    if (editingApp) {
      updateApplication(editingApp.id, data);
    } else {
      addApplication(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Başvurularım</h1>
          <p className="text-slate-500 mt-1 text-sm">Tüm iş başvurularınızı takip edin ve durumlarını güncelleyin.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center">
            <button onClick={() => setView('kanban')} className={`p-1.5 rounded-md ${view === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleOpenNew} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-transform active:scale-95">
            <Plus className="w-4 h-4" />
            Yeni Başvuru
          </button>
        </div>
      </header>

      {/* Main Board View */}
      <div className="flex-1 min-h-0">
        {view === 'kanban' ? (
          <KanbanBoard onEditClick={handleEdit} />
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 overflow-x-auto min-h-[400px]">
            {/* Simple list view representation */}
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Şirket</th>
                  <th className="px-4 py-3 font-medium">Pozisyon</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">Kaynak</th>
                  <th className="px-4 py-3 font-medium">Notlar</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} onClick={() => handleEdit(app)} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{app.company}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{app.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{app.source}</td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">{app.notes || '-'}</td>
                  </tr>
                ))}
                {applications.length === 0 && (
                   <tr>
                     <td colSpan={5} className="text-center py-8 text-slate-500">Kayıt bulunamadı.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Drawer / Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold">{editingApp ? 'Başvuruyu Düzenle' : 'Yeni Başvuru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Şirket Adı <span className="text-red-500">*</span></label>
                  <input required name="company" defaultValue={editingApp?.company} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">İş Başlığı <span className="text-red-500">*</span></label>
                  <input required name="title" defaultValue={editingApp?.title} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Durum</label>
                    <select name="status" defaultValue={editingApp?.status || 'applied'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                      <option value="applied">Başvuruldu</option>
                      <option value="interview">Mülakat</option>
                      <option value="offer">Teklif Geldi</option>
                      <option value="rejected">Reddedildi</option>
                      <option value="pending">Beklemede</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Kaynak</label>
                    <select name="source" defaultValue={editingApp?.source || 'LinkedIn'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Kariyer.net">Kariyer.net</option>
                      <option value="Kariyer Ibb">Kariyer Ibb</option>
                      <option value="WellFound">Indeed</option>
                      <option value="Glassdoor">Glassdoor</option>
                      <option value="Bölgesel İstihdam">Bolgesel Istihdam</option>
                      <option value="Upwork">Upwork</option>
                      <option value="Outlier">Outlier</option>
                      <option value="Wonsulting AI">Wonsulting AI</option>
                      <option value="Eleman.net">Eleman Net</option>
                      <option value="Hiringcafe">Hiringcafe</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Çalışma Şekli</label>
                    <select name="workType" defaultValue={editingApp?.workType || 'Remote'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                      <option value="Remote">Remote</option>
                      <option value="Hibrit">Hibrit</option>
                      <option value="Ofis">Ofis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Maaş Beklentisi</label>
                    <input name="salaryExpectation" defaultValue={editingApp?.salaryExpectation} placeholder="örn: 40k" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">İlan URL</label>
                  <input type="url" name="url" defaultValue={editingApp?.url} placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Notlar</label>
                  <textarea name="notes" defaultValue={editingApp?.notes} rows={4} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                {editingApp ? (
                  <button type="button" onClick={() => { deleteApplication(editingApp.id); setIsModalOpen(false); }} className="text-red-500 text-sm font-medium hover:underline">
                    Sil
                  </button>
                ) : <div />}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                    İptal
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-sm">
                    {editingApp ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

