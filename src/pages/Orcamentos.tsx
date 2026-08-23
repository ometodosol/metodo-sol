import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Search, FileText, DollarSign, Calendar } from 'lucide-react';
import type { Orcamento } from '../types';

interface OrcamentoComCliente extends Orcamento {
  clientes: {
    nome: string;
  };
}

export function Orcamentos() {
  const navigate = useNavigate();
  const [orcamentos, setOrcamentos] = useState<OrcamentoComCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function fetchOrcamentos() {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*, clientes(nome)')
        .order('criado_em', { ascending: false });
      
      if (!error && data) {
        setOrcamentos(data as any);
      }
      setLoading(false);
    }
    
    fetchOrcamentos();
  }, []);

  const orcamentosFiltrados = orcamentos.filter(o => {
    const nomeCliente = o.clientes?.nome || o.dados?.clientName || '';
    return nomeCliente.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="p-6 md:p-10 space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Meus Orçamentos</h1>
          <p className="text-gray-500 mt-1">Gerencie suas propostas e dimensionamentos.</p>
        </div>
        <button 
          onClick={() => navigate('/orcamentos/novo')}
          className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
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
          placeholder="Buscar por cliente..."
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
        </div>
      ) : orcamentos.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-brand-dark">Nenhum orçamento encontrado</h3>
          <p className="text-gray-500 max-w-sm mt-1 mb-6">
            Você ainda não possui orçamentos salvos. Comece criando a sua primeira proposta!
          </p>
          <button 
            onClick={() => navigate('/orcamentos/novo')}
            className="inline-flex items-center justify-center gap-2 bg-brand-green text-brand-dark px-4 py-2.5 rounded-lg hover:bg-brand-green/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Orçamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orcamentosFiltrados.map((orcamento) => (
            <div 
              key={orcamento.id} 
              onClick={() => navigate(`/orcamentos/novo`, { state: { orcamento } })}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-brand-dark text-lg group-hover:text-brand-light transition-colors line-clamp-1">
                  {orcamento.clientes?.nome || orcamento.dados?.clientName || 'Cliente Desconhecido'}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(orcamento.criado_em).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-brand-dark">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    R$ {Number(orcamento.dados?.investimento || 0).toLocaleString('pt-BR')}
                  </div>
                  
                  <span className="text-sm font-semibold text-brand-dark bg-gray-100 px-2 py-1 rounded-md">
                    {orcamento.dados?.potencia ? `${orcamento.dados?.potencia} kWp` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
