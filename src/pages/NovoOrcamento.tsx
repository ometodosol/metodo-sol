import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, User, Zap, DollarSign, Settings, Save, Home, Activity, History, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { supabase } from '../lib/supabase';
import type { Cliente } from '../types';
import { useLocation } from 'react-router-dom';

const concessionariasData = [
  // Norte
  { nome: 'Amazonas Energia (AM)', tarifa: 0.98 },
  { nome: 'CEA Equatorial (AP)', tarifa: 0.95 },
  { nome: 'Energisa AC (AC)', tarifa: 0.96 },
  { nome: 'Energisa RO (RO)', tarifa: 0.92 },
  { nome: 'Energisa TO (TO)', tarifa: 0.89 },
  { nome: 'Equatorial PA (PA)', tarifa: 0.98 },
  { nome: 'Roraima Energia (RR)', tarifa: 1.05 },
  // Nordeste
  { nome: 'Enel CE (CE)', tarifa: 0.74 },
  { nome: 'Energisa PB (PB)', tarifa: 0.82 },
  { nome: 'Energisa SE (SE)', tarifa: 0.79 },
  { nome: 'Equatorial AL (AL)', tarifa: 0.86 },
  { nome: 'Equatorial MA (MA)', tarifa: 0.96 },
  { nome: 'Equatorial PI (PI)', tarifa: 0.91 },
  { nome: 'Neoenergia Coelba (BA)', tarifa: 0.88 },
  { nome: 'Neoenergia Cosern (RN)', tarifa: 0.84 },
  { nome: 'Neoenergia Pernambuco (PE)', tarifa: 0.85 },
  // Centro-Oeste
  { nome: 'Energisa MS (MS)', tarifa: 0.79 },
  { nome: 'Energisa MT (MT)', tarifa: 0.82 },
  { nome: 'Equatorial GO (GO)', tarifa: 0.87 },
  { nome: 'Neoenergia Brasília (DF)', tarifa: 0.81 },
  // Sudeste
  { nome: 'CEMIG-D (MG)', tarifa: 0.95 },
  { nome: 'CPFL Paulista (SP)', tarifa: 0.70 },
  { nome: 'CPFL Piratininga (SP)', tarifa: 0.71 },
  { nome: 'EDP ES (ES)', tarifa: 0.78 },
  { nome: 'EDP SP (SP)', tarifa: 0.76 },
  { nome: 'Elektro (SP)', tarifa: 0.73 },
  { nome: 'Enel RJ (RJ)', tarifa: 1.00 },
  { nome: 'Enel SP (SP)', tarifa: 0.75 },
  { nome: 'Energisa Minas Rio (MG/RJ)', tarifa: 0.88 },
  { nome: 'Light (RJ)', tarifa: 1.05 },
  // Sul
  { nome: 'CEEE Equatorial (RS)', tarifa: 0.78 },
  { nome: 'Celesc (SC)', tarifa: 0.65 },
  { nome: 'Copel (PR)', tarifa: 0.85 },
  { nome: 'RGE (RS)', tarifa: 0.80 },
];
export function NovoOrcamento() {
  const location = useLocation();
  // Clientes
  const [orcamentoId, setOrcamentoId] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Gerais
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [grupo, setGrupo] = useState<'A' | 'B'>('B');
  
  // UC
  const [ucName, setUcName] = useState('');
  const [ucTipo, setUcTipo] = useState('Residencial');
  
  // Dados da Conta
  const [concessionaria, setConcessionaria] = useState('CEMIG-D');
  const [valorKwh, setValorKwh] = useState(0.95);
  const [taxaIlumPub, setTaxaIlumPub] = useState(35.00);
  const [tipoRede, setTipoRede] = useState('Bifásico');
  
  // Consumo
  const [consumoMode, setConsumoMode] = useState<'media' | 'mensal'>('media');
  const [consumoMensal, setConsumoMensal] = useState(400);
  const [consumosMeses, setConsumosMeses] = useState<number[]>(Array(12).fill(0));
  const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Dimensionamento
  const [geracaoPercentual, setGeracaoPercentual] = useState(100);
  const [perdas, setPerdas] = useState(20);
  const [potencia, setPotencia] = useState(3.3);
  
  // Viabilidade 14.300
  const [fatorSimultaneidade, setFatorSimultaneidade] = useState(30);
  const [valorFioB, setValorFioB] = useState(0.27);
  const [percentualFioB, setPercentualFioB] = useState(36);
  
  // Equipamentos
  const [modulosQtd, setModulosQtd] = useState(6);
  const [modulosMarca, setModulosMarca] = useState('Canadian 550W');
  const [inversorQtd, setInversorQtd] = useState(1);
  const [inversorMarca, setInversorMarca] = useState('Growatt 3kW');
  
  // Financeiro e Notas
  const [investimento, setInvestimento] = useState(12000);
  const [notes, setNotes] = useState('Proposta válida por 15 dias.\nInstalação e homologação na concessionária inclusas.');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historicoLocal, setHistoricoLocal] = useState<any[]>([]);
  const [viewingHistoryObj, setViewingHistoryObj] = useState<any>(null);
  const [backupData, setBackupData] = useState<any>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  // ---------- MOTOR DE CÁLCULO (Lei 14.300) ----------
  const mediaConsumo = consumoMode === 'media' ? consumoMensal : (consumosMeses.reduce((a, b) => a + b, 0) / 12) || 0;
  const geracaoAlvo = mediaConsumo * (geracaoPercentual / 100);
  
  let disponibilidade = 50; // Bifásico default
  if (tipoRede === 'Monofásico') disponibilidade = 30;
  if (tipoRede === 'Trifásico') disponibilidade = 100;
  
  const custoDisponibilidade = disponibilidade * valorKwh;
  const energiaInjetada = geracaoAlvo * (1 - (fatorSimultaneidade / 100));
  const custoFioB = energiaInjetada * valorFioB;
  
  const custoRede = Math.max(custoDisponibilidade, custoFioB);
  const contaComSolar = custoRede + taxaIlumPub;
  const contaSemSolar = (mediaConsumo * valorKwh) + taxaIlumPub;
  
  const economiaMensalReal = Math.max(0, contaSemSolar - contaComSolar);
  const paybackMeses = economiaMensalReal > 0 && investimento > 0 ? Math.round(investimento / economiaMensalReal) : 0;
  const paybackAnos = (paybackMeses / 12).toFixed(1);
  // ----------------------------------------------------

  useEffect(() => {
    const savedLogo = localStorage.getItem('@MetodoSol:companyLogo');
    if (savedLogo) setCompanyLogo(savedLogo);
    
    async function fetchClientes() {
      const { data } = await supabase.from('clientes').select('*').order('criado_em', { ascending: false });
      if (data && data.length > 0) {
        setClientes(data);
        setSelectedClienteId(data[0].id);
        setClientName(data[0].nome);
        setSearchTerm(data[0].nome);
      }
    }
    fetchClientes();
  }, []);

  useEffect(() => {
    if (location.state?.orcamento && clientes.length > 0) {
      const { orcamento } = location.state;
      setOrcamentoId(orcamento.id);
      const d = orcamento.dados;
      if (!d) return;

      setSelectedClienteId(orcamento.cliente_id);
      const clienteEncontrado = clientes.find(c => c.id === orcamento.cliente_id);
      if (clienteEncontrado) {
        setClientName(clienteEncontrado.nome);
        setSearchTerm(clienteEncontrado.nome);
      } else if (d.clientName) {
        setClientName(d.clientName);
        setSearchTerm(d.clientName);
      }
      
  const loadOrcamentoData = (d: any) => {
    if (!d) return;
    if (d.date) setDate(d.date);
    if (d.grupo) setGrupo(d.grupo);
    if (d.ucName) setUcName(d.ucName);
    if (d.ucTipo) setUcTipo(d.ucTipo);
    if (d.concessionaria) setConcessionaria(d.concessionaria);
    if (d.valorKwh) setValorKwh(d.valorKwh);
    if (d.taxaIlumPub) setTaxaIlumPub(d.taxaIlumPub);
    if (d.tipoRede) setTipoRede(d.tipoRede);
    if (d.consumoMode) setConsumoMode(d.consumoMode);
    if (d.consumoMensal) setConsumoMensal(d.consumoMensal);
    if (d.consumosMeses) setConsumosMeses(d.consumosMeses);
    if (d.geracaoPercentual) setGeracaoPercentual(d.geracaoPercentual);
    if (d.perdas) setPerdas(d.perdas);
    if (d.potencia) setPotencia(d.potencia);
    if (d.fatorSimultaneidade) setFatorSimultaneidade(d.fatorSimultaneidade);
    if (d.valorFioB) setValorFioB(d.valorFioB);
    if (d.percentualFioB) setPercentualFioB(d.percentualFioB);
    if (d.modulosQtd) setModulosQtd(d.modulosQtd);
    if (d.modulosMarca) setModulosMarca(d.modulosMarca);
    if (d.inversorQtd) setInversorQtd(d.inversorQtd);
    if (d.inversorMarca) setInversorMarca(d.inversorMarca);
    if (d.investimento) setInvestimento(d.investimento);
    if (d.notes) setNotes(d.notes);
  };

  useEffect(() => {
    if (location.state?.orcamento && clientes.length > 0) {
      const { orcamento } = location.state;
      setOrcamentoId(orcamento.id);
      const d = orcamento.dados;
      if (!d) return;

      setSelectedClienteId(orcamento.cliente_id);
      const clienteEncontrado = clientes.find(c => c.id === orcamento.cliente_id);
      if (clienteEncontrado) {
        setClientName(clienteEncontrado.nome);
        setSearchTerm(clienteEncontrado.nome);
      } else if (d.clientName) {
        setClientName(d.clientName);
        setSearchTerm(d.clientName);
      }
      
      loadOrcamentoData(d);
      if (d.historico) setHistoricoLocal(d.historico);
    }
  }, [location.state, clientes]);

  const filteredClientes = clientes.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleMesChange = (index: number, val: string) => {
    const arr = [...consumosMeses];
    arr[index] = Number(val) || 0;
    setConsumosMeses(arr);
  };

  const handleSaveOrcamento = async () => {
    if (!selectedClienteId) {
      alert('Selecione um cliente para salvar.');
      return;
    }
    
    setIsSaving(true);
    const dadosJson = {
      grupo, date, ucName, ucTipo, concessionaria, valorKwh, taxaIlumPub, tipoRede,
      consumoMode, consumoMensal, consumosMeses, mediaConsumo, geracaoAlvo,
      geracaoPercentual, perdas, potencia, fatorSimultaneidade, valorFioB, percentualFioB,
      modulosQtd, modulosMarca, inversorQtd, inversorMarca,
      investimento, economiaMensal: economiaMensalReal, payback: paybackMeses, notes, clientName
    };

    let error;

    if (orcamentoId) {
      // Buscar dados antigos para salvar no histórico
      const { data: oldData } = await supabase.from('orcamentos').select('dados').eq('id', orcamentoId).single();
      
      const historico = oldData?.dados?.historico || [];
      const oldDadosCopy = { ...oldData?.dados };
      delete oldDadosCopy.historico;

      historico.push({
        data: new Date().toISOString(),
        investimento_anterior: oldData?.dados?.investimento || 0,
        potencia_anterior: oldData?.dados?.potencia || 0,
        dados_completos: oldDadosCopy
      });
      
      setHistoricoLocal(historico);
      const novosDados = { ...dadosJson, historico };
      
      const { error: updateError } = await supabase
        .from('orcamentos')
        .update({ dados: novosDados })
        .eq('id', orcamentoId);
        
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('orcamentos')
        .insert([{ cliente_id: selectedClienteId, dados: dadosJson }]);
      error = insertError;
    }

    setIsSaving(false);
    
    if (error) alert('Erro ao salvar: ' + error.message);
    else alert('Orçamento salvo no prontuário do cliente com sucesso!');
  };

  const generatePDF = () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    const element = pdfRef.current;
    element.style.display = 'block';

    const opt = {
      margin:       0,
      filename:     `Proposta_Solar_${clientName || 'Cliente'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
      setIsGenerating(false);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Proposta Solar</h1>
          <p className="text-sm text-muted-foreground">Motor de Cálculo Lei 14.300 e Orçamento Avançado</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {historicoLocal.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 h-10 px-4 py-2 gap-2 shadow-sm"
            >
              <History className="w-4 h-4" />
              Histórico
            </button>
          )}

          <button
            onClick={handleSaveOrcamento}
            disabled={isSaving || !selectedClienteId}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Settings className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
          
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 gap-2 shadow-md disabled:opacity-50"
          >
            {isGenerating ? <FileText className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
            {isGenerating ? 'PDF...' : 'Gerar PDF'}
          </button>
        </div>
      </div>

      {!companyLogo && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg flex items-center gap-3 text-sm">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <p>Configure a sua <strong>Logo</strong> no menu <strong>Minha Conta</strong> para sair no PDF.</p>
        </div>
      )}

      {viewingHistoryObj && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-xl flex items-center justify-between shadow-sm flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">Visualizando versão de {new Date(viewingHistoryObj.data).toLocaleDateString('pt-BR')} às {new Date(viewingHistoryObj.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-xs opacity-80 mt-0.5">Você pode rolar a tela e ver todos os dados abaixo. Salve para tornar esta versão a atual.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                loadOrcamentoData(backupData);
                setViewingHistoryObj(null);
              }}
              className="px-3 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-lg text-xs font-bold transition-colors"
            >
              Desfazer e Voltar
            </button>
            <button 
              onClick={() => setViewingHistoryObj(null)}
              className="px-3 py-1.5 bg-brand-dark text-white hover:bg-brand-dark/90 rounded-lg text-xs font-bold transition-colors"
            >
              Manter na tela
            </button>
          </div>
        </div>
      )}

      {/* ---- CLIENTE & TARIFA ---- */}
      <div className="bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2 text-card-foreground">
          <User className="w-4 h-4" /> Cliente e Modalidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Nome do Cliente</label>
            <div className="relative">
              {selectedClienteId ? (
                <div className="flex items-center justify-between h-10 w-full rounded-md border border-green-200 bg-green-50/50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 text-green-800 font-medium">
                    <User className="w-4 h-4 text-green-600" />
                    {clientName}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedClienteId('');
                      setSearchTerm('');
                    }}
                    className="text-xs text-green-600 hover:text-green-800 font-semibold underline px-2"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-brand-dark"
                  />
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredClientes.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">Nenhum cliente encontrado</div>
                      ) : (
                        filteredClientes.map(c => (
                          <div
                            key={c.id}
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSelectedClienteId(c.id);
                              setSearchTerm(c.nome);
                              setClientName(c.nome);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {c.nome}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Modalidade Tarifária</label>
            <select value={grupo} onChange={e => setGrupo(e.target.value as 'A'|'B')} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm">
              <option value="B">Grupo B (Baixa Tensão)</option>
              <option value="A">Grupo A (Alta Tensão)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---- UNIDADE CONSUMIDORA & DADOS DA CONTA ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2 text-card-foreground">
            <Home className="w-4 h-4" /> Unidade Consumidora
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-gray-700">Nome da UC</label>
              <input type="text" value={ucName} onChange={e => setUcName(e.target.value)} placeholder="Ex: Casa Praia" className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-gray-700">Tipo de UC</label>
              <select value={ucTipo} onChange={e => setUcTipo(e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm">
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2 text-card-foreground">
            <FileText className="w-4 h-4" /> Concessionárias
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Concessionária</label>
              <select 
                value={concessionaria} 
                onChange={e => {
                  setConcessionaria(e.target.value);
                  const found = concessionariasData.find(c => c.nome === e.target.value);
                  if(found) setValorKwh(found.tarifa);
                }} 
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Selecione...</option>
                {concessionariasData.map(c => (
                  <option key={c.nome} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Rede</label>
              <select value={tipoRede} onChange={e => setTipoRede(e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm">
                <option value="Monofásico">Monofásico</option>
                <option value="Bifásico">Bifásico</option>
                <option value="Trifásico">Trifásico</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-700">Valor kWh (R$)</label>
              <input type="number" step="0.01" value={valorKwh} onChange={e => setValorKwh(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-700">Taxa Ilum. Púb (R$)</label>
              <input type="number" step="0.01" value={taxaIlumPub} onChange={e => setTaxaIlumPub(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- CONSUMO MENSAL ---- */}
      <div className="bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
          <h3 className="font-semibold flex items-center gap-2 text-card-foreground">
            <Zap className="w-4 h-4" /> Consumo Mensal (kWh)
          </h3>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${consumoMode === 'media' ? 'font-bold text-brand-dark' : 'text-gray-400'}`}>Média</span>
            <button 
              onClick={() => setConsumoMode(m => m === 'media' ? 'mensal' : 'media')}
              className={`w-10 h-5 rounded-full relative transition-colors ${consumoMode === 'mensal' ? 'bg-brand-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${consumoMode === 'mensal' ? 'left-[22px]' : 'left-[3px]'}`}></div>
            </button>
            <span className={`text-sm ${consumoMode === 'mensal' ? 'font-bold text-brand-dark' : 'text-gray-400'}`}>Mensal</span>
          </div>
        </div>

        {consumoMode === 'media' ? (
          <div className="max-w-xs">
            <label className="text-sm font-medium text-gray-700">Valor Média (kWh)</label>
            <input type="number" value={consumoMensal} onChange={e => setConsumoMensal(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 bg-blue-50 px-3 py-2 text-sm font-semibold" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {mesesNomes.map((mes, idx) => (
              <div key={mes} className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{mes}</label>
                <input type="number" value={consumosMeses[idx] || ''} onChange={e => handleMesChange(idx, e.target.value)} className="flex h-9 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-2 py-1 text-sm text-center" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- DIMENSIONAMENTO & VIABILIDADE ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2 text-card-foreground">
            <Settings className="w-4 h-4" /> Dimensionamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">% Geração</label>
              <input type="number" value={geracaoPercentual} onChange={e => setGeracaoPercentual(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">% Perdas</label>
              <input type="number" value={perdas} onChange={e => setPerdas(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2 col-span-2 border-t pt-3">
              <label className="text-sm font-medium text-gray-700">Potência do Sistema (kWp)</label>
              <input type="number" step="0.1" value={potencia} onChange={e => setPotencia(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 bg-brand-primary/5 px-3 py-2 text-sm font-semibold" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2 text-card-foreground">
            <Activity className="w-4 h-4" /> Viabilidade (Fio B)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-700">Fator de Simultaneidade (%)</label>
              <input type="number" value={fatorSimultaneidade} onChange={e => setFatorSimultaneidade(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor Fio B (R$)</label>
              <input type="number" step="0.01" value={valorFioB} onChange={e => setValorFioB(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Percentual Fio B (%)</label>
              <input type="number" value={percentualFioB} onChange={e => setPercentualFioB(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500" readOnly title="Usado em cálculos avançados" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- EQUIPAMENTOS & FINANCEIRO ---- */}
      <div className="bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2 text-card-foreground">
              <Settings className="w-4 h-4" /> Equipamentos
            </h3>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <label className="text-xs font-medium text-gray-500">Qtd</label>
                <input type="number" value={modulosQtd} onChange={e => setModulosQtd(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-2 py-2 text-sm text-center" />
              </div>
              <div className="col-span-9">
                <label className="text-xs font-medium text-gray-500">Módulo Solar</label>
                <input type="text" value={modulosMarca} onChange={e => setModulosMarca(e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
              </div>
              <div className="col-span-3">
                <label className="text-xs font-medium text-gray-500">Qtd</label>
                <input type="number" value={inversorQtd} onChange={e => setInversorQtd(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-2 py-2 text-sm text-center" />
              </div>
              <div className="col-span-9">
                <label className="text-xs font-medium text-gray-500">Inversor</label>
                <input type="text" value={inversorMarca} onChange={e => setInversorMarca(e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2 text-card-foreground">
              <DollarSign className="w-4 h-4" /> Resultados Financeiros
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Investimento Total (R$)</label>
                <input type="number" value={investimento} onChange={e => setInvestimento(Number(e.target.value))} className="flex h-12 w-full rounded-md border border-gray-200 dark:border-white/10 bg-background px-3 py-2 text-lg font-bold text-brand-dark" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 font-medium mb-1">Economia Mensal</p>
                  <p className="text-lg font-bold text-green-700">R$ {economiaMensalReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">Payback</p>
                  <p className="text-lg font-bold text-blue-700">{paybackMeses} meses <span className="text-xs font-normal opacity-75">({paybackAnos} anos)</span></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Histórico do Orçamento
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {[...historicoLocal].reverse().map((h, i) => (
                <div 
                  key={i} 
                  className={`border border-gray-100 rounded-lg p-3 bg-gray-50/50 hover:bg-gray-100 transition-colors ${h.dados_completos ? 'cursor-pointer' : 'opacity-70'}`}
                  onClick={() => {
                    if (h.dados_completos) {
                      const currentDados = {
                        grupo, date, ucName, ucTipo, concessionaria, valorKwh, taxaIlumPub, tipoRede,
                        consumoMode, consumoMensal, consumosMeses, mediaConsumo, geracaoAlvo,
                        geracaoPercentual, perdas, potencia, fatorSimultaneidade, valorFioB, percentualFioB,
                        modulosQtd, modulosMarca, inversorQtd, inversorMarca,
                        investimento, notes
                      };
                      if (!viewingHistoryObj) {
                        setBackupData(currentDados);
                      }
                      setViewingHistoryObj(h);
                      loadOrcamentoData(h.dados_completos);
                      setShowHistory(false);
                    } else {
                      alert('Aviso: Esta versão mais antiga não possui os detalhes completos salvos. (O sistema começou a registrar todos os campos nas versões mais recentes).');
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">v{historicoLocal.length - i}</span>
                      {new Date(h.data).toLocaleDateString('pt-BR')} às {new Date(h.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {h.dados_completos && (
                      <span className="text-[10px] font-bold text-brand-dark bg-brand-light/20 px-2 py-1 rounded">Ver Detalhes</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Investimento:</span>
                      <span className="font-semibold text-gray-900">R$ {Number(h.investimento_anterior || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Potência:</span>
                      <span className="font-semibold text-gray-900">{h.potencia_anterior || 0} kWp</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowHistory(false)}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- PDF OCULTO (Multi-páginas) ---- */}
      <div style={{ display: 'none' }}>
        <div 
          ref={pdfRef} 
          style={{ width: '210mm', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
        >
          
          {/* ================= PÁGINA 1: CAPA ================= */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header da Capa */}
            <div style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: '60px' }}>
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" style={{ maxHeight: '120px', maxWidth: '300px', objectFit: 'contain', margin: '0 auto' }} />
                ) : (
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#0f172a' }}>Sua Empresa Aqui</div>
                )}
              </div>
              
              <h1 style={{ margin: '0 0 20px 0', fontSize: '36px', color: '#0f172a', fontWeight: '800', lineHeight: '1.2' }}>
                Proposta Comercial<br/>Sistema de Energia Solar
              </h1>
              
              <div style={{ width: '100px', height: '4px', backgroundColor: '#84cc16', margin: '30px auto' }}></div>
              
              <p style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#64748b' }}>Elaborada especialmente para:</p>
              <h2 style={{ margin: 0, fontSize: '28px', color: '#0f172a', textTransform: 'uppercase' }}>{clientName || 'Cliente'}</h2>
              
              <div style={{ marginTop: '50px', fontSize: '14px', color: '#94a3b8' }}>
                <p style={{ margin: '5px 0' }}>Data: {new Date(date).toLocaleDateString('pt-BR')}</p>
                <p style={{ margin: '5px 0' }}>Unidade Consumidora: {ucName || 'Principal'} ({ucTipo})</p>
                <p style={{ margin: '5px 0' }}>Concessionária: {concessionaria}</p>
              </div>
            </div>

            {/* Footer da Capa */}
            <div style={{ backgroundColor: '#0f172a', padding: '30px', textAlign: 'center', color: '#fff' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                Projeto gerador de energia limpa e renovável.<br/>
                Proteja-se contra a inflação energética e valorize seu patrimônio.
              </p>
            </div>
          </div>

          <div className="html2pdf__page-break"></div>

          {/* ================= PÁGINA 2: BENEFÍCIOS E COMO FUNCIONA ================= */}
          <div style={{ position: 'relative', padding: '40px' }}>
            
            <h2 style={{ fontSize: '24px', color: '#0f172a', textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
              Benefícios do Sistema
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '50px' }}>
              <div style={{ width: '45%', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px' }}>💰 Economia Imediata</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Reduza em até 95% o valor da sua conta de energia todos os meses.</p>
              </div>
              <div style={{ width: '45%', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px' }}>🛡️ Proteção Contra Inflação</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Fique imune aos aumentos anuais da tarifa e bandeiras tarifárias.</p>
              </div>
              <div style={{ width: '45%', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px' }}>🏠 Valorização do Imóvel</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Imóveis com energia solar são mais atrativos e valorizados no mercado.</p>
              </div>
              <div style={{ width: '45%', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px' }}>🌱 Energia Sustentável</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Gere energia limpa, renovável e contribua com o futuro do planeta.</p>
              </div>
            </div>

            <h2 style={{ fontSize: '24px', color: '#0f172a', textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
              Como Funciona
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '50px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ minWidth: '30px', height: '30px', borderRadius: '15px', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', lineHeight: '30px', fontWeight: 'bold' }}>1</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}><strong>Captação:</strong> Os módulos fotovoltaicos transformam a luz do sol em energia elétrica contínua.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ minWidth: '30px', height: '30px', borderRadius: '15px', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', lineHeight: '30px', fontWeight: 'bold' }}>2</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}><strong>Inversão:</strong> O inversor transforma a energia contínua em alternada, pronta para uso no imóvel.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ minWidth: '30px', height: '30px', borderRadius: '15px', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', lineHeight: '30px', fontWeight: 'bold' }}>3</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}><strong>Consumo:</strong> A energia processada alimenta todos os equipamentos da sua unidade consumidora.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ minWidth: '30px', height: '30px', borderRadius: '15px', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', lineHeight: '30px', fontWeight: 'bold' }}>4</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}><strong>Injeção:</strong> Toda energia excedente que você não usar é injetada na rede e vira créditos para a noite.</p>
              </div>
            </div>

            <h2 style={{ fontSize: '24px', color: '#0f172a', textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
              Nosso Processo (Passo a Passo)
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              {[
                { step: 1, title: 'Proposta', desc: 'Aprovação financeira e do projeto' },
                { step: 2, title: 'Vistoria', desc: 'Análise técnica do local e telhado' },
                { step: 3, title: 'Engenharia', desc: 'Aprovação junto à concessionária' },
                { step: 4, title: 'Instalação', desc: 'Montagem completa do sistema' },
                { step: 5, title: 'Ativação', desc: 'Troca do medidor e geração ativa' }
              ].map(p => (
                <div key={p.step} style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px 10px', textAlign: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px', lineHeight: '24px', textAlign: 'center', margin: '0 auto 10px auto', fontWeight: 'bold' }}>{p.step}</div>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '5px' }}>{p.title}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', lineHeight: '1.4' }}>{p.desc}</span>
                </div>
              ))}
            </div>

          </div>

          <div className="html2pdf__page-break"></div>

          {/* ================= PÁGINA 3: PROPOSTA TÉCNICA E FINANCEIRA ================= */}
          <div style={{ position: 'relative', padding: '0' }}>
            
            {/* Header Reduzido */}
            <div style={{ backgroundColor: '#0f172a', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Proposta Técnica e Financeira</h1>
              </div>
              <div>
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" style={{ maxHeight: '30px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#CDF757' }}>Sua Logo</div>
                )}
              </div>
            </div>

            <div style={{ padding: '40px' }}>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Resumo do Sistema</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>Potência Instalada:</span>
                    <strong>{potencia.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} kWp</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>Consumo Médio Atual:</span>
                    <strong>{mediaConsumo.toFixed(0)} kWh/mês</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>Geração Projetada:</span>
                    <strong style={{ color: '#16a34a' }}>{geracaoAlvo.toFixed(0)} kWh/mês</strong>
                  </div>
                </div>

                <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Análise Financeira (Lei 14.300)</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>Investimento:</span>
                    <strong>R$ {investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>Economia Média:</span>
                    <strong style={{ color: '#16a34a' }}>R$ {economiaMensalReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>Payback Estimado:</span>
                    <strong>{paybackMeses} meses ({paybackAnos} anos)</strong>
                  </div>
                </div>
              </div>

              {/* Impacto Ambiental */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ecfccb', padding: '20px', borderRadius: '8px', border: '1px solid #bef264', marginBottom: '30px' }}>
                <div style={{ fontSize: '30px' }}>🌳</div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#3f6212', fontSize: '15px' }}>Impacto Sustentável</h4>
                  <p style={{ margin: 0, color: '#4d7c0f', fontSize: '13px', lineHeight: '1.4' }}>
                    Com este sistema, você deixará de emitir <strong>{((geracaoAlvo * 12 * 0.42) / 1000).toFixed(1)} toneladas de CO₂</strong> por ano, equivalente ao plantio de <strong>{Math.round(geracaoAlvo * 12 * 0.007)} árvores</strong>.
                  </p>
                </div>
              </div>

              {/* Equipamentos */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #0f172a', paddingBottom: '5px' }}>Composição do Kit Gerador</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Item</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Descrição</th>
                      <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #cbd5e1' }}>Qtd</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Módulos Solares</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>{modulosMarca}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>{modulosQtd}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Inversor / Microinversor</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>{inversorMarca}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>{inversorQtd}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notas */}
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0f172a' }}>Observações:</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{notes}</p>
              </div>
            </div>

            {/* Footer Fixo */}
            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: '#f8fafc', padding: '15px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>
                Proposta baseada na Lei 14.300/2022. Economia calculada considerando Fio B (Tarifa TUSD) e Custo de Disponibilidade.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
