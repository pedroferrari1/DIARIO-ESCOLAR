import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Edit, Trash2, Plus, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useTeachers } from '../../hooks/useTeachers';
import { useSchools } from '../../hooks/useSchools';
import Modal from '../../components/shared/Modal';
import ErrorAlert from '../../components/shared/ErrorAlert';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import TeacherRegistrationForm from '../../components/forms/TeacherRegistrationForm';
import type { Teacher } from '../../types/database';

export default function TeachersManagement() {
  const { teachers, loading, error, fetchTeachers, deleteTeacher } = useTeachers();
  const { schools, fetchSchools } = useSchools();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchSchools();
  }, [fetchTeachers, fetchSchools]);

  const handleDelete = async (teacher: Teacher) => {
    if (window.confirm('Tem certeza que deseja excluir este professor?')) {
      try {
        await deleteTeacher(teacher.id);
      } catch (err) {
        console.error('Erro ao excluir professor:', err);
      }
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.school?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Professores</h1>
            <p className="mt-1 text-sm text-gray-500">
              Cadastre e gerencie os professores do sistema
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Professor
          </button>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar professores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && (
          <ErrorAlert
            title="Erro ao carregar professores"
            message={error}
          />
        )}

        {/* Lista de professores */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escola
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum professor encontrado
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.user?.full_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.user?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.school?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(teacher)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de cadastro */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Novo Professor"
        >
          <TeacherRegistrationForm />
        </Modal>
      </div>
    </DashboardLayout>
  );
}