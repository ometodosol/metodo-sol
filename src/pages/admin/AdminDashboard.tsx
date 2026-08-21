import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Image as ImageIcon, 
  Bell, 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Save, 
  Trash2 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

type Tab = 'banners' | 'notificacoes' | 'aulas' | 'profissionais';

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('banners');
  
  // Apenas admins podem ver esta página
  const isAdmin = user?.email === 'w.souzalmeida@gmail.com' || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            Painel Administrativo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Gestão de conteúdo, banners, aulas e notificações do sistema.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-white/10 pb-px hide-scrollbar">
        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'banners'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Banners
        </button>
        <button
          onClick={() => setActiveTab('notificacoes')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'notificacoes'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
          }`}
        >
          <Bell className="w-4 h-4" /> Notificações
        </button>
        <button
          onClick={() => setActiveTab('aulas')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'aulas'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Aulas
        </button>
        <button
          onClick={() => setActiveTab('profissionais')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'profissionais'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Profissionais
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestão de Banners</h2>
              <button className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Novo Banner
              </button>
            </div>
            <p className="text-sm text-gray-500">Configure as imagens do carrossel de Login e do topo do Dashboard.</p>
            
            <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Local</th>
                    <th className="px-4 py-3 font-medium">Imagem (URL)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                    <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">Login (Esquerda)</td>
                    <td className="px-4 py-4 text-gray-500 truncate max-w-[200px]">https://images.unsplash...</td>
                    <td className="px-4 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Ativo</span></td>
                    <td className="px-4 py-4 flex gap-2">
                      <button className="text-gray-400 hover:text-brand-dark transition-colors"><Save className="w-4 h-4" /></button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                    <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">Dashboard (Topo)</td>
                    <td className="px-4 py-4 text-gray-500 truncate max-w-[200px]">https://images.unsplash...</td>
                    <td className="px-4 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Ativo</span></td>
                    <td className="px-4 py-4 flex gap-2">
                      <button className="text-gray-400 hover:text-brand-dark transition-colors"><Save className="w-4 h-4" /></button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
              <p className="text-sm text-amber-800 dark:text-amber-400">
                <strong>Próximos passos:</strong> Esta tela é a versão MVP visual. Assim que criarmos as tabelas no Supabase (ex: <code>banners</code>), ela passará a gravar e alterar as imagens do login em tempo real.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'notificacoes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Envio de Notificações</h2>
              <button className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                <Bell className="w-4 h-4" /> Disparar Alerta
              </button>
            </div>
            
            <div className="grid gap-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título do Alerta</label>
                <input type="text" className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green" placeholder="Ex: Nova atualização disponível" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem</label>
                <textarea rows={3} className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green" placeholder="Ex: Confira agora a nova ferramenta de dimensionamento..."></textarea>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aulas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestão de Aulas</h2>
              <button className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar Aula
              </button>
            </div>
            
            <div className="border border-gray-100 dark:border-white/10 rounded-xl p-8 text-center flex flex-col items-center">
              <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Nenhuma aula cadastrada</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Aqui você poderá cadastrar os links (YouTube/Vimeo) para popular a aba "Aulas" para seus alunos.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'profissionais' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rede de Conexões</h2>
            </div>
            
            <div className="border border-gray-100 dark:border-white/10 rounded-xl p-8 text-center flex flex-col items-center bg-gray-50 dark:bg-white/5">
              <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Painel de Moderação em Breve</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Aqui você poderá aprovar, remover contas inativas ou editar os dados da tabela de profissionais.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
