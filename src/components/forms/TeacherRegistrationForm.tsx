import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { useTeachers } from '../../hooks/useTeachers';
import { useSchools } from '../../hooks/useSchools';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorAlert from '../shared/ErrorAlert';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const teacherSchema = z.object({
  full_name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email deve ter no mínimo 5 caracteres')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(
      passwordRegex,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  school_id: z.string().uuid('Escola inválida'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TeacherRegistrationForm({ onSuccess, onCancel }: TeacherRegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { createTeacher, loading: savingTeacher, error: apiError, clearError } = useTeachers();
  const { schools, loading: loadingSchools } = useSchools();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError: setFormError
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema)
  });

  const password = watch('password', '');
  
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const getPasswordStrength = (password: string): {
    strength: number;
    color: string;
    text: string;
    width: string;
  } => {
    if (!password) return { strength: 0, color: 'bg-gray-200', text: '', width: '0%' };
    
    const requirements = Object.values(passwordRequirements);
    const metRequirements = requirements.filter(Boolean).length;
    const strengthPercentage = (metRequirements / requirements.length) * 100;
    
    const strengthMap = {
      1: { color: 'bg-red-500', text: 'Fraca', width: '25%' },
      2: { color: 'bg-yellow-500', text: 'Média', width: '50%' },
      3: { color: 'bg-blue-500', text: 'Boa', width: '75%' },
      4: { color: 'bg-green-500', text: 'Forte', width: '100%' }
    };
    
    return {
      strength: metRequirements,
      ...strengthMap[metRequirements as keyof typeof strengthMap] || 
      { color: 'bg-gray-200', text: '', width: '0%' }
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: TeacherFormData) => {
    clearError();
    try {
      const result = await createTeacher({
        ...data,
        role: 'teacher',
        active: true
      });

      if (result.success) {
        setShowSuccessMessage(true);
        reset();
        setTimeout(() => {
          setShowSuccessMessage(false);
          onSuccess?.();
        }, 2000);
      } else if (result.error) {
        // Mapeia erros da API para campos específicos do formulário
        if (result.error.field) {
          setFormError(result.error.field as any, {
            type: 'manual',
            message: result.error.message
          });
        }
      }
    } catch (error) {
      console.error('Erro ao criar professor:', error);
    }
  };

  if (loadingSchools) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {showSuccessMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Professor cadastrado com sucesso!
              </p>
            </div>
          </div>
        </div>
      )}

      {apiError && !apiError.field && (
        <ErrorAlert
          title="Erro ao cadastrar professor"
          message={apiError.message}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <input
          type="text"
          {...register('full_name')}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.full_name ? 'border-red-300' : ''
          }`}
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.full_name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          {...register('email')}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.email ? 'border-red-300' : ''
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10 ${
              errors.password ? 'border-red-300' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.password.message}
          </p>
        )}

        {/* Indicador de força da senha */}
        {password && (
          <div className="mt-2 space-y-2">
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: passwordStrength.width }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Força da senha: <span className="font-medium">{passwordStrength.text}</span>
            </p>

            {/* Requisitos da senha */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Requisitos:</p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  {passwordRequirements.minLength ? (
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordRequirements.minLength ? 'text-green-700' : 'text-red-700'}>
                    Mínimo de 8 caracteres
                  </span>
                </li>
                <li className="flex items-center">
                  {passwordRequirements.hasUpperCase ? (
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordRequirements.hasUpperCase ? 'text-green-700' : 'text-red-700'}>
                    Uma letra maiúscula
                  </span>
                </li>
                <li className="flex items-center">
                  {passwordRequirements.hasLowerCase ? (
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordRequirements.hasLowerCase ? 'text-green-700' : 'text-red-700'}>
                    Uma letra minúscula
                  </span>
                </li>
                <li className="flex items-center">
                  {passwordRequirements.hasNumber ? (
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordRequirements.hasNumber ? 'text-green-700' : 'text-red-700'}>
                    Um número
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Escola
        </label>
        <select
          {...register('school_id')}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.school_id ? 'border-red-300' : ''
          }`}
        >
          <option value="">Selecione uma escola</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
        {errors.school_id && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.school_id.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={savingTeacher}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
        >
          {savingTeacher ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Cadastrando...
            </>
          ) : (
            'Cadastrar Professor'
          )}
        </button>
      </div>
    </form>
  );
}