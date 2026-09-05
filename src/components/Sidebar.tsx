import React from 'react';
import {
  LayoutDashboard,
  FolderInput,
  Cpu,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  Layers,
  WifiOff,
  ClipboardList,
  Activity,
  BarChart3,
  User
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  exceptionCount?: number;
  failedTransferCount?: number;
  pendingReviewCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  exceptionCount = 0,
  failedTransferCount = 0,
  pendingReviewCount = 0
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records', label: 'Rural Records', icon: FileSpreadsheet },
    { id: 'officer-review', label: 'Officer Review', icon: UserCheck, badge: pendingReviewCount, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
    { id: 'exception-queue', label: 'Exception Queue', icon: AlertTriangle, badge: exceptionCount },
    { id: 'incoming-files', label: 'Incoming Files', icon: FolderInput },
    { id: 'file-processing', label: 'File Processing', icon: Cpu },
    { id: 'batch-results', label: 'Batch Results', icon: Layers },
    { id: 'failed-transfers', label: 'Failed Transfers', icon: WifiOff, badge: failedTransferCount, badgeColor: 'bg-red-500 text-white' },
    { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
    { id: 'system-health', label: 'System Health', icon: Activity },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'profile', label: 'Officer Profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shadow-inner">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Department Navigation</span>
        <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">LIVE E2E</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-amber-500 text-slate-950'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="text-[11px] text-slate-400 font-semibold mb-1">GOVMESH INTEROP MODE</div>
        <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>True Dynamic Cross-Repo Active</span>
        </div>
      </div>
    </aside>
  );
};
