import React, { useState } from 'react';
import { User } from '../types';
import { Bell, LogOut, User as UserIcon, ShieldAlert, FileText, CheckCircle } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'New file received from GovMesh: GM_2026_000124.csv', time: '10:15 AM', type: 'info' },
    { id: 2, text: 'File integrity verified for GM_2026_000124.csv (SHA-256)', time: '10:16 AM', type: 'success' },
    { id: 3, text: '4 records failed validation in GM_BATCH_002.csv', time: '10:20 AM', type: 'warning' },
    { id: 4, text: 'Batch processing completed for GM_BATCH_002.csv (96 processed)', time: '10:22 AM', type: 'success' }
  ];

  return (
    <header className="gov-header-bg text-white shadow-md border-b-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left Side Branding */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <span className="font-bold text-amber-400 text-lg">MH</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">Government of Maharashtra</span>
              <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                GOVMESH – SIH26129 | DEMO
              </span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Rural Development & Panchayat Raj Department
            </h1>
            <p className="text-xs text-blue-200">
              Rural Development Digital Processing Portal – Legacy Service Integration System
            </p>
          </div>
        </div>

        {/* Right Side User Profile & Controls */}
        {user && (
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-blue-200 hover:text-white rounded-full hover:bg-white/10 relative transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center text-xs font-semibold">
                    <span>Department Notifications</span>
                    <span className="bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">4 New</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 text-xs">
                        <div className="font-medium text-slate-900">{n.text}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Role Pill */}
            <div className="flex items-center space-x-3 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold leading-none text-white">{user.name}</div>
                <div className="text-[11px] text-amber-300 font-medium mt-0.5">{user.role}</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
