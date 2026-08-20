import React, { useState, useEffect } from 'react';
import { Calculator, Zap, Maximize, ArrowRight, ShoppingCart, Info, RotateCcw, Copy, ChevronDown, Search, Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Projeto } from '../types';

type MetodoCalculo = 'potencia' | 'area' | null;

// Banco de dados de placas padrão do mercado
const MODELOS_PLACAS = [
  { id: 'ja450', nome: 'JA Solar DeepBlue 4.0 Pro', potenciaW: 450, areaM2: 2.00 },
  { id: 'jinko550', nome: 'Jinko JKM550M-72HL4', potenciaW: 550, areaM2: 2.58 },
  { id: 'longi570', nome: 'LONGi Hi-MO 7 LR5-72HGD', potenciaW: 570, areaM2: 2.58 },
  { id: 'longi575', nome: 'LONGi Hi-MO 7 LR5-72HGD', potenciaW: 575, areaM2: 2.58 },
  { id: 'trina580', nome: 'Trina Vertex NEG19RC.20', potenciaW: 580, areaM2: 2.70 },
  { id: 'trina585', nome: 'Trina Vertex NEG19RC.20', potenciaW: 585, areaM2: 2.70 },
  { id: 'astronergy590', nome: 'Astronergy ASTRO 5 Twins', potenciaW: 590, areaM2: 2.80 },
  { id: 'eging620', nome: 'EGing NT66-HRc', potenciaW: 620, areaM2: 2.70 },
  { id: 'trina650', nome: 'Trina Vertex N atual', potenciaW: 650, areaM2: 2.70 },
  { id: 'canadian700', nome: 'Canadian Solar TOPBiHiKu7', potenciaW: 700, areaM2: 3.11 },
];

export function Dimensionamento() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [buscaProjeto, setBuscaProjeto] = useState('');
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [salvando, setSalvando] = useState(false);
  const [salvoSucesso, setSalvoSucesso] = useState(false);

  const [metodo, setMetodo] = useState<MetodoCalculo>(null);
  
  // Entradas Básicas
  const [tipoSistema, setTipoSistema] = useState<'ongrid' | 'offgrid' | 'hibrido'>('ongrid');
  const [potenciaKwp, setPotenciaKwp] = useState<string>('');
  const [areaM2, setAreaM2] = useState<string>('');
  const [placaSelecionadaId, setPlacaSelecionadaId] = useState<string>('jinko550');
  
  // Entradas Avançadas (Distâncias e Tensão)
  const [tensaoRede, setTensaoRede] = useState<string>('220bi'); // 220bi, 220mono, 380tri
  const [distanciaCC, setDistanciaCC] = useState<string>(''); // Modulos -> Inversor
  const [distanciaCA, setDistanciaCA] = useState<string>(''); // Inversor -> Padrao
  
  // Estado do resultado
  const [resultado, setResultado] = useState<any>(null);

  const disjuntoresComerciais = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 150];

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

  const calcularKit = () => {
    const placa = MODELOS_PLACAS.find(p => p.id === placaSelecionadaId) || MODELOS_PLACAS[1];
    const potPlacaW = placa.potenciaW;
    const potPlacaKwp = potPlacaW / 1000;
    const areaPlaca = placa.areaM2;

    const distCC = parseFloat(distanciaCC.replace(',', '.')) || 0;
    const distCA = parseFloat(distanciaCA.replace(',', '.')) || 0;

    if (!distCC || !distCA) {
      return alert('Por favor, preencha as distâncias CC e CA para gerar a lista de cabos.');
    }

    let numPlacas = 0;
    let potTotalKwp = 0;
    let areaTotal = 0;

    if (metodo === 'potencia') {
      const potAlvo = parseFloat(potenciaKwp.replace(',', '.'));
      if (!potAlvo || potAlvo <= 0) return alert('Insira uma potência válida.');
      
      numPlacas = Math.ceil(potAlvo / potPlacaKwp);
      potTotalKwp = numPlacas * potPlacaKwp;
      areaTotal = numPlacas * areaPlaca;
    } else if (metodo === 'area') {
      const areaAlvo = parseFloat(areaM2.replace(',', '.'));
      if (!areaAlvo || areaAlvo <= 0) return alert('Insira uma área válida.');
      
      numPlacas = Math.floor(areaAlvo / areaPlaca);
      if (numPlacas === 0) return alert(`A área é muito pequena para instalar ao menos uma placa de ${areaPlaca}m².`);
      
      potTotalKwp = numPlacas * potPlacaKwp;
      areaTotal = numPlacas * areaPlaca;
    }

    // Regras de negócio da Lista de Materiais
    const inversorW = potTotalKwp * 1000 / 1.25;
    const inversorSugeridoKwp = (inversorW / 1000).toFixed(1); // 25% oversizing

    // Cálculo Disjuntor CA
    let correnteInversor = 0;
    let tipoDisjuntor = 'Bipolar'; // Padrão 220V Bi
    if (tensaoRede === '220bi') {
      correnteInversor = inversorW / 220;
      tipoDisjuntor = 'Bipolar';
    } else if (tensaoRede === '220mono') {
      correnteInversor = inversorW / 220;
      tipoDisjuntor = 'Unipolar';
    } else if (tensaoRede === '380tri') {
      correnteInversor = inversorW / (380 * 1.732);
      tipoDisjuntor = 'Tripolar';
    }

    // Acha o disjuntor comercial imediatamente acima da corrente do inversor + 20%
    const correnteSegura = correnteInversor * 1.2;
    const disjuntorCA = disjuntoresComerciais.find(d => d >= correnteSegura) || 150;

    // Cabeamento CC com margem de segurança de 15%
    const qtdeStringsEstimada = Math.ceil(numPlacas / 10);
    // Para cada string, um par de cabos descendo até o inversor.
    const caboCCPorPolo = Math.ceil(distCC * qtdeStringsEstimada * 1.15); 
    const caboTerraCC = Math.ceil(distCC * 1.15);
    const mc4Pares = qtdeStringsEstimada * 2;

    // Cabeamento CA com margem de segurança de 15%
    const caboCA = Math.ceil(distCA * 1.15);
    const caboTerraCA = Math.ceil(distCA * 1.15);
    let descricaoCaboCA = 'Cabo CA 3 vias (Fase+Fase+Terra)';
    if (tensaoRede === '380tri') descricaoCaboCA = 'Cabo CA 5 vias (3 Fases+Neutro+Terra)';
    if (tensaoRede === '220mono') descricaoCaboCA = 'Cabo CA 3 vias (Fase+Neutro+Terra)';

    // Nomes adaptados para Off-Grid / Híbrido
    let nomeInversor = 'Inversor Solar de Rede (On-Grid)';
    let nomeQuadroCA = 'String Box CA (Disjuntor e DPS)';
    let precisaBateria = false;

    if (tipoSistema === 'offgrid') {
      nomeInversor = 'Inversor Off-Grid (Ilha) / Controlador de Carga';
      nomeQuadroCA = 'Quadro de Distribuição CA (Consumo)';
      precisaBateria = true;
    } else if (tipoSistema === 'hibrido') {
      nomeInversor = 'Inversor Híbrido';
      precisaBateria = true;
    }

    setResultado({
      tipoSistema,
      precisaBateria,
      nomeInversor,
      nomeQuadroCA,
      numPlacas,
      potTotalKwp: potTotalKwp.toFixed(2),
      areaTotal: areaTotal.toFixed(1),
      inversorSugeridoKwp,
      potPlacaW,
      nomePlaca: placa.nome,
      caboCCPreto: caboCCPorPolo,
      caboCCVermelho: caboCCPorPolo,
      caboTerraCC,
      caboCA,
      caboTerraCA,
      descricaoCaboCA,
      disjuntorCA,
      tipoDisjuntor,
      mc4Pares
    });
  };

  const salvarNoProjeto = async () => {
    if (!projetoSelecionado || !resultado) return;
    
    setSalvando(true);
    setSalvoSucesso(false);
    
    const { error } = await supabase
      .from('projetos')
      .update({ dimensionamento: resultado })
      .eq('id', projetoSelecionado);
      
    setSalvando(false);
    
    if (error) {
      console.error(error);
      alert('Erro ao salvar. Verifique se a coluna "dimensionamento" (jsonb) existe na tabela "projetos" no Supabase!');
    } else {
      setSalvoSucesso(true);
      setTimeout(() => setSalvoSucesso(false), 3000);
    }
  };

  const resetar = () => {
    setMetodo(null);
    setResultado(null);
    setPotenciaKwp('');
    setAreaM2('');
    setDistanciaCC('');
    setDistanciaCA('');
  };

  const copiarLista = () => {
    if (!resultado) return;
    const texto = `LISTA DE MATERIAIS - SISTEMA ${resultado.potTotalKwp} kWp

✅ EQUIPAMENTOS PRINCIPAIS
- ${resultado.numPlacas}x Módulos Solares ${resultado.nomePlaca} de ${resultado.potPlacaW}W
- 1x ${resultado.nomeInversor} (Potência sugerida: ~${resultado.inversorSugeridoKwp} kW)
${resultado.precisaBateria ? '- Banco de Baterias (A dimensionar conforme autonomia desejada)\n' : ''}- ${resultado.numPlacas}x Kits de fixação (suportes) para telhado

✅ CABEAMENTO CC (Com margem de 15%)
- ${resultado.caboCCPreto}m Cabo Solar CC Preto
- ${resultado.caboCCVermelho}m Cabo Solar CC Vermelho
- ${resultado.caboTerraCC}m Cabo Terra Verde/Amarelo (Módulos ao Inversor)
- ${resultado.mc4Pares} pares de Conectores MC4

✅ QUADRO CC E PROTEÇÃO CA
- 1x String Box CC (Fusíveis/Disjuntores CC e DPS CC)
- 1x ${resultado.nomeQuadroCA} com Disjuntor ${resultado.tipoDisjuntor} de ${resultado.disjuntorCA}A e DPS CA

✅ CABEAMENTO CA (Com margem de 15%)
- ${resultado.caboCA}m de ${resultado.descricaoCaboCA} (Inversor ao Padrão)
- ${resultado.caboTerraCA}m Cabo Terra CA (Inversor ao Padrão)`;
    
    navigator.clipboard.writeText(texto);
    alert('Lista de materiais copiada para a área de transferência!');
  };

  const projetosFiltrados = projetos.filter(p => 
    p.titulo.toLowerCase().includes(buscaProjeto.toLowerCase()) ||
    (p as any).clientes?.nome?.toLowerCase().includes(buscaProjeto.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
          <Calculator className="w-8 h-8 text-brand-green" />
          Dimensionamento de Kit
        </h1>
        <p className="text-gray-500 mt-2">
          Gere rapidamente a lista de materiais para a sua obra e vincule ao seu projeto.
        </p>
      </header>

      {!projetoSelecionado ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-brand-dark">Vincular a um Projeto (Opcional)</h2>
            <p className="text-sm text-gray-500 mb-4">Selecione um projeto para salvar automaticamente a lista de materiais gerada.</p>
            
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={buscaProjeto}
                onChange={(e) => setBuscaProjeto(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50"
                placeholder="Buscar projeto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2 mt-4">
              {projetosFiltrados.map((projeto: any) => (
                <div 
                  key={projeto.id} 
                  onClick={() => setProjetoSelecionado(projeto.id)}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-brand-green transition-colors cursor-pointer group"
                >
                  <h3 className="font-semibold text-brand-dark group-hover:text-brand-green transition-colors line-clamp-1">
                    {projeto.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">Cliente: {projeto.clientes?.nome}</p>
                </div>
              ))}
            </div>
            
            <div className="pt-4 flex justify-end border-t border-gray-100 mt-4">
              <button 
                onClick={() => setProjetoSelecionado('avulso')}
                className="text-sm font-bold text-brand-dark hover:text-brand-green transition-colors"
              >
                Pular e fazer Dimensionamento Avulso &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : !metodo ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Projeto vinculado:</p>
              <h3 className="font-bold text-brand-dark">
                {projetoSelecionado === 'avulso' ? 'Dimensionamento Avulso (Não será salvo)' : projetos.find(p => p.id === projetoSelecionado)?.titulo}
              </h3>
            </div>
            <button 
              onClick={() => { setProjetoSelecionado(''); resetar(); }}
              className="text-sm font-medium text-brand-green hover:text-brand-dark transition-colors px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Trocar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <button 
            onClick={() => setMetodo('potencia')}
            className="flex flex-col items-center justify-center p-10 bg-white border-2 border-gray-100 hover:border-brand-green rounded-2xl transition-all hover:shadow-lg group"
          >
            <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark">Montar pela Potência</h3>
            <p className="text-gray-500 text-center mt-2 text-sm">
              Eu sei quantos kWp o cliente precisa.
            </p>
          </button>

          <button 
            onClick={() => setMetodo('area')}
            className="flex flex-col items-center justify-center p-10 bg-white border-2 border-gray-100 hover:border-brand-dark rounded-2xl transition-all hover:shadow-lg group"
          >
            <div className="w-16 h-16 bg-brand-dark/5 text-brand-dark rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Maximize className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark">Montar pelo Tamanho</h3>
            <p className="text-gray-500 text-center mt-2 text-sm">
              Eu sei o tamanho (m²) do telhado disponível.
            </p>
          </button>
        </div>
      </div>
    ) : (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
              {metodo === 'potencia' ? (
                <><Zap className="w-5 h-5 text-brand-green" /> Dimensionar por Potência</>
              ) : (
                <><Maximize className="w-5 h-5 text-brand-dark" /> Dimensionar por Tamanho</>
              )}
            </h2>
            <button 
              onClick={resetar}
              className="text-sm font-medium text-gray-400 hover:text-brand-dark flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Voltar
            </button>
          </div>

          {!resultado ? (
            <div className="space-y-6 max-w-xl">
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <label className="block text-sm font-semibold text-brand-dark mb-3">
                  Tipo de Sistema Solar
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTipoSistema('ongrid')}
                    className={`p-3 rounded-lg border-2 text-sm font-bold transition-colors ${tipoSistema === 'ongrid' ? 'border-brand-green bg-brand-green/10 text-brand-green' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    On-Grid
                  </button>
                  <button
                    onClick={() => setTipoSistema('offgrid')}
                    className={`p-3 rounded-lg border-2 text-sm font-bold transition-colors ${tipoSistema === 'offgrid' ? 'border-brand-dark bg-brand-dark/10 text-brand-dark' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    Off-Grid
                  </button>
                  <button
                    onClick={() => setTipoSistema('hibrido')}
                    className={`p-3 rounded-lg border-2 text-sm font-bold transition-colors ${tipoSistema === 'hibrido' ? 'border-blue-500 bg-blue-500/10 text-blue-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    Híbrido
                  </button>
                </div>
              </div>

              {metodo === 'potencia' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qual a potência desejada para o sistema? (kWp)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={potenciaKwp}
                      onChange={(e) => setPotenciaKwp(e.target.value)}
                      placeholder="Ex: 5.5"
                      className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-xl focus:border-brand-green focus:ring-brand-green/20 outline-none text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kWp</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qual a área disponível no telhado? (m²)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={areaM2}
                      onChange={(e) => setAreaM2(e.target.value)}
                      placeholder="Ex: 30"
                      className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-xl focus:border-brand-dark focus:ring-brand-dark/20 outline-none text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">m²</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qual o modelo da placa solar?
                </label>
                <div className="relative">
                  <select
                    value={placaSelecionadaId}
                    onChange={(e) => setPlacaSelecionadaId(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:border-gray-400 focus:ring-gray-400/20 outline-none appearance-none bg-white text-gray-800"
                  >
                    {MODELOS_PLACAS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} - {p.potenciaW}W ({p.areaM2.toFixed(2).replace('.', ',')} m²)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wide mb-4">Informações de Instalação</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tensão da Rede Elétrica (Local)
                    </label>
                    <div className="relative">
                      <select
                        value={tensaoRede}
                        onChange={(e) => setTensaoRede(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:border-gray-400 focus:ring-gray-400/20 outline-none appearance-none bg-white text-gray-800"
                      >
                        <option value="220bi">220V Bifásico (Fase-Fase 220V)</option>
                        <option value="220mono">220V Monofásico (Fase-Neutro 220V)</option>
                        <option value="380tri">380V Trifásico</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Distância: Módulos ➡️ Inversor
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={distanciaCC}
                          onChange={(e) => setDistanciaCC(e.target.value)}
                          placeholder="Ex: 15"
                          className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-xl focus:border-gray-400 focus:ring-gray-400/20 outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">m</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Distância: Inversor ➡️ Padrão
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={distanciaCA}
                          onChange={(e) => setDistanciaCA(e.target.value)}
                          placeholder="Ex: 10"
                          className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-xl focus:border-gray-400 focus:ring-gray-400/20 outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">m</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Adicionaremos automaticamente 15% de folga nas metragens.
                  </p>
                </div>
              </div>

              <button
                onClick={calcularKit}
                className="w-full bg-brand-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition-colors shadow-lg shadow-brand-dark/20 mt-6"
              >
                Gerar Lista de Materiais <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Potência Real</p>
                  <p className="text-2xl font-bold text-brand-dark mt-1">{resultado.potTotalKwp} <span className="text-sm font-medium text-gray-500">kWp</span></p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Placas</p>
                  <p className="text-2xl font-bold text-brand-dark mt-1">{resultado.numPlacas} <span className="text-sm font-medium text-gray-500">un</span></p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Área Ocupada</p>
                  <p className="text-2xl font-bold text-brand-dark mt-1">{resultado.areaTotal} <span className="text-sm font-medium text-gray-500">m²</span></p>
                </div>
                <div className="bg-brand-green/10 p-4 rounded-xl border border-brand-green/20">
                  <p className="text-xs font-semibold text-brand-dark uppercase">Inversor Sugerido</p>
                  <p className="text-2xl font-bold text-brand-dark mt-1">~{resultado.inversorSugeridoKwp} <span className="text-sm font-medium text-brand-dark/70">kW</span></p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-gray-400" />
                  O que você precisa comprar
                </h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {projetoSelecionado !== 'avulso' && (
                    <button 
                      onClick={salvarNoProjeto}
                      disabled={salvando}
                      className={`flex-1 sm:flex-none text-sm font-bold text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${salvoSucesso ? 'bg-green-500' : 'bg-brand-green hover:bg-brand-green/90'}`}
                    >
                      {salvando ? 'Salvando...' : salvoSucesso ? <><CheckCircle2 className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar no Projeto</>}
                    </button>
                  )}
                  <button 
                    onClick={copiarLista}
                    className="flex-1 sm:flex-none text-sm font-bold text-brand-dark bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copiar 
                  </button>
                </div>
              </div>
              
              <ul className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
                <li className="p-4 flex items-center justify-between hover:bg-white transition-colors bg-white/50">
                  <div>
                    <span className="font-semibold text-brand-dark block">Módulos Solares {resultado.nomePlaca}</span>
                    <span className="text-sm text-gray-500">{resultado.potPlacaW}W por placa</span>
                  </div>
                  <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.numPlacas} un</span>
                </li>
                <li className="p-4 flex items-center justify-between hover:bg-white transition-colors bg-white/50">
                  <div>
                    <span className="font-semibold text-brand-dark block">{resultado.nomeInversor}</span>
                    <span className="text-sm text-gray-500">Potência recomendada aprox. {resultado.inversorSugeridoKwp} kW</span>
                  </div>
                  <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">1 un</span>
                </li>
                {resultado.precisaBateria && (
                  <li className="p-4 flex items-center justify-between bg-blue-50/50 hover:bg-blue-50 transition-colors">
                    <div>
                      <span className="font-semibold text-blue-900 block">Banco de Baterias</span>
                      <span className="text-sm text-blue-700">A dimensionar conforme autonomia desejada pelo cliente</span>
                    </div>
                    <span className="bg-blue-600 text-white font-bold py-1 px-3 rounded-full">A definir</span>
                  </li>
                )}
                <li className="p-4 flex items-center justify-between hover:bg-white transition-colors bg-white/50">
                    <div>
                      <span className="font-semibold text-brand-dark block">Kits de Fixação</span>
                      <span className="text-sm text-gray-500">Trilhos e suportes baseados em {resultado.numPlacas} placas</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.numPlacas} un</span>
                  </li>

                  {/* Lado CC */}
                  <li className="px-4 py-2 bg-gray-100 border-y border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cabeamento Lado CC (Módulos ➡️ Inversor)</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">Cabo Solar CC Preto (Negativo)</span>
                      <span className="text-sm text-gray-500">Já inclui 15% de folga</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.caboCCPreto} m</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">Cabo Solar CC Vermelho (Positivo)</span>
                      <span className="text-sm text-gray-500">Já inclui 15% de folga</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.caboCCVermelho} m</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">Cabo de Aterramento (Verde/Amarelo)</span>
                      <span className="text-sm text-gray-500">Aterramento da estrutura dos módulos ao inversor</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.caboTerraCC} m</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">Conectores MC4</span>
                      <span className="text-sm text-gray-500">Pares macho/fêmea necessários</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.mc4Pares} pares</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">String Box CC</span>
                      <span className="text-sm text-gray-500">Com chaves/disjuntores CC e DPS CC</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">1 un</span>
                  </li>

                  {/* Lado CA */}
                  <li className="px-4 py-2 bg-gray-100 border-y border-gray-200 mt-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cabeamento Lado CA (Inversor ➡️ Padrão/Quadro)</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">{resultado.descricaoCaboCA}</span>
                      <span className="text-sm text-gray-500">Já inclui 15% de folga</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.caboCA} m</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">Cabo de Aterramento (Verde/Amarelo)</span>
                      <span className="text-sm text-gray-500">Aterramento do inversor ao quadro</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.caboTerraCA} m</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">{resultado.nomeQuadroCA}</span>
                      <span className="text-sm text-gray-500">Disjuntor {resultado.tipoDisjuntor} de {resultado.disjuntorCA}A + DPS CA</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">1 un</span>
                  </li>
                </ul>
              </div>
          )}
        </div>
      )}
    </div>
  );
}
