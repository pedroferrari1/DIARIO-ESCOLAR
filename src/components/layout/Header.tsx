import React from 'react';
import { School, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const { user, signOut } = useAuthStore();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {isSidebarOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <div className="flex items-center gap-2">
            <School className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Diário Escolar Digital</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Olá, {user?.full_name}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}