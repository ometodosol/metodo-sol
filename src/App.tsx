import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { NovoCliente } from './pages/NovoCliente';
import { ClienteDetalhes } from './pages/ClienteDetalhes';
import { Projetos } from './pages/Projetos';
import { NovoProjeto } from './pages/NovoProjeto';
import { ProjetoDetalhes } from './pages/ProjetoDetalhes';
import { Calculadoras } from './pages/Calculadoras';
import { Comissionamento } from './pages/Comissionamento';
import { Login } from './pages/Login';
import { Conta } from './pages/Conta';

// Placeholder para rotas em desenvolvimento
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400">
    <div className="bg-slate-100 p-4 rounded-full mb-4">
      <div className="w-8 h-8 opacity-50 flex items-center justify-center">🚧</div>
    </div>
    <h2 className="text-xl font-medium text-slate-600 mb-2">{title}</h2>
    <p>Este módulo está em desenvolvimento.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              
              <Route path="clientes" element={<Clientes />} />
              <Route path="clientes/novo" element={<NovoCliente />} />
              <Route path="clientes/:id" element={<ClienteDetalhes />} />
              
              <Route path="projetos" element={<Projetos />} />
              <Route path="projetos/novo" element={<NovoProjeto />} />
              <Route path="projetos/:id" element={<ProjetoDetalhes />} />
              
              <Route path="comissionamento" element={<Comissionamento />} />
              <Route path="calculadoras" element={<Calculadoras />} />
              
              {/* Ferramentas Técnicas */}
              <Route path="conferir-kit" element={<Placeholder title="Conferir Kit" />} />
              <Route path="instalacao" element={<Placeholder title="Checklist de Instalação" />} />
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
