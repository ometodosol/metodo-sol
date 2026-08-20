import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Cliente } from '../types';
import { ArrowLeft, Save, Zap, Search, ChevronDown, Check } from 'lucide-react';

export function NovoProjeto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    potencia_kwp: '',
  });

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca os clientes para o select
  useEffect(() => {
    async function fetchClientes() {
      const { data } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome', { ascending: true });
      
      if (data) {
        setClientes(data);
      }
    }
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clienteSelecionado) {
      setErrorMsg("Por favor, selecione um cliente.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('projetos').insert([
      {
        cliente_id: clienteSelecionado.id,
        titulo: formData.titulo,
        potencia_kwp: formData.potencia_kwp ? parseFloat(formData.potencia_kwp) : null,
        status: 'levantamento',
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setErrorMsg('Erro ao criar projeto. Verifique se o seu banco foi atualizado corretamente (RLS): ' + error.message);
    } else {
      navigate('/projetos');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Novo Projeto</h1>
          <p className="text-gray-500 mt-1">Inicie um novo levantamento de sistema solar.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1 md:col-span-2 relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              
              <div 
                onClick={() => setDropdownAberto(true)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-brand-dark focus-within:border-brand-dark bg-white flex items-center justify-between cursor-text"
              >
                <div className="flex items-center flex-1 gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Digite para buscar um cliente..."
                    value={dropdownAberto ? buscaCliente : (clienteSelecionado?.nome || '')}
                    onChange={(e) => {
                      setBuscaCliente(e.target.value);
                      setDropdownAberto(true);
                      if (clienteSelecionado) setClienteSelecionado(null);
                    }}
                    onFocus={() => setDropdownAberto(true)}
                    className="w-full bg-transparent outline-none text-brand-dark placeholder:text-gray-400"
                  />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </div>

              {/* Dropdown de Clientes */}
              {dropdownAberto && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {clientesFiltrados.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Nenhum cliente encontrado.</div>
                  ) : (
                    clientesFiltrados.map(cliente => (
                      <div 
                        key={cliente.id}
                        onClick={() => {
                          setClienteSelecionado(cliente);
                          setBuscaCliente('');
                          setDropdownAberto(false);
                        }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                      >
                        <span className="text-brand-dark group-hover:text-brand-light transition-colors">{cliente.nome}</span>
                        {clienteSelecionado?.id === cliente.id && <Check className="w-4 h-4 text-brand-green" />}
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {clientes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Você precisa cadastrar um cliente primeiro.</p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">Título do Projeto *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                required
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark bg-white"
                placeholder="Ex: Sistema Residencial João - 5kWp"
              />
            </div>

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Dados Iniciais (Opcional)
              </h3>
            </div>

            <div>
              <label htmlFor="potencia_kwp" className="block text-sm font-medium text-gray-700 mb-1">Potência Estimada (kWp)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  id="potencia_kwp"
                  name="potencia_kwp"
                  value={formData.potencia_kwp}
                  onChange={handleChange}
                  className="w-full pl-4 pr-12 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark bg-white"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">kWp</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading || clientes.length === 0}
            className="inline-flex items-center gap-2 bg-brand-dark text-white px-6 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            Criar Projeto
          </button>
        </div>
      </form>
    </div>
  );
}
