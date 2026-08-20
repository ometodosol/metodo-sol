import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';

// Dummy components for non-implemented pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-10 text-center animate-in fade-in">
    <h1 className="text-2xl font-bold text-gray-400">{title}</h1>
    <p className="text-gray-500 mt-2">Em breve</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Placeholder title="Gestão de Clientes" />} />
          <Route path="projetos" element={<Placeholder title="Meus Projetos" />} />
          <Route path="projetos/novo" element={<Placeholder title="Novo Projeto (Levantamento)" />} />
          <Route path="conferir-kit" element={<Placeholder title="Conferir Kit" />} />
          <Route path="instalacao" element={<Placeholder title="Checklist de Instalação" />} />
          <Route path="diagnostico" element={<Placeholder title="Diagnóstico de Problemas" />} />
          <Route path="calculadoras" element={<Placeholder title="Calculadoras Técnicas" />} />
          <Route path="equipamentos" element={<Placeholder title="Banco de Equipamentos" />} />
          <Route path="profissionais" element={<Placeholder title="Diretório de Profissionais" />} />
          <Route path="homologacao" element={<Placeholder title="Homologação" />} />
          <Route path="aprender" element={<Placeholder title="Área Educacional" />} />
          <Route path="configuracoes" element={<Placeholder title="Configurações" />} />
          <Route path="perfil" element={<Placeholder title="Perfil" />} />
          <Route path="plano" element={<Placeholder title="Meu Plano" />} />
          <Route path="suporte" element={<Placeholder title="Suporte" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
