import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Cliente, Projeto, Orcamento } from '../types';
import { ArrowLeft, Save, User, MapPin, Phone, Mail, FileText, DollarSign } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      // Buscar cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (clienteData) setCliente(clienteData);

      // Buscar projetos vinculados
      const { data: projetosData } = await supabase
        .from('projetos')
        .select('*')
        .eq('cliente_id', id)
        .order('criado_em', { ascending: false });

      if (projetosData) setProjetos(projetosData as any);

      // Buscar orçamentos vinculados
      const { data: orcamentosData } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('cliente_id', id)
        .order('criado_em', { ascending: false });

      if (orcamentosData) setOrcamentos(orcamentosData as any);

      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cliente) return;
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;
    
    setSaving(true);
    setMensagem({ texto: '', tipo: '' });

    const { error } = await supabase
      .from('clientes')
      .update({
        nome: cliente.nome,
        documento: cliente.documento,
        telefone: cliente.telefone,
        email: cliente.email,
        endereco: cliente.endereco,
      })
      .eq('id', cliente.id);

    setSaving(false);

    if (error) {
      setMensagem({ texto: 'Erro ao salvar: ' + error.message, tipo: 'error' });
    } else {
      setMensagem({ texto: 'Cliente atualizado com sucesso!', tipo: 'success' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-10 text-center text-gray-500">Cliente não encontrado.</div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/clientes')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">{cliente.nome}</h1>
            <p className="text-gray-500 mt-1">Prontuário do Cliente</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Edição */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h3 className="font-semibold text-lg text-brand-dark border-b pb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Pessoais
            </h3>

            {mensagem.texto && (
              <div className={`p-4 rounded-lg text-sm ${mensagem.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {mensagem.texto}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={cliente.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                <input
                  type="text"
                  name="documento"
                  value={cliente.documento || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="telefone"
                    value={cliente.telefone || ''}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={cliente.email || ''}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Instalação</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="endereco"
                    value={cliente.endereco || ''}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-brand-dark text-white px-6 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Alterações</>}
              </button>
            </div>
          </form>
        </div>

        {/* Histórico e Prontuário */}
        <div className="col-span-1 space-y-6">
          
          {/* Histórico de Orçamentos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg text-brand-dark border-b pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Orçamentos Salvos
              </div>
            </h3>

            {orcamentos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Nenhum orçamento salvo para este cliente.</p>
            ) : (
              <div className="space-y-3 mt-4">
                {orcamentos.map(orc => (
                  <div 
                    key={orc.id} 
                    className="p-3 border border-gray-100 rounded-lg hover:border-brand-dark transition-all bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-brand-dark text-sm">{orc.dados?.potencia} kWp</h4>
                      <span className="text-xs text-gray-500">{new Date(orc.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="text-xs text-gray-600 flex justify-between items-center">
                      <span>R$ {Number(orc.dados?.investimento).toLocaleString('pt-BR')}</span>
                      <span className="text-green-600 font-medium">Econ. R$ {Number(orc.dados?.economiaMensal).toLocaleString('pt-BR')}/mês</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => navigate('/orcamentos')}
              className="w-full mt-4 py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-brand-dark transition-colors text-sm font-medium"
            >
              + Novo Orçamento
            </button>
          </div>

          {/* Histórico de Projetos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg text-brand-dark border-b pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Projetos Vinculados
              </div>
            </h3>

            {projetos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Este cliente ainda não possui projetos.</p>
            ) : (
              <div className="space-y-3">
                {projetos.map(projeto => (
                  <div 
                    key={projeto.id} 
                    onClick={() => navigate(`/projetos/${projeto.id}`)}
                    className="p-3 border border-gray-100 rounded-lg hover:border-brand-dark hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <h4 className="font-medium text-brand-dark group-hover:text-brand-light line-clamp-1">{projeto.titulo}</h4>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{projeto.potencia_kwp ? `${projeto.potencia_kwp} kWp` : 'Sem potência'}</span>
                      <StatusBadge 
                        status={
                          projeto.status === 'levantamento' ? 'warning' :
                          projeto.status === 'contrato' ? 'info' :
                          projeto.status === 'instalacao' ? 'info' : 'success'
                        } 
                        label={projeto.status} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => navigate('/projetos/novo')}
              className="w-full mt-4 py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-brand-dark transition-colors text-sm font-medium"
            >
              + Novo Projeto
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
