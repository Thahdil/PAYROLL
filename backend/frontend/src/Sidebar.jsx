import React from 'react';
import { LayoutDashboard, FileEdit, History } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, page: 'dashboard' },
  { label: 'Manual Entry', icon: <FileEdit size={20} />, page: 'manual' },
  { label: 'History', icon: <History size={20} />, page: 'history' },
];

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="h-screen w-56 bg-white shadow flex flex-col py-8 px-4">
      <div className="mb-10 text-2xl font-bold text-blue-700 text-center">Payroll Admin</div>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <button
            key={item.page}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-medium transition-all ${currentPage === item.page ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
            onClick={() => onNavigate(item.page)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
} 