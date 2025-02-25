import React from 'react';
import { School, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';

interface HeaderProps {
  id?: string;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

export default function Header({ id, onMenuClick, isSidebarOpen, isMobile }: HeaderProps) {
  const { user, signOut } = useAuthStore();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id={id} className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Menu principal"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            <div className="flex items-center gap-2 ml-2 lg:ml-0">
              <School className="h-8 w-8 text-blue-600 transition-transform hover:scale-110" />
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Diário Escolar Digital
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
              aria-label="Notificações"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transform -translate-y-1 translate-x-1">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">
                Olá, {user?.full_name?.split(' ')[0]}
              </span>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}