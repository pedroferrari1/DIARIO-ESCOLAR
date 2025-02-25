import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  GraduationCap, 
  BookOpen, 
  FileBarChart, 
  Settings,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function Sidebar({ id, isOpen, onClose, isMobile }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Professores', path: '/admin/users' },
    { icon: School, label: 'Escolas', path: '/admin/schools' },
    { icon: GraduationCap, label: 'Turmas', path: '/admin/classes' },
    { icon: BookOpen, label: 'Alunos', path: '/admin/students' },
    { icon: Calendar, label: 'Frequência', path: '/admin/attendance' },
    { icon: FileBarChart, label: 'Relatórios', path: '/admin/reports' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  const sidebarClasses = `
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
    lg:translate-x-0 lg:static
    w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
    flex flex-col h-full
  `;

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      <aside id={id} className={sidebarClasses}>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onClose();
                }}
                className={`
                  w-full group flex items-center px-2 py-2 text-base font-medium rounded-md
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon className={`
                  mr-4 h-6 w-6 transition-colors duration-200
                  ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}