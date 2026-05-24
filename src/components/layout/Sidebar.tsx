import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  LayoutDashboard, 
  FileText, 
  Bookmark, 
  Building2, 
  BarChart3, 
  Bell, 
  Settings, 
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import { useAppStore } from '../../store';

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (val: boolean) => void }) {
  const { applications, reminders, user } = useAppStore();
  const activeCount = applications.filter(a => a.status !== 'rejected' && a.status !== 'offer').length;
  const pendingReminders = reminders.filter(r => !r.isCompleted).length;
  
  const [isDark, setIsDark] = useState(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/applications', icon: FileText, label: 'Başvurularım', badge: activeCount },
    { to: '/saved', icon: Bookmark, label: 'Kayıtlı İlanlar' },
    { to: '/company-notes', icon: Building2, label: 'Şirket Notları' },
    { to: '/statistics', icon: BarChart3, label: 'İstatistikler' },
    { to: '/reminders', icon: Bell, label: 'Hatırlatıcılar', badge: pendingReminders, badgeColor: 'bg-red-500 text-white' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-40 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} transition-all duration-300`}>
          <Briefcase className="w-6 h-6 text-primary flex-shrink-0" />
          <span className="font-semibold text-lg whitespace-nowrap">JobTracker</span>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
              ${isActive ? 'bg-indigo-100 text-primary dark:bg-primary-dark/20 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
            `}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="flex-1 truncate font-medium text-sm">{item.label}</span>
            )}
            {!collapsed && item.badge !== undefined && item.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.badgeColor || 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'}`}>
                {item.badge}
              </span>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <button 
          onClick={() => setIsDark(!isDark)} 
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          {!collapsed && <span className="text-sm font-medium">Tema Değiştir</span>}
        </button>
        
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 font-semibold text-primary">
            {user ? (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase() : 'M'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex justify-between items-center group">
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">
                  {user ? (user.displayName || 'Kullanıcı') : 'Misafir'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user ? user.email : 'Giriş yapılmadı'}</p>
              </div>
              {user && (
                <button 
                  onClick={async () => {
                    const { auth } = await import('../../lib/firebase');
                    await auth.signOut();
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded"
                >
                  Çıkış
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

