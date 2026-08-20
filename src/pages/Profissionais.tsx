import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profissional } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Search, MapPin, Phone, Plus, X } from 'lucide-react';

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
  
  // Modal de Cadastro
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    telefone: '',
    estado: '',
    cidade: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setFormLoading(true);
    
    const { error } = await supabase
      .from('profissionais')
      .insert([
        {
          usuario_id: user.id,
          nome: formData.nome,
          especialidade: formData.especialidade,
          telefone: formData.telefone,
          estado: formData.estado,
          cidade: formData.cidade
        }
      ]);

    if (!error) {
      setShowModal(false);
      setFormData({ nome: '', especialidade: '', telefone: '', estado: '', cidade: '' });
      fetchProfissionais();
    } else {
      alert('Erro ao cadastrar profissional. Verifique se você executou o SQL no Supabase.');
    }
    
    setFormLoading(false);
  };

  const formatarWhatsApp = (telefone: string) => {
    // Remove tudo que não for número
    const apenasNumeros = telefone.replace(/\D/g, '');
    if (apenasNumeros.length >= 10) {
      return `https://wa.me/55${apenasNumeros}`;
    }
    return '#';
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
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-dark text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-green hover:text-brand-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Cadastrar Profissional
        </button>
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
              <div className="h-2 bg-brand-green w-full"></div>
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
                  
                  <a 
                    href={formatarWhatsApp(prof.telefone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full mt-4 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Chamar no WhatsApp
                  </a>
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

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-brand-dark">Cadastrar Profissional</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="prof-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo ou Empresa</label>
                  <input
                    required
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50"
                    placeholder="Ex: João Silva Soluções"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                  <input
                    required
                    type="text"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({...formData, especialidade: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50"
                    placeholder="Ex: Engenheiro Eletricista, Instalador Solar..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp de Contato</label>
                  <input
                    required
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50"
                    placeholder="Ex: (11) 99999-9999"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                    <select
                      required
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50"
                    >
                      <option value="">Selecione</option>
                      {ESTADOS_BR.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      required
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50"
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="prof-form"
                disabled={formLoading}
                className="px-5 py-2.5 bg-brand-dark text-brand-green font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {formLoading ? 'Salvando...' : 'Cadastrar na Rede'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
