import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Edit, Trash2, Plus, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useStudents } from '../../hooks/useStudents';
import Modal from '../../components/shared/Modal';
import ErrorAlert from '../../components/shared/ErrorAlert';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import type { Student } from '../../types/database';

const studentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  class_id: z.string().uuid('Turma inválida'),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentsManagement() {
  const { students, loading, error, fetchStudents, createStudent, updateStudent, deleteStudent } = useStudents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setSelectedStudent(student);
      reset({
        name: student.name,
        class_id: student.class_id,
      });
    } else {
      setSelectedStudent(null);
      reset({
        name: '',
        class_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (selectedStudent) {
        await updateStudent(selectedStudent.id, data);
      } else {
        await createStudent(data);
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.error('Erro ao salvar aluno:', err);
    }
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno ${student.name}?`)) {
      try {
        await deleteStudent(student.id);
      } catch (err) {
        console.error('Erro ao excluir aluno:', err);
      }
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Alunos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Cadastre e gerencie os alunos do sistema
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Aluno
          </button>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar alunos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && (
          <ErrorAlert
            title="Erro ao carregar alunos"
            message={error}
          />
        )}

        {/* Lista de alunos */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turma
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
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum aluno encontrado
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class?.school_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(student)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
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

        {/* Modal de criação/edição */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            reset();
          }}
          title={selectedStudent ? 'Editar Aluno' : 'Novo Aluno'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}