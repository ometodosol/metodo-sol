import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap } from 'lucide-react';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-brand-dark animate-pulse">
          <img src="https://ometodosol.com.br/wp-content/uploads/2026/08/Icon.png" alt="O Método Sol" className="w-16 h-16 object-contain" />
          <p className="font-medium text-gray-500">Carregando plataforma...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redireciona para o login e salva para onde ele queria ir
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se tem usuário, renderiza as rotas filhas
  return <Outlet />;
}
