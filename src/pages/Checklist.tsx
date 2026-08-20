import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Projeto } from '../types';
import { ClipboardCheck, CheckCircle2, Circle } from 'lucide-react';

const CATEGORIAS = [
  {
    id: 'seguranca',
    titulo: '🦺 Segurança e EPIs',
    itens: [
      { id: 'epi_capacete', texto: 'Capacete de segurança com jugular' },
      { id: 'epi_cinto', texto: 'Cinto de segurança tipo paraquedista' },
      { id: 'epi_linha_vida', texto: 'Linha de vida instalada e ancorada' },
      { id: 'epi_isolamento', texto: 'Área de trabalho isolada' },
    ]
  },
  {
    id: 'estrutura',
    titulo: '🏗️ Estrutura e Fixação',
    itens: [
      { id: 'est_telhado', texto: 'Inspeção prévia da integridade do telhado' },
      { id: 'est_fixadores', texto: 'Fixadores/Ganchos presos diretamente no caibro/terça' },
      { id: 'est_vedacao', texto: 'Vedação aplicada em todos os furos' },
      { id: 'est_aterramento', texto: 'Aterramento conectado à estrutura metálica' },
    ]
  },
  {
    id: 'cabeamento',
    titulo: '⚡ Cabeamento DC',
    itens: [
      { id: 'cab_mc4', texto: 'Conectores MC4 clipados e apertados com ferramenta correta' },
      { id: 'cab_isolamento', texto: 'Cabos amarrados e sem contato com o telhado/água' },
      { id: 'cab_polaridade', texto: 'Teste de polaridade e tensão da string (VDC) realizado' },
    ]
  },
  {
    id: 'equipamentos',
    titulo: '🔌 Equipamentos AC',
    itens: [
      { id: 'eq_inversor', texto: 'Inversor fixado e nivelado em local ventilado' },
      { id: 'eq_stringbox', texto: 'Quadro CA/String Box conectado corretamente' },
      { id: 'eq_dps', texto: 'DPS e Disjuntores dimensionados e aterrados' },
    ]
  },
  {
    id: 'comissionamento',
    titulo: '📡 Comissionamento',
    itens: [
      { id: 'com_tensao', texto: 'Medição da tensão da rede local (VAC) realizada' },
      { id: 'com_wifi', texto: 'Inversor conectado ao Wi-Fi do cliente' },
      { id: 'com_geracao', texto: 'Inversor sincronizou e começou a gerar energia' },
      { id: 'com_limpeza', texto: 'Local da obra limpo e materiais recolhidos' },
    ]
  }
];

export function Checklist() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [checklistData, setChecklistData] = useState<Record<string, boolean>>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function fetchProjetos() {
      const { data } = await supabase
        .from('projetos')
        .select('id, titulo, cliente_id, clientes(nome)')
        .order('criado_em', { ascending: false });

      if (data) {
        setProjetos(data as any);
      }
    }
    fetchProjetos();
  }, []);

  useEffect(() => {
    if (!projetoSelecionado) {
      setChecklistData({});
      return;
    }

    async function fetchChecklist() {
      const { data } = await supabase
        .from('projetos')
        .select('checklist')
        .eq('id', projetoSelecionado)
        .single();

      if (data && data.checklist) {
        setChecklistData(data.checklist as Record<string, boolean>);
      } else {
        setChecklistData({});
      }
    }

    fetchChecklist();
  }, [projetoSelecionado]);

  const toggleItem = async (itemId: string) => {
    if (!projetoSelecionado) return;

    setSalvando(true);
    const novoEstado = !checklistData[itemId];
    const novoChecklist = { ...checklistData, [itemId]: novoEstado };
    
    // Atualiza otimisticamente a UI
    setChecklistData(novoChecklist);

    // Salva no banco
    await supabase
      .from('projetos')
      .update({ checklist: novoChecklist })
      .eq('id', projetoSelecionado);
      
    setSalvando(false);
  };

  const calcularProgresso = () => {
    const totalItens = CATEGORIAS.reduce((acc, cat) => acc + cat.itens.length, 0);
    const itensFeitos = Object.values(checklistData).filter(Boolean).length;
    return totalItens === 0 ? 0 : Math.round((itensFeitos / totalItens) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Checklist de Instalação</h1>
        <p className="text-slate-500 mt-1">Siga o passo a passo da obra para garantir segurança e qualidade.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selecione o Projeto / Obra atual
        </label>
        <select
          value={projetoSelecionado}
          onChange={(e) => setProjetoSelecionado(e.target.value)}
          className="w-full rounded-lg border-slate-200 focus:border-brand-500 focus:ring-brand-500 bg-slate-50 py-3"
        >
          <option value="">-- Selecione uma obra --</option>
          {projetos.map((proj: any) => (
            <option key={proj.id} value={proj.id}>
              {proj.titulo} - Cliente: {proj.clientes?.nome || 'Sem cliente'}
            </option>
          ))}
        </select>
      </div>

      {projetoSelecionado && (
        <div className="space-y-6 animate-fade-in">
          {/* Barra de Progresso */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4 w-full">
              <div className="p-3 bg-brand-50 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-brand-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Progresso da Instalação</span>
                  <span className="text-sm font-bold text-brand-600">{calcularProgresso()}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div 
                    className="bg-brand-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${calcularProgresso()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {salvando && (
              <span className="text-xs text-slate-400 ml-4 whitespace-nowrap">Salvando...</span>
            )}
          </div>

          {/* Categorias */}
          {CATEGORIAS.map((categoria) => {
            const itensDaCategoria = categoria.itens.length;
            const itensFeitos = categoria.itens.filter(i => checklistData[i.id]).length;
            const concluida = itensFeitos === itensDaCategoria;

            return (
              <div key={categoria.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`p-4 border-b ${concluida ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">{categoria.titulo}</h3>
                    <span className={`text-sm font-medium ${concluida ? 'text-green-600' : 'text-slate-500'}`}>
                      {itensFeitos}/{itensDaCategoria}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {categoria.itens.map((item) => {
                    const checked = !!checklistData[item.id];
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-4 flex items-start space-x-3 cursor-pointer hover:bg-slate-50 transition-colors ${checked ? 'opacity-75' : ''}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {checked ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <span className={`text-slate-700 ${checked ? 'line-through text-slate-400' : ''}`}>
                          {item.texto}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
