import React, { useState } from 'react';
import { useAppStore } from '../store';
import { JobApplication, JobStatus } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bookmark, Clock, MoreVertical, Plus } from 'lucide-react';

const columns: { id: JobStatus; label: string; color: string; bg: string; dot: string; }[] = [
  { id: 'applied', label: 'Başvuruldu', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-500' },
  { id: 'interview', label: 'Mülakat', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20', dot: 'bg-blue-500' },
  { id: 'offer', label: 'Teklif Geldi', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/20', dot: 'bg-green-500' },
  { id: 'pending', label: 'Beklemede', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-500' },
  { id: 'rejected', label: 'Reddedildi', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-900/20', dot: 'bg-red-500' },
];

export function KanbanBoard({ onEditClick }: { onEditClick: (app: JobApplication) => void }) {
  const { applications, updateApplication } = useAppStore();

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('appId', id);
  };

  const handleDrop = (e: React.DragEvent, status: JobStatus) => {
    const id = e.dataTransfer.getData('appId');
    if (id) {
      updateApplication(id, { status });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-160px)] items-start pt-2">
      {columns.map(col => {
        const colApps = applications.filter(a => a.status === col.id).sort((a,b) => b.updatedAt - a.updatedAt);
        return (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            className={`flex-shrink-0 w-80 rounded-xl flex flex-col max-h-full border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm shadow-sm`}
          >
            <div className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-t-xl ${col.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h3 className={`font-semibold text-sm ${col.color}`}>{col.label}</h3>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-slate-600 dark:text-slate-300">
                {colApps.length}
              </span>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {colApps.map(app => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.id)}
                  onClick={() => onEditClick(app)}
                  className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">
                         {app.company.substring(0,2)}
                       </div>
                       <div>
                         <h4 className="text-sm font-semibold line-clamp-1">{app.title}</h4>
                         <p className="text-xs text-slate-500">{app.company}</p>
                       </div>
                    </div>
                    <button
                       onClick={(e) => { e.stopPropagation(); updateApplication(app.id, { isFavorite: !app.isFavorite }); }}
                       className="p-1 -mr-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                     >
                       <Bookmark className={`w-4 h-4 ${app.isFavorite ? 'fill-indigo-500 text-indigo-500' : ''}`} />
                     </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
                      {app.source}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: tr })}
                    </div>
                  </div>
                </div>
              ))}
              {colApps.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xs text-slate-400 font-medium">Buraya sürükle</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
