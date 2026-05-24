import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store';
import { Search, Star, MessageSquareQuote, Check, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function CompanyNotes() {
  const { applications, companyNotes, updateCompanyNote, addCompanyNote } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Group applications by company
  const companies = useMemo(() => {
    const map = new Map<string, { company: string; count: number }>();
    applications.forEach(a => {
      const c = a.company.trim();
      if (!map.has(c)) map.set(c, { company: c, count: 0 });
      map.get(c)!.count += 1;
    });
    
    // Check if there are notes for companies without applications
    companyNotes.forEach(n => {
      const c = n.company.trim();
      if (!map.has(c)) map.set(c, { company: c, count: 0 });
    });

    return Array.from(map.values())
      .filter(c => c.company.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b) => a.company.localeCompare(b.company));
  }, [applications, companyNotes, search]);

  const activeNote = useMemo(() => {
    if (!selectedCompany) return null;
    return companyNotes.find(n => n.company.trim() === selectedCompany) || null;
  }, [selectedCompany, companyNotes]);

  const activeApps = useMemo(() => {
    if (!selectedCompany) return [];
    return applications.filter(a => a.company.trim() === selectedCompany).sort((a,b) => b.createdAt - a.createdAt);
  }, [selectedCompany, applications]);

  const handleSaveNote = (updates: Partial<typeof activeNote>) => {
    if (!selectedCompany) return;
    if (activeNote) {
      updateCompanyNote(activeNote.id, updates);
    } else {
      addCompanyNote({ company: selectedCompany, notes: '', ...updates });
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-semibold">Şirket Notları</h1>
        <p className="text-slate-500 mt-1 text-sm">Şirketler hakkında görüşlerinizi ve değerlendirmelerinizi kaydedin.</p>
      </header>

      <div className="flex bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 min-h-0 overflow-hidden">
        {/* Left pane - Company list */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Şirket ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {companies.map(c => (
              <button
                key={c.company}
                onClick={() => setSelectedCompany(c.company)}
                className={`w-full text-left px-5 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between ${selectedCompany === c.company ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
              >
                <div>
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{c.company}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{c.count} başvuru</p>
                </div>
              </button>
            ))}
            {companies.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-8">Kayıt bulunamadı.</p>
            )}
          </div>
        </div>

        {/* Right pane - Detail */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedCompany ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="p-8 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCompany}</h2>
                    <input 
                      placeholder="Sektör ekle (Örn: Finans, E-ticaret)"
                      value={activeNote?.industry || ''}
                      onChange={e => handleSaveNote({ industry: e.target.value })}
                      className="mt-1 bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-500 placeholder-slate-400 outline-none w-64"
                    />
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => handleSaveNote({ rating: star })} className="p-1 focus:outline-none">
                        <Star className={`w-6 h-6 ${(activeNote?.rating || 0) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {(['Olumlu', 'Olumsuz', 'Nötr'] as const).map(disp => (
                    <button 
                      key={disp}
                      onClick={() => handleSaveNote({ disposition: disp })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5
                        ${activeNote?.disposition === disp 
                           ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200' 
                           : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      {activeNote?.disposition === disp && <Check className="w-3.5 h-3.5" />}
                      {disp}
                    </button>
                  ))}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><MessageSquareQuote className="w-4 h-4" /> Değerlendirme & Notlar</h3>
                  <textarea
                    value={activeNote?.notes || ''}
                    onChange={e => handleSaveNote({ notes: e.target.value })}
                    placeholder="Şirket kültürü, mülakat süreci, izlenimleriniz..."
                    className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>
              </div>

              {/* Timeline portion */}
              <div className="p-8">
                <h3 className="text-sm font-semibold mb-4">Başvuru Geçmişi</h3>
                {activeApps.length === 0 ? (
                  <p className="text-sm text-slate-500">Bu şirkete yapılmış başvuru bulunmuyor.</p>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                    {activeApps.map(app => (
                      <div key={app.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                           <div className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{app.title}</span>
                            <span className="text-slate-500 text-xs">{format(new Date(app.createdAt), 'dd MMM yyyy', { locale: tr })}</span>
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                             Durum: {app.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Building2 className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-700" />
              <p>Görüntülemek için sol taraftan bir şirket seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

