import React, { useState } from 'react';
import { ServiceRecord } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Search, Filter, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface ServiceRecordsPageProps {
  records: ServiceRecord[];
  onNavigate: (page: string) => void;
}

const MAHARASHTRA_DISTRICTS = [
  'All Districts', 'Pune', 'Nashik', 'Nagpur', 'Chhatrapati Sambhajinagar',
  'Kolhapur', 'Satara', 'Solapur', 'Ahilyanagar', 'Nanded', 'Amravati'
];

export const ServiceRecordsPage: React.FC<ServiceRecordsPageProps> = ({ records, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All Districts');

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.applicationId.toLowerCase().includes(search.toLowerCase()) ||
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
            Searchable repository of verified Gram Panchayat address and local record updates across Maharashtra.
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
                <th className="p-3">Citizen Reference</th>
                <th className="p-3">District</th>
                <th className="p-3">Service Name</th>
                <th className="p-3">Gram Panchayat Address</th>
                <th className="p-3">Received Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition font-mono">
                  <td className="p-3 font-bold text-gov-blue">{rec.applicationId}</td>
                  <td className="p-3 font-sans font-semibold text-slate-900">{rec.citizenName} ({rec.citizenRef})</td>
                  <td className="p-3 font-sans font-bold text-amber-700">{rec.district}</td>
                  <td className="p-3 font-sans text-slate-700">{rec.service}</td>
                  <td className="p-3 font-sans text-slate-600 truncate max-w-[200px]">{rec.address}</td>
                  <td className="p-3 text-slate-500">{new Date(rec.receivedDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center ${
                      (rec.status === 'Completed' || rec.status === 'COMPLETED')
                        ? 'bg-emerald-100 text-emerald-800'
                        : (rec.status === 'PROCESSING' || rec.status === 'In Progress')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <CheckCircle2 className={`w-3 h-3 mr-1 ${
                        (rec.status === 'Completed' || rec.status === 'COMPLETED') ? 'text-emerald-600' : 'text-amber-600'
                      }`} />
                      {rec.status || 'Received'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
