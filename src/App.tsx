import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { NovoCliente } from './pages/NovoCliente';
import { Login } from './pages/Login';
import { Conta } from './pages/Conta';

// Dummy components for non-implemented pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-10 text-center animate-in fade-in">
    <h1 className="text-2xl font-bold text-gray-400">{title}</h1>
    <p className="text-gray-500 mt-2">Em breve</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              
              {/* Clientes e Projetos */}
              <Route path="clientes" element={<Clientes />} />
              <Route path="clientes/novo" element={<NovoCliente />} />
              <Route path="projetos" element={<Placeholder title="Meus Projetos" />} />
              <Route path="projetos/novo" element={<Placeholder title="Novo Projeto (Levantamento)" />} />
              
              {/* Ferramentas Técnicas */}
              <Route path="conferir-kit" element={<Placeholder title="Conferir Kit" />} />
              <Route path="instalacao" element={<Placeholder title="Checklist de Instalação" />} />
              <Route path="diagnostico" element={<Placeholder title="Diagnóstico de Problemas" />} />
              <Route path="calculadoras" element={<Placeholder title="Calculadoras Técnicas" />} />
              <Route path="equipamentos" element={<Placeholder title="Banco de Equipamentos" />} />
              
              {/* Negócios e Educação */}
              <Route path="comercial" element={<Placeholder title="Área Comercial" />} />
              <Route path="profissionais" element={<Placeholder title="Diretório de Profissionais" />} />
              <Route path="homologacao" element={<Placeholder title="Homologação" />} />
              <Route path="aprender" element={<Placeholder title="Área Educacional" />} />
              
              {/* Configurações e Conta */}
              <Route path="configuracoes" element={<Placeholder title="Configurações" />} />
              <Route path="conta" element={<Conta />} />
              <Route path="plano" element={<Placeholder title="Meu Plano" />} />
              <Route path="suporte" element={<Placeholder title="Suporte" />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
