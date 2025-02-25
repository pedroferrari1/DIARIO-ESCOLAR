import React from 'react';
import { 
  Users, 
  School, 
  GraduationCap, 
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

// Dados simulados para demonstração
const stats = [
  { label: 'Total de Escolas', value: '42', icon: School, color: 'bg-blue-500' },
  { label: 'Total de Professores', value: '156', icon: Users, color: 'bg-green-500' },
  { label: 'Total de Alunos', value: '2.847', icon: GraduationCap, color: 'bg-purple-500' },
  { label: 'Taxa de Presença', value: '94%', icon: TrendingUp, color: 'bg-yellow-500' },
];

const recentActivities = [
  { id: 1, user: 'Maria Silva', action: 'adicionou uma nova turma', time: '5 minutos atrás' },
  { id: 2, user: 'João Santos', action: 'registrou presença', time: '10 minutos atrás' },
  { id: 3, user: 'Ana Oliveira', action: 'criou uma observação', time: '15 minutos atrás' },
  { id: 4, user: 'Pedro Costa', action: 'atualizou dados da escola', time: '30 minutos atrás' },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Título da página */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visão geral do sistema e atividades recentes
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.label}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Gráfico de Atividade */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Atividade do Sistema
                </h2>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-4 h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500">Gráfico de atividades será implementado aqui</p>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Atividades Recentes
                </h2>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-4 flow-root">
                <ul className="-mb-8">
                  {recentActivities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivities.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <Users className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">
                                  {activity.user}
                                </span>{' '}
                                {activity.action}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {activity.time}
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
      </div>
    </DashboardLayout>
  );
}