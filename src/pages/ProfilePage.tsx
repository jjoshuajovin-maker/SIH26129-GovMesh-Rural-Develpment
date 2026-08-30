import React from 'react';
import { User } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { User as UserIcon, ShieldCheck, Key, Clock, Award } from 'lucide-react';

interface ProfilePageProps {
  user: User | null;
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Officer Profile' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Officer Profile &amp; Authentication Credentials
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Role-based authorization details and active session telemetry.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-2xl space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
          <div className="w-16 h-16 rounded-full bg-gov-blue text-amber-400 font-bold text-2xl flex items-center justify-center border-2 border-amber-400">
            {user?.name.charAt(0) || 'D'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name || 'Demo Officer (Rajesh Patil)'}</h3>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              {user?.role || 'Rural Development Officer'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {user?.department || 'Rural Development & Panchayat Raj Department, Maharashtra'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-xs">
          <div><span className="font-semibold text-slate-500">Username:</span></div>
          <div className="font-mono font-bold text-slate-900">{user?.username || 'officer_pune'}</div>

          <div><span className="font-semibold text-slate-500">Assigned Jurisdiction:</span></div>
          <div className="font-bold text-amber-700">{user?.district || 'Pune District'}</div>

          <div><span className="font-semibold text-slate-500">State Jurisdiction:</span></div>
          <div>Government of Maharashtra</div>

          <div><span className="font-semibold text-slate-500">Active Session Status:</span></div>
          <div>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded inline-flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1" /> ACTIVE &amp; AUTHENTICATED
            </span>
          </div>

          <div><span className="font-semibold text-slate-500">Session Inactivity Timeout:</span></div>
          <div className="flex items-center text-slate-700">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            <span>15 minutes inactivity warning active</span>
          </div>

          <div><span className="font-semibold text-slate-500">Last Authentication:</span></div>
          <div>Today, 10:15 AM (OTP Verified)</div>
        </div>
      </div>
    </div>
  );
};
