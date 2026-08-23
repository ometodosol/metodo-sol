import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Projeto } from '../types';
import { FileSignature, Search, CheckCircle2, Calendar, FileText, AlertCircle } from 'lucide-react';
import debounce from 'lodash.debounce';

type HomologacaoData = Record<string, any>;

type Campo = {
  id: string;
  label: string;
  tipo: 'checkbox' | 'data' | 'texto' | 'select';
  opcoes?: string[];
  placeholder?: string;
};

type Fase = {
  id: string;
  titulo: string;
  icone: React.ElementType;
  cor: string;
  campos: Campo[];
};

const FASES: Fase[] = [
  {
    id: 'fase1',
    titulo: '1. Solicitação de Acesso',
    icone: FileText,
    cor: 'text-blue-500',
    campos: [
      { id: 'f1_procuracao', label: 'Procuração assinada pelo cliente', tipo: 'checkbox' },
      { id: 'f1_fatura', label: 'Fatura de energia recente', tipo: 'checkbox' },
      { id: 'f1_docs', label: 'Documentos pessoais do titular (RG/CPF ou CNPJ)', tipo: 'checkbox' },
      { id: 'f1_art', label: 'ART paga e assinada', tipo: 'checkbox' },
      { id: 'f1_projeto', label: 'Diagrama Unifilar e Formulários', tipo: 'checkbox' },
      { id: 'f1_protocolo', label: 'Nº do Protocolo na Concessionária', tipo: 'texto', placeholder: 'Ex: 123456789' },
      { id: 'f1_data_envio', label: 'Data do Envio', tipo: 'data' },
      { id: 'f1_status', label: 'Status do Parecer de Acesso', tipo: 'select', opcoes: ['Pendente', 'Em Análise', 'Reprovado (Exigência)', 'Aprovado'] }
    ]
  },
  {
    id: 'fase2',
    titulo: '2. Execução da Obra (Pós-Parecer)',
    icone: AlertCircle,
    cor: 'text-orange-500',
    campos: [
      { id: 'f2_parecer', label: 'Parecer de Acesso emitido e válido', tipo: 'checkbox' },
      { id: 'f2_obra', label: 'Obra instalada conforme projeto aprovado', tipo: 'checkbox' },
      { id: 'f2_comissionamento', label: 'Comissionamento e testes realizados', tipo: 'checkbox' }
    ]
  },
  {
    id: 'fase3',
    titulo: '3. Vistoria e Homologação',
    icone: CheckCircle2,
    cor: 'text-brand-green',
    campos: [
      { id: 'f3_solicitacao', label: 'Solicitação de vistoria enviada à concessionária', tipo: 'checkbox' },
      { id: 'f3_data_agendada', label: 'Data da Vistoria (Agendada/Realizada)', tipo: 'data' },
      { id: 'f3_relatorio', label: 'Relatório de Vistoria Aprovado (Sem pendências)', tipo: 'checkbox' },
      { id: 'f3_troca_medidor', label: 'Troca do medidor realizada pela concessionária', tipo: 'checkbox' },
      { id: 'status_geral', label: 'Status Global da Homologação', tipo: 'select', opcoes: ['Não Iniciada', 'Aguardando Parecer', 'Aguardando Instalação', 'Aguardando Vistoria', 'Aguardando Medidor', 'Homologado'] }
    ]
  }
];

export function Homologacao() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [dados, setDados] = useState<HomologacaoData>({});
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function fetchProjetos() {
      const { data } = await supabase
        .from('projetos')
        .select('id, titulo, cliente_id, clientes(nome)')
        .order('criado_em', { ascending: false });

      if (data) setProjetos(data as any);
    }
    fetchProjetos();
  }, []);

  useEffect(() => {
    async function fetchHomologacao() {
      if (!projetoSelecionado) {
        setDados({});
        return;
      }

      const { data } = await supabase
        .from('projetos')
        .select('homologacao_dados')
        .eq('id', projetoSelecionado)
        .single();

      if (data?.homologacao_dados) {
        const dbData = data.homologacao_dados as Record<string, any>;
        const formattedData: HomologacaoData = {};
        
        Object.keys(dbData).forEach(key => {
          formattedData[key] = dbData[key];
        });
        
        // Ensure default status_geral if not set
        if (!formattedData['status_geral']) {
          formattedData['status_geral'] = 'Não Iniciada';
        }
        
        setDados(formattedData);
      } else {
        setDados({ 'status_geral': 'Não Iniciada' });
      }
    }

    fetchHomologacao();
  }, [projetoSelecionado]);

  // Debounce para não salvar no banco a cada tecla digitada
  const saveToDb = useCallback(
    debounce(async (id: string, newData: HomologacaoData) => {
      setSalvando(true);
      await supabase
        .from('projetos')
        .update({ homologacao_dados: newData })
        .eq('id', id);
      setSalvando(false);
    }, 1000),
    []
  );

  const updateItem = (id: string, value: any) => {
    setDados(prev => {
      const newData = { ...prev, [id]: value };
      
      if (projetoSelecionado) {
        saveToDb(projetoSelecionado, newData);
      }
      
      return newData;
    });
  };

  const projetosFiltrados = projetos.filter(p => 
    p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    (p as any).clientes?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  // Calcula o progresso para uma barra visual simples
  const totalCheckboxes = FASES.flatMap(f => f.campos).filter(c => c.tipo === 'checkbox').length;
  const checkboxesMarcados = FASES.flatMap(f => f.campos).filter(c => c.tipo === 'checkbox' && dados[c.id]).length;
  const progresso = totalCheckboxes === 0 ? 0 : Math.round((checkboxesMarcados / totalCheckboxes) * 100);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-24">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
          <FileSignature className="w-8 h-8 text-brand-green" />
          Módulo de Homologação
        </h1>
        <p className="text-gray-500 mt-2">
          Gerencie documentos, prazos e o andamento do projeto na concessionária de energia.
        </p>
      </header>

      {!projetoSelecionado ? (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark bg-white"
              placeholder="Buscar projeto para homologação..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projetosFiltrados.map((projeto: any) => (
              <div 
                key={projeto.id} 
                onClick={() => setProjetoSelecionado(projeto.id)}
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
                </div>
              </div>
            ))}
            {projetosFiltrados.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500">
                Nenhum projeto encontrado.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Projeto selecionado:</p>
            <h3 className="font-bold text-brand-dark text-lg flex items-center gap-3">
              {projetos.find(p => p.id === projetoSelecionado)?.titulo}
              {salvando && <span className="text-xs text-gray-400 font-normal animate-pulse">Salvando...</span>}
              {!salvando && Object.keys(dados).length > 1 && <span className="text-xs text-brand-green font-normal flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Salvo</span>}
            </h3>
          </div>
          <button 
            onClick={() => setProjetoSelecionado('')}
            className="text-sm font-medium text-brand-green hover:text-brand-dark transition-colors px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Trocar Projeto
          </button>
        </div>
      )}

      {projetoSelecionado && (
        <div className="space-y-6">
          {/* Status Geral e Progresso */}
          <div className="bg-brand-dark p-6 rounded-2xl shadow-sm text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Status Global da Homologação</h3>
                <div className="inline-flex items-center gap-2">
                  <select
                    value={dados['status_geral'] || 'Não Iniciada'}
                    onChange={(e) => updateItem('status_geral', e.target.value)}
                    className="bg-transparent border-b-2 border-brand-green text-xl font-bold text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                  >
                    {FASES[2].campos.find(c => c.id === 'status_geral')?.opcoes?.map(opt => (
                      <option key={opt} value={opt} className="text-gray-900">{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-brand-green">{progresso}%</div>
                <div className="text-sm text-gray-400">Documentos / Tarefas</div>
              </div>
            </div>
            {/* Barra de progresso */}
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-brand-green h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progresso}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {FASES.map((fase) => {
              const IconeFase = fase.icone;
              return (
                <div key={fase.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-5 border-b border-gray-100 flex items-center gap-3">
                    <IconeFase className={`w-6 h-6 ${fase.cor}`} />
                    <h3 className="text-lg font-bold text-brand-dark">{fase.titulo}</h3>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {fase.campos.map((campo) => {
                      if (campo.id === 'status_geral') return null; // Já renderizado no topo
                      
                      const valor = dados[campo.id];
                      
                      return (
                        <div key={campo.id} className="p-4 sm:px-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <label htmlFor={campo.id} className="text-sm font-medium text-gray-700 flex-1 cursor-pointer">
                            {campo.label}
                          </label>
                          
                          <div className="w-full sm:w-64 shrink-0">
                            {campo.tipo === 'checkbox' && (
                              <button
                                id={campo.id}
                                onClick={() => updateItem(campo.id, !valor)}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                                  valor 
                                    ? 'bg-brand-green border-brand-green text-brand-dark' 
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-brand-green hover:text-brand-green'
                                }`}
                              >
                                {valor ? (
                                  <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Concluído
                                  </>
                                ) : (
                                  'Pendente'
                                )}
                              </button>
                            )}

                            {campo.tipo === 'texto' && (
                              <input
                                id={campo.id}
                                type="text"
                                value={valor || ''}
                                onChange={(e) => updateItem(campo.id, e.target.value)}
                                placeholder={campo.placeholder}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark text-sm"
                              />
                            )}

                            {campo.tipo === 'data' && (
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                  id={campo.id}
                                  type="date"
                                  value={valor || ''}
                                  onChange={(e) => updateItem(campo.id, e.target.value)}
                                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark text-sm text-gray-700"
                                />
                              </div>
                            )}

                            {campo.tipo === 'select' && campo.opcoes && (
                              <select
                                id={campo.id}
                                value={valor || campo.opcoes[0]}
                                onChange={(e) => updateItem(campo.id, e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark text-sm font-medium"
                              >
                                {campo.opcoes.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400">Selecione um projeto acima</h3>
          <p className="text-gray-400 mt-2">Para iniciar o acompanhamento da Homologação.</p>
        </div>
      )}
    </div>
  );
}
