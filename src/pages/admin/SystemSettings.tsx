import React, { useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorAlert from '../../components/shared/ErrorAlert';

const settingDescriptions: Record<string, string> = {
  'school.max_students': 'Número máximo de alunos por escola',
  'class.max_students': 'Número máximo de alunos por turma',
  'attendance.lock_after_days': 'Dias para bloquear alteração de presença',
  'notification.email_enabled': 'Habilitar notificações por email',
  'system.maintenance_mode': 'Modo de manutenção',
  'system.timezone': 'Fuso horário do sistema',
};

export default function SystemSettings() {
  const { settings, loading, error, fetchSettings, updateSetting } = useSystemSettings();
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const initialData: Record<string, string> = {};
    settings.forEach(setting => {
      initialData[setting.key] = setting.value;
    });
    setFormData(initialData);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      for (const [key, value] of Object.entries(formData)) {
        const setting = settings.find(s => s.key === key);
        if (setting && setting.value !== value) {
          await updateSetting(key, value);
        }
      }
      setSuccessMessage('Configurações atualizadas com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setSaving(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as configurações globais do sistema
          </p>
        </div>

        {error && (
          <ErrorAlert
            title="Erro ao carregar configurações"
            message={error}
          />
        )}

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {settings.map((setting) => (
              <div key={setting.key} className="space-y-1">
                <label
                  htmlFor={setting.key}
                  className="block text-sm font-medium text-gray-700"
                >
                  {settingDescriptions[setting.key] || setting.description}
                </label>
                {setting.key === 'system.maintenance_mode' ? (
                  <select
                    id={setting.key}
                    value={formData[setting.key] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [setting.key]: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="false">Desativado</option>
                    <option value="true">Ativado</option>
                  </select>
                ) : setting.key === 'notification.email_enabled' ? (
                  <select
                    id={setting.key}
                    value={formData[setting.key] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [setting.key]: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="false">Desativado</option>
                    <option value="true">Ativado</option>
                  </select>
                ) : (
                  <input
                    type={setting.key.includes('max') ? 'number' : 'text'}
                    id={setting.key}
                    value={formData[setting.key] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [setting.key]: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Última atualização: {new Date(setting.updated_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}