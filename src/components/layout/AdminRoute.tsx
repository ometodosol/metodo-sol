import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminRoute() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  // Se não estiver logado, ProtectedRoute já cuida do redirecionamento para /login.
  // Mas aqui nós garantimos duplamente:
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se for leitor (ou null, que cai no fallback leitor), chuta pro dashboard principal
  if (userRole !== 'administrador') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
