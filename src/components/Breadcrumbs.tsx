import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; page?: string }[];
  onNavigate?: (page: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-4 py-2 border-b border-slate-200">
      <button
        onClick={() => onNavigate && onNavigate('dashboard')}
        className="flex items-center hover:text-slate-900 transition"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Dashboard</span>
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.page && onNavigate ? (
            <button
              onClick={() => onNavigate(item.page!)}
              className="hover:text-slate-900 transition font-medium"
            >
              {item.label}
            </button>
          ) : (
            <span className="font-semibold text-slate-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
