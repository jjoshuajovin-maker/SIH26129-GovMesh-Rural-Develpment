import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, KeyRound, UserCheck, Lock, Clock } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('officer_pune');
  const [password, setPassword] = useState('demo1234');
  const [role, setRole] = useState('Rural Development Officer');
  const [otp, setOtp] = useState('123456');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!showOtp) {
      // Step 1: Trigger OTP
      setShowOtp(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, otp })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('officer_pune');
    setPassword('demo1234');
    setRole('Rural Development Officer');
    setOtp('123456');
    setShowOtp(true);

    const demoUser: User = {
      id: 'usr-1',
      username: 'officer_pune',
      name: 'Demo Officer (Rajesh Patil)',
      role: 'Rural Development Officer',
      department: 'Rural Development & Panchayat Raj',
      district: 'Pune'
    };
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Govt Emblem & Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-gov-blue text-amber-400 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-amber-400 mb-3">
          MH
        </div>
        <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Government of Maharashtra
        </div>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">
          Rural Development & Panchayat Raj Department
        </h2>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          Officer Login – Digital Processing Portal
        </p>
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          GOVMESH – SIH26129 | DEMO
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username / Officer ID
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                  placeholder="e.g. officer_pune"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Designated Officer Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium bg-white focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
              >
                <option value="Rural Development Officer">Rural Development Officer</option>
                <option value="Panchayat Officer">Panchayat Officer</option>
                <option value="Senior Officer">Senior Officer</option>
                <option value="Department Admin">Department Admin</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>

            {showOtp && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Simulated 2FA OTP Code
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded">
                    Demo OTP: 123456
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-9 w-full px-3 py-2 border border-amber-300 rounded-md text-xs font-mono font-bold text-center tracking-widest text-slate-900 focus:ring-2 focus:ring-amber-500"
                    placeholder="123456"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gov-blue hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded-md text-xs tracking-wider uppercase transition shadow"
              >
                {loading ? 'Authenticating...' : showOtp ? 'Verify OTP & Login' : 'Login'}
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full bg-slate-800 hover:bg-slate-900 text-amber-400 font-bold py-2 px-4 rounded-md text-xs tracking-wider uppercase transition border border-slate-700"
              >
                Use Demo Quick Login
              </button>
            </div>
          </form>

          {/* Session timeout indicator */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <div className="inline-flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Session automatically expires after 15 minutes of inactivity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
