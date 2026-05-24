import React from 'react';
import { useAppStore } from '../store';
import { Bookmark, ExternalLink, MapPin, Building, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function SavedJobs() {
  const { applications, updateApplication, deleteApplication } = useAppStore();
  const savedJobs = applications.filter(a => a.isFavorite).sort((a,b) => b.updatedAt - a.updatedAt);
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Kayıtlı İlanlar</h1>
        <p className="text-slate-500 mt-1 text-sm">Beğendiğiniz ve daha sonra başvurmayı düşündüğünüz ilanlar.</p>
      </header>

      {savedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Kayıtlı ilanınız bulunmuyor</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">İlgilendiğiniz iş ilanlarını kaydederek burada listeleyebilirsiniz.</p>
          <button onClick={() => navigate('/applications')} className="mt-6 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors">
            Başvurulara Git
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] transition-all p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-1">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1.5">
                    <Building className="w-4 h-4" />
                    <span className="truncate">{job.company}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => updateApplication(job.id, { isFavorite: false })} className="p-1 -mr-1 -mt-1 text-primary hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-md transition-colors">
                  <Bookmark className="w-5 h-5 fill-current" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                  {job.source}
                </span>
                {job.workType && (
                  <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                    {job.workType}
                  </span>
                )}
              </div>

              {job.notes && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  {job.notes}
                </p>
              )}

               <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true, locale: tr })} kaydedildi
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => deleteApplication(job.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => navigate('/applications')} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors">
                    Başvur
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

