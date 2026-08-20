import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Cliente } from '../types';
import { ArrowLeft, Save, Zap } from 'lucide-react';

export function NovoProjeto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    titulo: '',
    potencia_kwp: '',
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('projetos').insert([
      {
        cliente_id: formData.cliente_id,
        titulo: formData.titulo,
        potencia_kwp: formData.potencia_kwp ? parseFloat(formData.potencia_kwp) : null,
        status: 'levantamento',
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Erro ao criar projeto: ' + error.message);
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
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <select
                id="cliente_id"
                name="cliente_id"
                required
                value={formData.cliente_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark bg-white"
              >
                <option value="" disabled>Selecione um cliente...</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
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
