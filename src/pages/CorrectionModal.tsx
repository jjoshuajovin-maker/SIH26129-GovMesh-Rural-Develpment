import React, { useState } from 'react';
import { ExceptionItem } from '../types';
import { Edit3, Lock, CheckCircle, X } from 'lucide-react';

interface CorrectionModalProps {
  exception: ExceptionItem;
  onClose: () => void;
  onSaveCorrection: (district: string, address: string) => void;
}

const MAHARASHTRA_DISTRICTS = [
  'Pune', 'Nashik', 'Nagpur', 'Chhatrapati Sambhajinagar',
  'Kolhapur', 'Satara', 'Solapur', 'Ahilyanagar',
  'Nanded', 'Amravati', 'Ratnagiri', 'Sangli', 'Jalgaon',
  'Sindhudurg', 'Latur', 'Osmanabad', 'Parbhani', 'Beed'
];

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  exception,
  onClose,
  onSaveCorrection
}) => {
  const [district, setDistrict] = useState(exception.district || 'Pune');
  const [address, setAddress] = useState(exception.address || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCorrection(district, address);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gov-blue text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Officer Record Correction Workflow
            </h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-amber-400 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Readonly Immutable Metadata */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-500">
              <span>Application ID (Immutable):</span>
              <span className="font-mono font-bold text-slate-900">{exception.applicationId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Consent Reference (Immutable):</span>
              <span className="font-mono font-bold text-slate-900">{exception.consentId || 'CONSENT-00125'}</span>
            </div>
            <div className="flex items-center space-x-1 text-amber-700 font-semibold mt-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Checksum &amp; Metadata fields are cryptographically locked.</span>
            </div>
          </div>

          {/* Permitted Edit Field 1: District */}
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
              District (Permitted Field Edit)
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded font-medium bg-white focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
            >
              <option value="">-- Select Maharashtra District --</option>
              {MAHARASHTRA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Permitted Edit Field 2: Address */}
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
              Local Gram Panchayat Address (Permitted Field Edit)
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
              placeholder="Enter updated local address"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded flex items-center space-x-1 shadow"
            >
              <CheckCircle className="w-4 h-4 text-slate-950" />
              <span>Record Correction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
