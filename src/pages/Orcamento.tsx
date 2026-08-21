import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, User, Zap, DollarSign, Settings, Calculator } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export function Orcamento() {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [grupo, setGrupo] = useState<'A' | 'B'>('B');
  const [consumoMensal, setConsumoMensal] = useState<number>(400);
  const [geracaoEstimada, setGeracaoEstimada] = useState<number>(450);
  const [potencia, setPotencia] = useState<number>(3.3);
  
  const [modulosQtd, setModulosQtd] = useState<number>(6);
  const [modulosMarca, setModulosMarca] = useState<string>('Canadian 550W');
  const [inversorQtd, setInversorQtd] = useState<number>(1);
  const [inversorMarca, setInversorMarca] = useState<string>('Growatt 3kW');
  
  const [investimento, setInvestimento] = useState<number>(12000);
  const [economiaMensal, setEconomiaMensal] = useState<number>(350);
  const [payback, setPayback] = useState<number>(34); // Meses
  
  const [notes, setNotes] = useState('Proposta válida por 15 dias.\nInstalação inclusa. Homologação na concessionária por nossa conta.');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('@MetodoSol:companyLogo');
    if (savedLogo) {
      setCompanyLogo(savedLogo);
    }
  }, []);

  const generatePDF = () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    
    // Mostra o container oculto para que o html2canvas consiga ler as dimensões corretamente
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
      element.style.display = 'none'; // Esconde novamente após gerar
      setIsGenerating(false);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Proposta Solar</h1>
          <p className="text-sm text-muted-foreground">Gere propostas comerciais personalizadas (Atualizado Lei 14.300)</p>
        </div>
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 gap-2 shadow-md"
        >
          {isGenerating ? <FileText className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
          {isGenerating ? 'Processando PDF...' : 'Gerar PDF Profissional'}
        </button>
      </div>

      {!companyLogo && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg flex items-center gap-3 text-sm">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <p>Você ainda não configurou sua Logo. Vá em <strong>Minha Conta</strong> para enviar a logo da sua empresa e deixá-la visível no PDF.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Painel 1: Dados Básicos */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2">
            <User className="w-4 h-4 text-primary" /> Dados do Cliente e Sistema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Nome do Cliente</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ex: João da Silva" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data da Proposta</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Classificação</label>
              <select value={grupo} onChange={e => setGrupo(e.target.value as 'A'|'B')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="B">Grupo B (Baixa Tensão)</option>
                <option value="A">Grupo A (Média/Alta Tensão)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Painel 2: Dimensionamento */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2">
            <Zap className="w-4 h-4 text-primary" /> Engenharia e Geração
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Consumo (kWh)</label>
              <input type="number" value={consumoMensal} onChange={e => setConsumoMensal(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Geração (kWh)</label>
              <input type="number" value={geracaoEstimada} onChange={e => setGeracaoEstimada(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Potência (kWp)</label>
              <input type="number" step="0.1" value={potencia} onChange={e => setPotencia(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Painel 3: Equipamentos */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2">
            <Settings className="w-4 h-4 text-primary" /> Equipamentos
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Qtd</label>
              <input type="number" value={modulosQtd} onChange={e => setModulosQtd(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center" />
            </div>
            <div className="col-span-9 sm:col-span-10 space-y-2">
              <label className="text-sm font-medium">Módulo Solar (Painel)</label>
              <input type="text" value={modulosMarca} onChange={e => setModulosMarca(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ex: Canadian 550W" />
            </div>
            <div className="col-span-3 sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Qtd</label>
              <input type="number" value={inversorQtd} onChange={e => setInversorQtd(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center" />
            </div>
            <div className="col-span-9 sm:col-span-10 space-y-2">
              <label className="text-sm font-medium">Inversor / Microinversor</label>
              <input type="text" value={inversorMarca} onChange={e => setInversorMarca(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ex: Growatt MIN 5000TL-X" />
            </div>
          </div>
        </div>

        {/* Painel 4: Financeiro */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2">
            <DollarSign className="w-4 h-4 text-primary" /> Financeiro
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Investimento Total (R$)</label>
              <input type="number" value={investimento} onChange={e => setInvestimento(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Economia Mensal (R$)</label>
              <input type="number" value={economiaMensal} onChange={e => setEconomiaMensal(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payback (Meses)</label>
              <input type="number" value={payback} onChange={e => setPayback(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Painel 5: Termos */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4 lg:col-span-2">
          <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2">
            <FileText className="w-4 h-4 text-primary" /> Observações e Condições
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Garantias, forma de pagamento, etc."
          />
        </div>
      </div>

      {/* CONTAINER DO PDF (Oculto na tela para evitar quebra de layout, mas processado pelo html2pdf) */}
      <div style={{ display: 'none' }}>
        <div 
          ref={pdfRef} 
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            backgroundColor: '#ffffff',
            color: '#1f2937', // gray-800
            fontFamily: 'Inter, sans-serif',
            padding: '0',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Tarja Azul / Verde no topo estilo Azumi */}
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
            <div style={{ borderLeft: '4px solid #CDF757', paddingLeft: '15px', marginBottom: '30px' }}>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a' }}>Para: {clientName || '_______________'}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Data: {new Date(date).toLocaleDateString('pt-BR')} &bull; Classificação: {grupo === 'A' ? 'Grupo A (Alta Tensão)' : 'Grupo B (Baixa Tensão)'}</p>
            </div>

            {/* Grid 2 colunas: Sistema e Benefícios */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              {/* Coluna Esquerda */}
              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                  Resumo do Sistema
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#475569', fontSize: '14px' }}>Potência Total:</span>
                  <strong style={{ fontSize: '14px' }}>{potencia.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} kWp</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#475569', fontSize: '14px' }}>Consumo Médio:</span>
                  <strong style={{ fontSize: '14px' }}>{consumoMensal} kWh/mês</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#475569', fontSize: '14px' }}>Geração Estimada:</span>
                  <strong style={{ fontSize: '14px', color: '#16a34a' }}>{geracaoEstimada} kWh/mês</strong>
                </div>
              </div>

              {/* Coluna Direita */}
              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                  Retorno Financeiro
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#475569', fontSize: '14px' }}>Investimento:</span>
                  <strong style={{ fontSize: '14px' }}>R$ {investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#475569', fontSize: '14px' }}>Economia Média:</span>
                  <strong style={{ fontSize: '14px', color: '#16a34a' }}>R$ {economiaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#475569', fontSize: '14px' }}>Payback Estimado:</span>
                  <strong style={{ fontSize: '14px' }}>{payback} meses</strong>
                </div>
              </div>
            </div>

            {/* Equipamentos */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #0f172a', paddingBottom: '5px' }}>
                Composição do Kit Gerador
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Item</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Descrição</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #cbd5e1' }}>Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Módulos Fotovoltaicos</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>{modulosMarca}</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>{modulosQtd}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Inversor Solar</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>{inversorMarca}</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>{inversorQtd}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Estrutura de Fixação</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Kit Fixação Completo</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>1</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>String Box / Proteção</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Quadro de Proteção CA/CC</td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Impacto Ambiental */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#ecfccb', padding: '20px', borderRadius: '8px', border: '1px solid #bef264', marginBottom: '40px' }}>
              <div style={{ fontSize: '30px' }}>🌳</div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#3f6212', fontSize: '15px' }}>Impacto Sustentável</h4>
                <p style={{ margin: 0, color: '#4d7c0f', fontSize: '13px', lineHeight: '1.4' }}>
                  Com este sistema, você deixará de emitir aproximadamente <strong>{((geracaoEstimada * 12 * 0.42) / 1000).toFixed(1)} toneladas de CO₂</strong> por ano, equivalente ao plantio de <strong>{Math.round(geracaoEstimada * 12 * 0.007)} árvores</strong>.
                </p>
              </div>
            </div>

            {/* Condições e Observações */}
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a' }}>Observações e Condições:</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                {notes}
              </p>
            </div>
            
          </div>

          {/* Footer Fixo */}
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: '#f8fafc', padding: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
              Proposta gerada conforme diretrizes da <strong>Lei 14.300/2022</strong>. Os valores de geração e economia são estimativas baseadas em dados históricos de irradiação solar e podem sofrer variações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
