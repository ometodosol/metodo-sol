import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Projeto } from '../types';
import { ClipboardCheck, Search, FileText, CheckCircle2 } from 'lucide-react';
import debounce from 'lodash.debounce';

type ItemState = {
  status: 'sim' | 'nao' | null;
  obs: string;
  nominal?: string;
  medido?: string;
};

type ComissionamentoData = Record<string, ItemState>;

type ChecklistItem = {
  id: string;
  texto: string;
  tipo: 'obs' | 'tensao';
};

type Categoria = {
  id: string;
  titulo: string;
  alerta?: string;
  itens: ChecklistItem[];
};

const CATEGORIAS: Categoria[] = [
  {
    id: '1',
    titulo: '1 INSPEÇÃO VISUAL E ESTRUTURAL',
    itens: [
      { id: '1.1', texto: 'Módulos fixados corretamente na estrutura.', tipo: 'obs' },
      { id: '1.2', texto: 'Ausência de trincas, quebras ou sujeira excessiva nos módulos.', tipo: 'obs' },
      { id: '1.3', texto: 'Parafusos e suportes devidamente apertados.', tipo: 'obs' },
      { id: '1.4', texto: 'A estrutura está corretamente ancorada e nivelada.', tipo: 'obs' },
      { id: '1.5', texto: 'Aterramento dos módulos e da estrutura metálica.', tipo: 'obs' },
      { id: '1.6', texto: 'Distância mínima entre fileiras de módulos respeitada.', tipo: 'obs' },
      { id: '1.7', texto: 'Módulos sem deformações ou empenamentos visíveis.', tipo: 'obs' },
      { id: '1.8', texto: 'Orientação e inclinação conforme projeto.', tipo: 'obs' },
      { id: '1.9', texto: 'Fixação da estrutura sem interferir em telhas ou mantas impermeabilizantes.', tipo: 'obs' },
    ]
  },
  {
    id: '2',
    titulo: '2 VERIFICAÇÃO ELÉTRICA',
    alerta: 'IMPORTANTE: Todos os testes desta seção foram realizados com o sistema completamente DESENERGIZADO (tanto CC quanto CA).',
    itens: [
      { id: '2.1', texto: 'Conectores MC4 devidamente conectados e sem folgas.', tipo: 'obs' },
      { id: '2.2', texto: 'Polaridade correta das strings verificada na chegada da string box.', tipo: 'obs' },
      { id: '2.3', texto: 'Polaridade correta das strings verificada na entrada do inversor.', tipo: 'obs' },
      { id: '2.4', texto: 'Isolamento dos cabos adequado e sem danos.', tipo: 'obs' },
      { id: '2.5', texto: 'Proteções CC (fusíveis, disjuntores, DPS) instaladas.', tipo: 'obs' },
      { id: '2.6', texto: 'Tensão CC String 1.', tipo: 'tensao' },
      { id: '2.7', texto: 'Tensão CC String 2 (se aplicável).', tipo: 'tensao' },
      { id: '2.8', texto: 'Tensão nominal CC máxima por string.', tipo: 'tensao' },
      { id: '2.9', texto: 'Ligar disjuntor CA do quadro de distribuição.', tipo: 'obs' },
      { id: '2.10', texto: 'Tensão CA na entrada do inversor.', tipo: 'tensao' },
      { id: '2.11', texto: 'Desligar disjuntores CA e CC antes de conectar ao inversor.', tipo: 'obs' },
      { id: '2.12', texto: 'Conectar alimentação CA e strings CC ao inversor.', tipo: 'obs' },
      { id: '2.13', texto: 'Religar os disjuntores CA e CC para energização do sistema.', tipo: 'obs' },
      { id: '2.14', texto: 'Inicialização do inversor sem falhas.', tipo: 'obs' },
      { id: '2.15', texto: 'Proteções CA (disjuntor, DPS, DR) instaladas.', tipo: 'obs' },
      { id: '2.16', texto: 'Inversor fixado em local apropriado, ventilado e seco.', tipo: 'obs' },
      { id: '2.17', texto: 'Cabos de aterramento corretamente conectados.', tipo: 'obs' },
      { id: '2.18', texto: 'Aterramento da carcaça do inversor devidamente conectado e identificado.', tipo: 'obs' },
      { id: '2.19', texto: 'Continuidade entre o terminal de proteção do inversor e o barramento de terra do QDG.', tipo: 'obs' },
      { id: '2.20', texto: 'Continuidade entre a carcaça do inversor e o barramento de terra.', tipo: 'obs' },
      { id: '2.21', texto: 'Continuidade entre a alimentação (saída do disjuntor CA) e o plugue de chegada do inversor.', tipo: 'obs' },
    ]
  },
  {
    id: '3',
    titulo: '3 ENERGIZAÇÃO, CONFIGURAÇÃO E TESTES DO INVERSOR',
    itens: [
      { id: '3.1', texto: 'Desconectar alimentação CA e strings CC do inversor.', tipo: 'obs' },
      { id: '3.2', texto: 'Ligar disjuntor e chave seccionadora CC (string box).', tipo: 'obs' },
    ]
  }
];

export function Comissionamento() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [dados, setDados] = useState<ComissionamentoData>({});
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
    if (!projetoSelecionado) {
      setDados({});
      return;
    }

    async function fetchChecklist() {
      const { data } = await supabase
        .from('projetos')
        .select('checklist')
        .eq('id', projetoSelecionado)
        .single();

      if (data && data.checklist) {
        // Migration ou carregamento
        const dbData = data.checklist as any;
        const formattedData: ComissionamentoData = {};
        
        Object.keys(dbData).forEach(key => {
          if (typeof dbData[key] === 'boolean') {
            // Migra do formato antigo
            formattedData[key] = { status: dbData[key] ? 'sim' : null, obs: '' };
          } else {
            formattedData[key] = dbData[key];
          }
        });
        
        setDados(formattedData);
      } else {
        setDados({});
      }
    }

    fetchChecklist();
  }, [projetoSelecionado]);

  // Debounce para não salvar no banco a cada tecla digitada
  const saveToDb = useCallback(
    debounce(async (id: string, newData: ComissionamentoData) => {
      setSalvando(true);
      await supabase
        .from('projetos')
        .update({ checklist: newData })
        .eq('id', id);
      setSalvando(false);
    }, 1000),
    []
  );

  const updateItem = (itemId: string, updates: Partial<ItemState>) => {
    if (!projetoSelecionado) return;

    setDados(prev => {
      const current = prev[itemId] || { status: null, obs: '' };
      const novo = { ...current, ...updates };
      const newState = { ...prev, [itemId]: novo };
      
      saveToDb(projetoSelecionado, newState);
      return newState;
    });
  };

  const calcularProgresso = () => {
    const totalItens = CATEGORIAS.reduce((acc, cat) => acc + cat.itens.length, 0);
    const itensFeitos = Object.values(dados).filter(i => i.status === 'sim' || i.status === 'nao').length;
    return totalItens === 0 ? 0 : Math.round((itensFeitos / totalItens) * 100);
  };

  const projetosFiltrados = projetos.filter(p => 
    p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    (p as any).clientes?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
          <ClipboardCheck className="w-8 h-8 text-brand-green" />
          Comissionamento
        </h1>
        <p className="text-gray-500 mt-2">Preencha o formulário técnico para validar e certificar a instalação.</p>
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
              placeholder="Buscar projeto para comissionar..."
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
            <h3 className="font-bold text-brand-dark text-lg">
              {projetos.find(p => p.id === projetoSelecionado)?.titulo}
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
        <div className="space-y-8 pb-20">
          {/* Barra de Progresso */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-10">
            <div className="flex items-center space-x-4 w-full">
              <div className="p-3 bg-brand-green/10 rounded-lg">
                <FileText className="w-6 h-6 text-brand-green" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Progresso do Comissionamento</span>
                  <span className="text-sm font-bold text-brand-dark">{calcularProgresso()}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div 
                    className="bg-brand-green h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${calcularProgresso()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {salvando && (
              <span className="text-xs font-semibold text-brand-green bg-brand-green/10 px-3 py-1 rounded-full whitespace-nowrap animate-pulse">
                Salvando na nuvem...
              </span>
            )}
          </div>

          {/* Categorias */}
          {CATEGORIAS.map((categoria) => {
            return (
              <section key={categoria.id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-brand-dark">{categoria.titulo}</h2>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {categoria.alerta && (
                    <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex items-start gap-3">
                      <span className="text-xl">⚠️</span>
                      <p className="text-sm text-yellow-800 font-medium leading-relaxed">{categoria.alerta}</p>
                    </div>
                  )}

                  <div className="divide-y divide-gray-100">
                  {categoria.itens.map((item) => {
                    const itemState = dados[item.id] || { status: null, obs: '', nominal: '', medido: '' };
                    const isChecked = itemState.status !== null;

                    return (
                      <div 
                        key={item.id}
                        className={`p-5 flex flex-col lg:flex-row gap-6 transition-colors ${isChecked ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex-1">
                          <p className={`text-slate-800 font-medium text-base mb-4 ${isChecked ? 'text-slate-500' : ''}`}>
                            {item.texto}
                          </p>
                          
                          <div className="flex gap-3 mb-4">
                            <button
                              onClick={() => updateItem(item.id, { status: itemState.status === 'sim' ? null : 'sim' })}
                              className={`flex-1 md:flex-none px-6 py-2 rounded-lg border font-semibold transition-all ${
                                itemState.status === 'sim' 
                                ? 'bg-brand-green text-brand-dark border-brand-green shadow-md' 
                                : 'bg-white text-slate-500 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => updateItem(item.id, { status: itemState.status === 'nao' ? null : 'nao' })}
                              className={`flex-1 md:flex-none px-6 py-2 rounded-lg border font-semibold transition-all ${
                                itemState.status === 'nao' 
                                ? 'bg-red-500 text-white border-red-500 shadow-md' 
                                : 'bg-white text-slate-500 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Não
                            </button>
                          </div>
                        </div>

                        <div className="lg:w-1/2 flex flex-col gap-3">
                          {item.tipo === 'obs' ? (
                            <div className="flex flex-col">
                              <label className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Obs.:</label>
                              <textarea
                                value={itemState.obs}
                                onChange={(e) => updateItem(item.id, { obs: e.target.value })}
                                placeholder="Adicionar observação..."
                                rows={2}
                                className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green/20 text-sm resize-none bg-white"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <label className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Nominal</label>
                                <input
                                  type="text"
                                  value={itemState.nominal || ''}
                                  onChange={(e) => updateItem(item.id, { nominal: e.target.value })}
                                  placeholder="Ex: 220V"
                                  className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green/20 text-sm bg-white"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Medido</label>
                                <input
                                  type="text"
                                  value={itemState.medido || ''}
                                  onChange={(e) => updateItem(item.id, { medido: e.target.value })}
                                  placeholder="Ex: 218V"
                                  className="w-full rounded-lg border-gray-200 focus:border-brand-green focus:ring-brand-green/20 text-sm bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
