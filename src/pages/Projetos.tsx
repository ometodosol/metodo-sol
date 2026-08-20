import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Search, FileText, Zap } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Projeto } from '../types';

interface ProjetoComCliente extends Projeto {
  clientes: {
    nome: string;
  };
}

export function Projetos() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<ProjetoComCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function fetchProjetos() {
      // Faz o join com a tabela clientes para pegar o nome
      const { data, error } = await supabase
        .from('projetos')
        .select('*, clientes(nome)')
        .order('criado_em', { ascending: false });
      
      if (!error && data) {
        setProjetos(data as any);
      }
      setLoading(false);
    }
    
    fetchProjetos();
  }, []);

  const projetosFiltrados = projetos.filter(p => 
    p.titulo.toLowerCase().includes(busca.toLowerCase()) || 
    p.clientes?.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Meus Projetos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus levantamentos, contratos e instalações.</p>
        </div>
        <button 
          onClick={() => navigate('/projetos/novo')}
          className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Projeto
        </button>
      </header>

      {/* Busca */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark bg-white"
          placeholder="Buscar projeto..."
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
        </div>
      ) : projetos.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-brand-dark">Nenhum projeto encontrado</h3>
          <p className="text-gray-500 max-w-sm mt-1 mb-6">
            Você ainda não possui projetos fotovoltaicos cadastrados. Comece criando o seu primeiro levantamento!
          </p>
          <button 
            onClick={() => navigate('/projetos/novo')}
            className="inline-flex items-center justify-center gap-2 bg-brand-green text-brand-dark px-4 py-2.5 rounded-lg hover:bg-brand-green/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetosFiltrados.map((projeto) => (
            <div 
              key={projeto.id} 
              onClick={() => navigate(`/projetos/${projeto.id}`)}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-brand-dark text-lg group-hover:text-brand-light transition-colors line-clamp-2">
                  {projeto.titulo}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <span className="truncate">{projeto.clientes?.nome || 'Desconhecido'}</span>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {projeto.potencia_kwp ? (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-brand-dark">
                      <Zap className="w-4 h-4 text-brand-green" />
                      {projeto.potencia_kwp} kWp
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Potência ñ def.</span>
                  )}
                  
                  <StatusBadge 
                    status={
                      projeto.status === 'levantamento' ? 'warning' :
                      projeto.status === 'contrato' ? 'info' :
                      projeto.status === 'instalacao' ? 'info' : 'success'
                    } 
                    label={
                      projeto.status === 'levantamento' ? 'Levantamento' :
                      projeto.status === 'contrato' ? 'Contrato' :
                      projeto.status === 'instalacao' ? 'Instalação' : 'Finalizado'
                    } 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
