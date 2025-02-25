import React, { useEffect, useState } from 'react';
import { 
  Save,
  AlertCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useConfigStore } from '../../store/configStore';

export default function SystemSettings() {
  const { configs, loading, error, fetchConfigs, updateConfig } = useConfigStore();
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  useEffect(() => {
    const initialData: Record<string, string> = {};
    configs.forEach(config => {
      initialData[config.key] = config.value;
    });
    setFormData(initialData);
  }, [configs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const [key, value] of Object.entries(formData)) {
      const config = configs.find(c => c.key === key);
      if (config && config.value !== value) {
        await updateConfig(key, value, config.description);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie as configurações globais do sistema
            </p>
          </div>
          <SettingsIcon className="h-8 w-8 text-gray-400" />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao carregar configurações
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Carregando configurações...</p>
            </div>
          ) : (
            <>
              {configs.map((config) => (
                <div key={config.key} className="space-y-1">
                  <label
                    htmlFor={config.key}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {config.description}
                  </label>
                  <input
                    type="text"
                    id={config.key}
                    value={formData[config.key] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [config.key]: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Alterações
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}