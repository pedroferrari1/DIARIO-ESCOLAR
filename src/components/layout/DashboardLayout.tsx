import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta se é dispositivo móvel
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fecha o sidebar ao clicar fora em dispositivos móveis
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const header = document.getElementById('header');
        if (sidebar && header && 
            !sidebar.contains(event.target as Node) && 
            !header.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        id="header"
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        isSidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          id="sidebar"
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 transition-all duration-200">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}