import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  School,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  FileBarChart,
  Plus
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';

const menuItems = [
  {
    title: 'Professores',
    icon: Users,
    path: '/admin/users',
    color: 'bg-blue-500',
    description: 'Gerenciar professores e suas atribuições'
  },
  {
    title: 'Escolas',
    icon: School,
    path: '/admin/schools',
    color: 'bg-green-500',
    description: 'Administrar escolas cadastradas'
  },
  {
    title: 'Turmas',
    icon: GraduationCap,
    path: '/admin/classes',
    color: 'bg-purple-500',
    description: 'Gerenciar turmas e horários'
  },
  {
    title: 'Alunos',
    icon: BookOpen,
    path: '/admin/students',
    color: 'bg-yellow-500',
    description: 'Administrar cadastro de alunos'
  },
  {
    title: 'Frequência',
    icon: Calendar,
    path: '/admin/attendance',
    color: 'bg-indigo-500',
    description: 'Acompanhar frequência escolar'
  },
  {
    title: 'Relatórios',
    icon: FileBarChart,
    path: '/admin/reports',
    color: 'bg-red-500',
    description: 'Visualizar relatórios e estatísticas'
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/admin/settings',
    color: 'bg-gray-500',
    description: 'Configurar parâmetros do sistema'
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, activities, loading, error, fetchDashboardData } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorAlert
          title="Erro ao carregar dashboard"
          message={error}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os aspectos do sistema educacional
          </p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <School className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Escolas
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.total_schools || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Professores
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.total_teachers || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Alunos
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.total_students || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Taxa de Presença
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.system_attendance_rate.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu de Acesso Rápido */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-white overflow-hidden shadow rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
          </div>
          <div className="p-5">
            <div className="flow-root">
              <ul className="-mb-8">
                {activities.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== activities.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.activity_type === 'create' ? 'bg-green-500' :
                            activity.activity_type === 'update' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}>
                            {activity.activity_type === 'create' ? (
                              <Plus className="h-5 w-5 text-white" />
                            ) : activity.activity_type === 'update' ? (
                              <Settings className="h-5 w-5 text-white" />
                            ) : (
                              <Users className="h-5 w-5 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">
                                {activity.user_name}
                              </span>{' '}
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}