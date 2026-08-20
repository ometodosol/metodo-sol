import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Projeto } from '../types';
import { Wrench, Search, FileText, CheckCircle2 } from 'lucide-react';
import debounce from 'lodash.debounce';

type ItemState = {
  status: 'sim' | 'nao' | null;
  obs: string;
};

type InstalacaoData = Record<string, ItemState>;

type ChecklistItem = {
  id: string;
  texto: string;
  tipo: 'obs';
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
    titulo: '1 PREPARAÇÃO E SEGURANÇA',
    itens: [
      { id: '1.1', texto: 'Uso obrigatório de EPIs (capacete, cinto, botina, óculos, luvas).', tipo: 'obs' },
      { id: '1.2', texto: 'Isolamento e sinalização da área abaixo do telhado.', tipo: 'obs' },
      { id: '1.3', texto: 'Linha de vida instalada e ancorada em ponto seguro e independente.', tipo: 'obs' },
      { id: '1.4', texto: 'Içamento de módulos e materiais feito de forma segura.', tipo: 'obs' },
      { id: '1.5', texto: 'Revisão das condições climáticas (sem chuva, vento forte ou raios).', tipo: 'obs' }
    ]
  },
  {
    id: '2',
    titulo: '2 MONTAGEM ESTRUTURAL E TELHADO',
    alerta: 'ATENÇÃO: Garantir a perfeita vedação do telhado para evitar infiltrações futuras.',
    itens: [
      { id: '2.1', texto: 'Verificação prévia do estado das telhas e ripas.', tipo: 'obs' },
      { id: '2.2', texto: 'Marcação correta do espaçamento dos ganchos/parafusos prisioneiros.', tipo: 'obs' },
      { id: '2.3', texto: 'Aplicação adequada de PU/vedação em todas as perfurações.', tipo: 'obs' },
      { id: '2.4', texto: 'Fixação firme da estrutura no caibro/tesoura (madeira/metal).', tipo: 'obs' },
      { id: '2.5', texto: 'Nivelamento correto dos trilhos de fixação.', tipo: 'obs' },
      { id: '2.6', texto: 'Módulos perfeitamente alinhados e esquadrejados.', tipo: 'obs' },
      { id: '2.7', texto: 'Aperto final dos grampos (End/Mid clamps) conferido.', tipo: 'obs' },
      { id: '2.8', texto: 'Limpeza do telhado (remoção de sobras de fio, lixo e ferramentas).', tipo: 'obs' }
    ]
  },
  {
    id: '3',
    titulo: '3 CABEAMENTO E EQUIPAMENTOS',
    itens: [
      { id: '3.1', texto: 'Crimpagem dos conectores MC4 feita com alicate apropriado.', tipo: 'obs' },
      { id: '3.2', texto: 'Cabos solares CC fixados na estrutura (abraçadeiras UV) sem ficar soltos no telhado.', tipo: 'obs' },
      { id: '3.3', texto: 'Cabos e eletrodutos passados sem dobras excessivas ou esmagamento.', tipo: 'obs' },
      { id: '3.4', texto: 'String Box instalada em local acessível, seguro e sem exposição direta à chuva/sol intenso.', tipo: 'obs' },
      { id: '3.5', texto: 'Inversor instalado em parede firme, com espaço para ventilação adequado.', tipo: 'obs' },
      { id: '3.6', texto: 'Aterramento da estrutura do telhado até o inversor e quadro.', tipo: 'obs' },
      { id: '3.7', texto: 'Conexões no disjuntor CA da residência bem apertadas (sem risco de mau contato).', tipo: 'obs' },
      { id: '3.8', texto: 'Etiquetas de advertência (perigo fotovoltaico) coladas no quadro geral.', tipo: 'obs' }
    ]
  }
];

export function Instalacao() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [dados, setDados] = useState<InstalacaoData>({});
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
    async function fetchChecklist() {
      if (!projetoSelecionado) {
        setDados({});
        return;
      }

      const { data } = await supabase
        .from('projetos')
        .select('instalacao_checklist')
        .eq('id', projetoSelecionado)
        .single();

      if (data?.instalacao_checklist) {
        const dbData = data.instalacao_checklist as Record<string, any>;
        const formattedData: InstalacaoData = {};
        
        Object.keys(dbData).forEach(key => {
          formattedData[key] = dbData[key];
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
    debounce(async (id: string, newData: InstalacaoData) => {
      setSalvando(true);
      await supabase
        .from('projetos')
        .update({ instalacao_checklist: newData })
        .eq('id', id);
      setSalvando(false);
    }, 1000),
    []
  );

  const updateItem = (id: string, field: keyof ItemState, value: any) => {
    setDados(prev => {
      const itemData = prev[id] || { status: null, obs: '' };
      const newData = {
        ...prev,
        [id]: { ...itemData, [field]: value }
      };
      
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

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-24">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
          <Wrench className="w-8 h-8 text-brand-green" />
          Checklist de Instalação
        </h1>
        <p className="text-gray-500 mt-2">
          Guia de execução física da obra. Garanta o padrão de segurança e montagem do Método Sol.
        </p>
      </header>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-brand-dark flex items-center justify-between">
          <span>Selecione o Projeto</span>
          {salvando && <span className="text-sm text-gray-400 font-normal animate-pulse">Salvando alterações...</span>}
          {!salvando && Object.keys(dados).length > 0 && <span className="text-sm text-brand-green font-normal flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Salvo</span>}
        </h2>
        
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50"
            placeholder="Buscar projeto..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 mt-4">
          {projetosFiltrados.map((projeto: any) => (
            <div 
              key={projeto.id} 
              onClick={() => setProjetoSelecionado(projeto.id)}
              className={`border-2 rounded-xl p-3 transition-colors cursor-pointer group ${
                projetoSelecionado === projeto.id 
                  ? 'border-brand-green bg-brand-green/5' 
                  : 'border-gray-100 bg-white hover:border-brand-green'
              }`}
            >
              <h3 className={`font-semibold text-sm line-clamp-1 transition-colors ${
                projetoSelecionado === projeto.id ? 'text-brand-dark' : 'text-gray-700 group-hover:text-brand-green'
              }`}>
                {projeto.titulo}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">{projeto.clientes?.nome}</p>
            </div>
          ))}
        </div>
      </div>

      {projetoSelecionado ? (
        <div className="space-y-8">
          {CATEGORIAS.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-dark" />
                <h3 className="font-bold text-brand-dark">{cat.titulo}</h3>
              </div>
              
              {cat.alerta && (
                <div className="bg-red-50 text-red-800 p-3 text-sm font-medium border-b border-red-100 px-6">
                  {cat.alerta}
                </div>
              )}

              <div className="divide-y divide-gray-100">
                {cat.itens.map((item) => {
                  const estado = dados[item.id] || { status: null, obs: '' };
                  return (
                    <div key={item.id} className="p-4 sm:px-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1">
                          <p className="text-brand-dark text-sm sm:text-base font-medium">{item.id} - {item.texto}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateItem(item.id, 'status', 'sim')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border-2 ${
                              estado.status === 'sim' 
                                ? 'bg-brand-green border-brand-green text-brand-dark' 
                                : 'bg-white border-gray-200 text-gray-400 hover:border-brand-green hover:text-brand-green'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => updateItem(item.id, 'status', 'nao')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border-2 ${
                              estado.status === 'nao' 
                                ? 'bg-red-500 border-red-500 text-white' 
                                : 'bg-white border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <input
                          type="text"
                          value={estado.obs}
                          onChange={(e) => updateItem(item.id, 'obs', e.target.value)}
                          placeholder="Observações (opcional)"
                          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400">Selecione um projeto acima</h3>
          <p className="text-gray-400 mt-2">Para iniciar o preenchimento do checklist de instalação.</p>
        </div>
      )}
    </div>
  );
}
