import React, { useState } from 'react';
import { ServiceRecord } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Search, Filter, FileSpreadsheet, CheckCircle2, ChevronRight, UserCheck } from 'lucide-react';

interface ServiceRecordsPageProps {
  records: ServiceRecord[];
  onSelectRecord?: (rec: ServiceRecord) => void;
  onNavigate: (page: string) => void;
}

const MAHARASHTRA_DISTRICTS = [
  'All Districts', 'Pune', 'Nashik', 'Nagpur', 'Chhatrapati Sambhajinagar',
  'Kolhapur', 'Satara', 'Solapur', 'Ahilyanagar', 'Nanded', 'Amravati'
];

export const ServiceRecordsPage: React.FC<ServiceRecordsPageProps> = ({ records, onSelectRecord, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All Districts');

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.applicationId.toLowerCase().includes(search.toLowerCase()) ||
      r.citizenName.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = districtFilter === 'All Districts' || r.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Rural Service Records' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Rural Local-Government Service Records
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Authoritative repository of verified Gram Panchayat address and local citizen record updates across Maharashtra.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Application ID, Citizen Name, or Address..."
            className="pl-9 w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-gov-blue"
          >
            {MAHARASHTRA_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">Application ID</th>
                <th className="p-3">Department Ref</th>
                <th className="p-3">Citizen Info</th>
                <th className="p-3">District</th>
                <th className="p-3">Address</th>
                <th className="p-3">Received Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Officer Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans text-xs">
                    <div className="max-w-md mx-auto space-y-2">
                      <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="font-bold text-slate-700">No citizen applications received yet</div>
                      <p className="text-slate-500 text-[11px]">
                        Real applications submitted via GovMesh to <code className="bg-slate-100 px-1 py-0.5 rounded text-gov-blue">/api/rural/address-update</code> will appear here automatically.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const st = (rec.status || 'RECEIVED').toUpperCase();
                  let badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
                  if (st === 'UNDER_REVIEW') badgeClass = 'bg-purple-100 text-purple-800 border-purple-300';
                  else if (st === 'APPROVED' || st === 'COMPLETED') badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  else if (st === 'REJECTED' || st === 'FAILED') badgeClass = 'bg-red-100 text-red-800 border-red-300';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition font-mono">
                      <td className="p-3 font-bold text-gov-blue">
                        <button
                          onClick={() => {
                            if (onSelectRecord) {
                              onSelectRecord(rec);
                              onNavigate('officer-review');
                            }
                          }}
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span>{rec.applicationId}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                      <td className="p-3 font-bold text-slate-600">{rec.departmentApplicationId || rec.id}</td>
                      <td className="p-3 font-sans font-semibold text-slate-900">{rec.citizenName} ({rec.citizenRef})</td>
                      <td className="p-3 font-sans font-bold text-amber-700">{rec.district}</td>
                      <td className="p-3 font-sans text-slate-600 truncate max-w-[200px]">{rec.address}</td>
                      <td className="p-3 text-slate-500">{new Date(rec.receivedDate || rec.receivedAt || Date.now()).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center border ${badgeClass}`}>
                          {st}
                        </span>
                      </td>
                      <td className="p-3 text-right font-sans">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              if (onSelectRecord) {
                                onSelectRecord(rec);
                                onNavigate('officer-review');
                              }
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-1 rounded border border-slate-300"
                          >
                            Review Case
                          </button>
                          {st === 'RECEIVED' && (
                            <button
                              onClick={async () => {
                                await fetch(`/api/rural/application/${rec.applicationId}/review`, { method: 'POST' });
                                window.location.reload();
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                            >
                              Review
                            </button>
                          )}
                          {(st === 'UNDER_REVIEW' || st === 'RECEIVED') && (
                            <button
                              onClick={async () => {
                                await fetch(`/api/rural/application/${rec.applicationId}/approve`, { method: 'POST' });
                                window.location.reload();
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
