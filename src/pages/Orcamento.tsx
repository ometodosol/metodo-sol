import React, { useState, useRef } from 'react';
import { Plus, Trash2, FileText, Download, User, Save } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function Orcamento() {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', description: 'Sistema Fotovoltaico 5kWp', quantity: 1, unitPrice: 15000 }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const total = subtotal - discount;

  const generatePDF = () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    
    const element = pdfRef.current;
    const opt = {
      margin:       10,
      filename:     `Orcamento_${clientName || 'Cliente'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsGenerating(false);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Novo Orçamento</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados abaixo para gerar o PDF.</p>
        </div>
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          {isGenerating ? <FileText className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
          {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lado do Formulário */}
        <div className="space-y-6">
          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" /> Dados Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Itens do Orçamento
              </h3>
              <button
                onClick={addItem}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-1 border border-border"
              >
                <Plus className="w-3 h-3" /> Adicionar Item
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Descrição do item"
                    />
                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Qtd"
                        />
                      </div>
                      <div className="w-2/3 relative">
                        <span className="absolute left-3 top-2 text-muted-foreground text-sm">R$</span>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="flex h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 text-destructive h-9 w-9 border border-transparent flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm gap-2">
                  <span className="text-muted-foreground">Desconto</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="flex h-8 w-24 rounded-md border border-input bg-background px-2 py-1 text-sm text-right focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Save className="w-4 h-4" /> Observações (Termos)
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Ex: Proposta válida por 15 dias. Forma de pagamento: 50% no aceite e 50% na entrega."
            />
          </div>
        </div>

        {/* Lado do Preview do PDF */}
        <div className="relative">
          <div className="sticky top-6">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Pré-visualização</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">Formato A4</span>
            </div>
            
            {/* O container a ser exportado para PDF */}
            <div className="bg-white border border-border shadow-sm rounded-lg overflow-hidden">
              <div 
                ref={pdfRef} 
                className="p-8 text-black bg-white" 
                style={{ width: '100%', minHeight: '297mm', boxSizing: 'border-box' }}
              >
                {/* Cabeçalho do PDF */}
                <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
                  <div>
                    <img src="/logo-dark.png" alt="O Método Sol" className="h-12 object-contain mb-2" />
                    <h2 className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Proposta Comercial</h2>
                  </div>
                  <div className="text-right text-sm text-gray-600 space-y-1">
                    <p><strong>Data:</strong> {new Date(date).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Cliente:</strong> {clientName || '_______________'}</p>
                  </div>
                </div>

                {/* Tabela de Itens */}
                <div className="mb-8">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4">Descrição</th>
                        <th className="py-3 px-4 text-center">Qtd</th>
                        <th className="py-3 px-4 text-right">Valor Unit.</th>
                        <th className="py-3 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-4">{item.description || '-'}</td>
                          <td className="py-3 px-4 text-center">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-4 text-right">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumo Financeiro */}
                <div className="flex justify-end mb-8">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Subtotal:</span>
                      <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2 text-red-500">
                        <span>Desconto:</span>
                        <span>- R$ {discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2">
                      <span>TOTAL:</span>
                      <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {notes && (
                  <div className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                    <h4 className="font-semibold text-gray-700 mb-2">Termos e Condições:</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{notes}</p>
                  </div>
                )}
                
                {/* Rodapé */}
                <div className="mt-16 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
                  Documento gerado pela plataforma O Método Sol.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
