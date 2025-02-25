import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Users, 
  Calendar, 
  Clock,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useClasses } from '../../hooks/useClasses';
import { useTeachers } from '../../hooks/useTeachers';
import Modal from '../../components/shared/Modal';
import ErrorAlert from '../../components/shared/ErrorAlert';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import type { Class } from '../../types/database';

const classSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  school_id: z.string().uuid('Escola inválida'),
  year: z.string()
    .min(4, 'Ano letivo inválido')
    .max(4, 'Ano letivo inválido'),
  room: z.string()
    .min(1, 'Sala é obrigatória')
    .max(50, 'Sala deve ter no máximo 50 caracteres'),
  schedule: z.string()
    .min(1, 'Horário é obrigatório')
    .max(100, 'Horário deve ter no máximo 100 caracteres'),
  teacher_id: z.string().uuid('Professor responsável inválido'),
  max_students: z.number()
    .min(1, 'Número mínimo de alunos é 1')
    .max(100, 'Número máximo de alunos é 100'),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function ClassManagement() {
  const { classes, loading, error, fetchClasses, createClass, updateClass, deleteClass } = useClasses();
  const { teachers, fetchTeachers } = useTeachers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, [fetchClasses, fetchTeachers]);

  const handleOpenModal = (classData?: Class) => {
    if (classData) {
      setSelectedClass(classData);
      reset({
        name: classData.name,
        school_id: classData.school_id,
        year: classData.year,
        room: classData.room,
        schedule: classData.schedule,
        teacher_id: classData.teacher_id,
        max_students: classData.max_students,
      });
    } else {
      setSelectedClass(null);
      reset({
        name: '',
        school_id: '',
        year: new Date().getFullYear().toString(),
        room: '',
        schedule: '',
        teacher_id: '',
        max_students: 40,
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ClassFormData) => {
    try {
      if (selectedClass) {
        await updateClass(selectedClass.id, data);
      } else {
        await createClass(data);
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.error('Erro ao salvar turma:', err);
    }
  };

  const handleDelete = async (classData: Class) => {
    if (window.confirm(`Tem certeza que deseja excluir a turma ${classData.name}?`)) {
      try {
        await deleteClass(classData.id);
      } catch (err) {
        console.error('Erro ao excluir turma:', err);
      }
    }
  };

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher?.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Turmas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Cadastre e gerencie as turmas do sistema
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Turma
          </button>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar turmas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && (
          <ErrorAlert
            title="Erro ao carregar turmas"
            message={error}
          />
        )}

        {/* Lista de turmas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nenhuma turma encontrada
            </div>
          ) : (
            filteredClasses.map((classData) => (
              <div
                key={classData.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <GraduationCap className="h-8 w-8 text-blue-500" />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {classData.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ano Letivo: {classData.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(classData)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(classData)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      {classData.current_students || 0}/{classData.max_students} alunos
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Sala {classData.room}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{classData.schedule}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {classData.teacher?.user?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">Professor Responsável</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  {classData.active ? (
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Ativa</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-700">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Inativa</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de criação/edição */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            reset();
          }}
          title={selectedClass ? 'Editar Turma' : 'Nova Turma'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome da Turma
              </label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ano Letivo
              </label>
              <input
                type="text"
                {...register('year')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sala
              </label>
              <input
                type="text"
                {...register('room')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.room && (
                <p className="mt-1 text-sm text-red-600">{errors.room.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Horário
              </label>
              <input
                type="text"
                {...register('schedule')}
                placeholder="Ex: Segunda a Sexta, 07:00 - 12:00"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.schedule && (
                <p className="mt-1 text-sm text-red-600">{errors.schedule.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Professor Responsável
              </label>
              <select
                {...register('teacher_id')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um professor</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user?.full_name}
                  </option>
                ))}
              </select>
              {errors.teacher_id && (
                <p className="mt-1 text-sm text-red-600">{errors.teacher_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número Máximo de Alunos
              </label>
              <input
                type="number"
                {...register('max_students', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.max_students && (
                <p className="mt-1 text-sm text-red-600">{errors.max_students.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Salvando...
                  </>
                ) : selectedClass ? (
                  'Salvar'
                ) : (
                  'Criar'
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}