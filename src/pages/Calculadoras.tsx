import React, { useState } from 'react';
import { Calculator, Zap, Maximize, ArrowRight, ShoppingCart, Info, RotateCcw, Copy, ChevronDown } from 'lucide-react';

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

export function Calculadoras() {
  const [metodo, setMetodo] = useState<MetodoCalculo>(null);
  
  // Entradas Básicas
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

    setResultado({
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
- 1x Inversor Solar (Potência sugerida: ~${resultado.inversorSugeridoKwp} kW)
- ${resultado.numPlacas}x Kits de fixação (suportes) para telhado

✅ CABEAMENTO CC (Com margem de 15%)
- ${resultado.caboCCPreto}m Cabo Solar CC Preto
- ${resultado.caboCCVermelho}m Cabo Solar CC Vermelho
- ${resultado.caboTerraCC}m Cabo Terra Verde/Amarelo (Módulos ao Inversor)
- ${resultado.mc4Pares} pares de Conectores MC4

✅ QUADRO CC E PROTEÇÃO CA
- 1x String Box CC (Fusíveis/Disjuntores CC e DPS CC)
- 1x Quadro CA com Disjuntor ${resultado.tipoDisjuntor} de ${resultado.disjuntorCA}A e DPS CA

✅ CABEAMENTO CA (Com margem de 15%)
- ${resultado.caboCA}m de ${resultado.descricaoCaboCA} (Inversor ao Padrão)
- ${resultado.caboTerraCA}m Cabo Terra CA (Inversor ao Padrão)`;
    
    navigator.clipboard.writeText(texto);
    alert('Lista de materiais copiada para a área de transferência!');
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
          <Calculator className="w-8 h-8 text-brand-green" />
          Dimensionador de Kit
        </h1>
        <p className="text-gray-500 mt-2">
          Gere rapidamente a lista de materiais para a sua obra com base na potência ou tamanho do telhado.
        </p>
      </header>

      {!metodo ? (
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

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-gray-400" />
                    O que você precisa comprar
                  </h3>
                  <button 
                    onClick={copiarLista}
                    className="text-sm font-medium text-brand-dark bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copiar Lista
                  </button>
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
                      <span className="font-semibold text-brand-dark block">Inversor Solar de Rede</span>
                      <span className="text-sm text-gray-500">Potência recomendada aprox. {resultado.inversorSugeridoKwp} kW</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">1 un</span>
                  </li>
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
                      <span className="font-semibold text-brand-dark block">Disjuntor CA {resultado.tipoDisjuntor} (Curva C)</span>
                      <span className="text-sm text-gray-500">Proteção recomendada para o lado CA</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{resultado.disjuntorCA}A</span>
                  </li>
                  <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div>
                      <span className="font-semibold text-brand-dark block">DPS CA</span>
                      <span className="text-sm text-gray-500">Dispositivo de Proteção contra Surtos CA</span>
                    </div>
                    <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">1 un</span>
                  </li>

                </ul>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
