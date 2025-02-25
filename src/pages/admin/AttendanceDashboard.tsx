import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  Calendar,
  Users,
  AlertTriangle,
  Filter,
  Download,
  ChevronDown
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorAlert from '../../components/shared/ErrorAlert';
import { useClasses } from '../../hooks/useClasses';
import { useAttendance } from '../../hooks/useAttendance';

export default function AttendanceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const { classes } = useClasses();
  const { stats, loading, error, fetchAttendanceStats } = useAttendance();

  useEffect(() => {
    fetchAttendanceStats(
      parseInt(selectedPeriod),
      selectedClass === 'all' ? undefined : selectedClass
    );
  }, [selectedPeriod, selectedClass, fetchAttendanceStats]);

  const handleExport = async () => {
    try {
      // Implementar exportação dos dados
      const data = {
        period: selectedPeriod,
        class: selectedClass,
        stats
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar dados:', err);
    }
  };

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

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center text-gray-500">
          Nenhum dado disponível
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Frequência</h1>
            <p className="mt-1 text-sm text-gray-500">
              Acompanhamento de presença e indicadores
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="15">Últimos 15 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as turmas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Presença Média</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.summary.presencaMedia}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total de Aulas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.summary.totalAulas}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Alunos em Risco</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.summary.alunosRisco}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Filter className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Faltas Justificadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.summary.faltasJustificadas}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Gráfico de linha - Frequência diária */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Frequência Diária</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="presenca"
                    stroke="#0088FE"
                    name="Presença (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="ausencia"
                    stroke="#FF8042"
                    name="Ausência (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de barras - Frequência por turma */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Frequência por Turma</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turma" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="presenca" fill="#0088FE" name="Presença (%)" />
                  <Bar dataKey="ausencia" fill="#FF8042" name="Ausência (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alunos em situação crítica */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Alunos em Situação Crítica</h3>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequência
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.criticalStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.aluno}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.turma}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.frequencia}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Crítico
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}