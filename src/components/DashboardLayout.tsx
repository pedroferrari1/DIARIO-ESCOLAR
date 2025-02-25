import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileBarChart, 
  Settings, 
  Menu, 
  X,
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Professores', path: '/admin/professores' },
    { icon: School, label: 'Escolas', path: '/admin/escolas' },
    { icon: GraduationCap, label: 'Turmas', path: '/admin/turmas' },
    { icon: BookOpen, label: 'Alunos', path: '/admin/alunos' },
    { icon: FileBarChart, label: 'Relatórios', path: '/admin/relatorios' },
    { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <School className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Diário Escolar Digital</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Olá, {user?.full_name}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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
                    setSidebarOpen(false);
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

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-sm mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Diário Escolar Digital. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}