import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white shadow-sm mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Diário Escolar Digital. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}