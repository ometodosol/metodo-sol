import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Cliente } from '../types';
import { Plus, Search, Users, MapPin, Phone } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientes() {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (!error && data) {
        setClientes(data);
      }
      setLoading(false);
    }
    
    fetchClientes();
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Meus Clientes</h1>
          <p className="text-gray-500 mt-1">Gestão de contatos e prontuários.</p>
        </div>
        <button 
          onClick={() => navigate('/clientes/novo')}
          className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </header>

      {/* Busca */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark bg-white"
          placeholder="Buscar cliente por nome..."
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
        </div>
      ) : clientes.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-brand-dark">Nenhum cliente cadastrado</h3>
          <p className="text-gray-500 max-w-sm mt-1 mb-6">
            Você ainda não possui clientes. Comece adicionando o seu primeiro contato para gerenciar os projetos fotovoltaicos.
          </p>
          <button 
            onClick={() => navigate('/clientes/novo')}
            className="inline-flex items-center justify-center gap-2 bg-brand-green text-brand-dark px-4 py-2.5 rounded-lg hover:bg-brand-green/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map((cliente) => (
            <div 
              key={cliente.id} 
              onClick={() => navigate(`/clientes/${cliente.id}`)}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-brand-dark text-lg group-hover:text-brand-light transition-colors line-clamp-1">{cliente.nome}</h3>
                </div>
                <StatusBadge status="success" label="Ativo" />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {cliente.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {cliente.telefone}
                  </div>
                )}
                {cliente.endereco && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{cliente.endereco}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
