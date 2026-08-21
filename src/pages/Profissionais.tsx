import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profissional } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Search, MapPin, Phone, Plus, X, Camera, Globe } from 'lucide-react';

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function Profissionais() {
  const { user } = useAuth();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    fetchProfissionais();
  }, []);

  async function fetchProfissionais() {
    setLoading(true);
    const { data } = await supabase
      .from('profissionais')
      .select('*')
      .order('criado_em', { ascending: false });

    if (data) {
      setProfissionais(data as Profissional[]);
    }
    setLoading(false);
  }

  const formatarWhatsApp = (telefone: string) => {
    const apenasNumeros = telefone.replace(/\D/g, '');
    if (!apenasNumeros) return '#';
    if (apenasNumeros.startsWith('55') && apenasNumeros.length >= 12) {
      return `https://wa.me/${apenasNumeros}`;
    }
    return `https://wa.me/55${apenasNumeros}`;
  };

  const profissionaisFiltrados = profissionais.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       p.especialidade.toLowerCase().includes(busca.toLowerCase()) ||
                       p.cidade.toLowerCase().includes(busca.toLowerCase());
    const matchEstado = filtroEstado === '' || p.estado === filtroEstado;
    return matchBusca && matchEstado;
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-brand-green" />
            Conexões
          </h1>
          <p className="text-gray-500 mt-2">
            Encontre parceiros, engenheiros e instaladores em todo o Brasil.
          </p>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50"
            placeholder="Buscar por nome, especialidade ou cidade..."
          />
        </div>
        
        <div className="w-full md:w-64">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50 cursor-pointer"
          >
            <option value="">Todos os Estados</option>
            {ESTADOS_BR.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Profissionais */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        </div>
      ) : profissionaisFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profissionaisFiltrados.map((prof) => (
            <div key={prof.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
              <div className="h-40 w-full bg-gray-100 relative overflow-hidden flex-shrink-0">
                {prof.foto_url ? (
                  <img src={prof.foto_url} alt={prof.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Briefcase className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-green"></div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-brand-dark line-clamp-1 group-hover:text-brand-green transition-colors">
                  {prof.nome}
                </h3>
                <p className="text-brand-dark/70 font-medium text-sm mt-1 mb-4">
                  {prof.especialidade}
                </p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="truncate">{prof.cidade} - {prof.estado}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <a 
                      href={formatarWhatsApp(prof.telefone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      WhatsApp
                    </a>
                    
                    {prof.instagram_url && (
                      <a
                        href={prof.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white rounded-xl transition-colors"
                        title="Instagram"
                      >
                        <Camera className="w-4 h-4" />
                      </a>
                    )}
                    
                    {prof.site_url && (
                      <a
                        href={prof.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors"
                        title="Site"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400">Nenhum profissional encontrado</h3>
          <p className="text-gray-400 mt-2">Tente buscar por outras palavras ou cadastre um novo.</p>
        </div>
      )}
    </div>
  );
}
