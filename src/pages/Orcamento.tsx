import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, User, Zap, DollarSign, Settings, Save, Home, Activity } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { supabase } from '../lib/supabase';
import type { Cliente } from '../types';

export function Orcamento() {
  // Clientes
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

    const { error } = await supabase.from('orcamentos').insert([{ cliente_id: selectedClienteId, dados: dadosJson }]);
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

      {/* ---- CLIENTE & TARIFA ---- */}
      <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 text-brand-dark">
          <User className="w-4 h-4" /> Cliente e Modalidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Nome do Cliente</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                  if (selectedClienteId) setSelectedClienteId('');
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm focus:ring-1 focus:ring-brand-dark"
              />
            </div>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredClientes.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">Nenhum cliente</div>
                ) : (
                  filteredClientes.map(c => (
                    <div
                      key={c.id}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedClienteId === c.id ? 'bg-gray-100 font-medium' : ''}`}
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
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Modalidade Tarifária</label>
            <select value={grupo} onChange={e => setGrupo(e.target.value as 'A'|'B')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="B">Grupo B (Baixa Tensão)</option>
              <option value="A">Grupo A (Alta Tensão)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---- UNIDADE CONSUMIDORA & DADOS DA CONTA ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 text-brand-dark">
            <Home className="w-4 h-4" /> Unidade Consumidora
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-gray-700">Nome da UC</label>
              <input type="text" value={ucName} onChange={e => setUcName(e.target.value)} placeholder="Ex: Casa Praia" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-gray-700">Tipo de UC</label>
              <select value={ucTipo} onChange={e => setUcTipo(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 text-brand-dark">
            <FileText className="w-4 h-4" /> Dados da Conta
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Concessionária</label>
              <input type="text" value={concessionaria} onChange={e => setConcessionaria(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Rede</label>
              <select value={tipoRede} onChange={e => setTipoRede(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Monofásico">Monofásico</option>
                <option value="Bifásico">Bifásico</option>
                <option value="Trifásico">Trifásico</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-700">Valor kWh (R$)</label>
              <input type="number" step="0.01" value={valorKwh} onChange={e => setValorKwh(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-700">Taxa Ilum. Púb (R$)</label>
              <input type="number" step="0.01" value={taxaIlumPub} onChange={e => setTaxaIlumPub(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- CONSUMO MENSAL ---- */}
      <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <h3 className="font-semibold flex items-center gap-2 text-brand-dark">
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
            <input type="number" value={consumoMensal} onChange={e => setConsumoMensal(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-blue-50 px-3 py-2 text-sm font-semibold" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {mesesNomes.map((mes, idx) => (
              <div key={mes} className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{mes}</label>
                <input type="number" value={consumosMeses[idx] || ''} onChange={e => handleMesChange(idx, e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm text-center" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- DIMENSIONAMENTO & VIABILIDADE ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 text-brand-dark">
            <Settings className="w-4 h-4" /> Dimensionamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">% Geração</label>
              <input type="number" value={geracaoPercentual} onChange={e => setGeracaoPercentual(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">% Perdas</label>
              <input type="number" value={perdas} onChange={e => setPerdas(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2 col-span-2 border-t pt-3">
              <label className="text-sm font-medium text-gray-700">Potência do Sistema (kWp)</label>
              <input type="number" step="0.1" value={potencia} onChange={e => setPotencia(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-brand-primary bg-brand-primary/5 px-3 py-2 text-sm font-semibold" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 text-brand-dark">
            <Activity className="w-4 h-4" /> Viabilidade (Fio B)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-700">Fator de Simultaneidade (%)</label>
              <input type="number" value={fatorSimultaneidade} onChange={e => setFatorSimultaneidade(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor Fio B (R$)</label>
              <input type="number" step="0.01" value={valorFioB} onChange={e => setValorFioB(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Percentual Fio B (%)</label>
              <input type="number" value={percentualFioB} onChange={e => setPercentualFioB(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-500" readOnly title="Usado em cálculos avançados" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- EQUIPAMENTOS & FINANCEIRO ---- */}
      <div className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 text-brand-dark">
              <Settings className="w-4 h-4" /> Equipamentos
            </h3>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <label className="text-xs font-medium text-gray-500">Qtd</label>
                <input type="number" value={modulosQtd} onChange={e => setModulosQtd(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-center" />
              </div>
              <div className="col-span-9">
                <label className="text-xs font-medium text-gray-500">Módulo Solar</label>
                <input type="text" value={modulosMarca} onChange={e => setModulosMarca(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="col-span-3">
                <label className="text-xs font-medium text-gray-500">Qtd</label>
                <input type="number" value={inversorQtd} onChange={e => setInversorQtd(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-center" />
              </div>
              <div className="col-span-9">
                <label className="text-xs font-medium text-gray-500">Inversor</label>
                <input type="text" value={inversorMarca} onChange={e => setInversorMarca(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 text-brand-dark">
              <DollarSign className="w-4 h-4" /> Resultados Financeiros
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Investimento Total (R$)</label>
                <input type="number" value={investimento} onChange={e => setInvestimento(Number(e.target.value))} className="flex h-12 w-full rounded-md border-2 border-brand-dark bg-gray-50 px-3 py-2 text-lg font-bold text-brand-dark" />
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


      {/* ---- PDF OCULTO ---- */}
      <div style={{ display: 'none' }}>
        <div 
          ref={pdfRef} 
          style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', position: 'relative' }}
        >
          {/* Header */}
          <div style={{ backgroundColor: '#0f172a', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
            <div>
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#CDF757' }}>Sua Logo Aqui</div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Proposta Comercial</h1>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Energia Solar Fotovoltaica</p>
            </div>
          </div>

          <div style={{ padding: '40px' }}>
            
            {/* Bloco Cliente */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ flex: 1, borderLeft: '4px solid #CDF757', paddingLeft: '15px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a' }}>Para: {clientName || '_______________'}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Data: {new Date(date).toLocaleDateString('pt-BR')}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Unidade: {ucName || 'Principal'} ({ucTipo})</p>
              </div>
              <div style={{ flex: 1, borderLeft: '4px solid #e2e8f0', paddingLeft: '15px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Concessionária: {concessionaria} - {tipoRede}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Tarifa: {grupo === 'A' ? 'Grupo A (Alta Tensão)' : 'Grupo B (Baixa Tensão)'}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Valor da Tarifa: R$ {valorKwh.toFixed(2)}/kWh</p>
              </div>
            </div>

            {/* Grid 2 colunas: Sistema e Financeiro */}
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
            <div style={{ marginBottom: '20px' }}>
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
  );
}
