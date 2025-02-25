import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  GraduationCap, 
  BookOpen, 
  FileBarChart, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Professores', path: '/admin/users' },
    { icon: School, label: 'Escolas', path: '/admin/schools' },
    { icon: GraduationCap, label: 'Turmas', path: '/admin/classes' },
    { icon: BookOpen, label: 'Alunos', path: '/admin/students' },
    { icon: FileBarChart, label: 'Relatórios', path: '/admin/reports' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  return (
    <aside
      className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      `}
    >
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
            >
              <item.icon className="mr-4 h-6 w-6" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}