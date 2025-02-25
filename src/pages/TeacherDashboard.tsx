import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function TeacherDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel do Professor</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Bem-vindo(a), {user?.full_name}</p>
          {/* Teacher dashboard content will be implemented next */}
        </div>
      </div>
    </div>
  );
}