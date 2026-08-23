import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profissional } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Search, MapPin, Phone, Camera, Globe, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const ITENS_POR_PAGINA = 20;

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ESPECIALIDADES = [
  'Engenheiro Eletricista',
  'Engenheiro Civil',
  'Instalador Solar',
  'Projetista',
  'Vendedor / Comercial',
  'Consultor',
  'Integrador',
  'Outros'
];

export function Profissionais() {
  const { user } = useAuth();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controle do modal de termos
  const [showTermosModal, setShowTermosModal] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Voltar para a página 1 sempre que os filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroEstado, filtroEspecialidade]);

  useEffect(() => {
    // Verifica se já aceitou os termos no localStorage
    const hasAccepted = localStorage.getItem('termos_conexoes_aceito');
    if (!hasAccepted) {
      setShowTermosModal(true);
    }
    fetchProfissionais();
  }, []);

  const handleAceitarTermos = () => {
    localStorage.setItem('termos_conexoes_aceito', 'true');
    setShowTermosModal(false);
  };

  async function fetchProfissionais() {
    setLoading(true);
    const { data } = await supabase
      .from('profissionais')
      .select('id, usuario_id, nome, especialidade, telefone, foto_url, instagram_url, site_url, estado, cidade, criado_em, apresentacao')
      .eq('status_aprovacao', 'aprovado')
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
    const matchEspecialidade = filtroEspecialidade === '' || p.especialidade === filtroEspecialidade;
    return matchBusca && matchEstado && matchEspecialidade;
  });

  const totalPaginas = Math.ceil(profissionaisFiltrados.length / ITENS_POR_PAGINA);
  const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const profissionaisPaginados = profissionaisFiltrados.slice(startIndex, startIndex + ITENS_POR_PAGINA);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24">
      {/* MODAL DE TERMOS DE ISENÇÃO */}
      {showTermosModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-gray-200 relative">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-red-50 text-red-700">
              <ShieldCheck className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-xl font-bold">Aviso Importante</h2>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[30vh] space-y-4 text-gray-700 text-sm leading-relaxed">
              <p>
                O <strong>O Método Sol</strong> atua unicamente como uma vitrine de conexões para facilitar o contato entre profissionais do setor de energia solar e potenciais parceiros.
              </p>
              <p>
                Declaramos que <strong>não nos responsabilizamos</strong> por quaisquer serviços prestados, contratos fechados, garantias, atrasos ou problemas decorrentes das negociações feitas com os profissionais listados nesta página.
              </p>
              <p>
                É de total responsabilidade do contratante analisar o perfil, solicitar documentações e validar a competência técnica do profissional antes de fechar qualquer negócio.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-dark focus:ring-brand-dark cursor-pointer"
                />
                <span className="text-sm text-gray-800 font-medium group-hover:text-black transition-colors">
                  Li e concordo com os termos de isenção de responsabilidade.
                </span>
              </label>
              
              <button 
                onClick={handleAceitarTermos}
                disabled={!aceitouTermos}
                className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-green hover:text-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Acessar Rede de Conexões
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        <div className="w-full md:w-48">
          <select
            value={filtroEspecialidade}
            onChange={(e) => setFiltroEspecialidade(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50 cursor-pointer text-sm"
          >
            <option value="">Todas Especialidades</option>
            {ESPECIALIDADES.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-48">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark bg-gray-50 cursor-pointer text-sm"
          >
            <option value="">Todos Estados</option>
            {ESTADOS_BR.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Profissionais */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        </div>
      ) : profissionaisFiltrados.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            {profissionaisPaginados.map((prof) => (
              <div key={prof.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                
                {/* Esquerda: Foto redonda */}
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 relative rounded-full overflow-hidden border-4 border-gray-50 shadow-sm bg-gray-100">
                  {prof.foto_url ? (
                    <img src={prof.foto_url} alt={prof.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Briefcase className="w-10 h-10 md:w-12 md:h-12" />
                    </div>
                  )}
                </div>
                
                {/* Meio: Dados e Bio */}
                <div className="flex-1 flex flex-col w-full text-center md:text-left">
                  <h3 className="font-bold text-xl text-brand-dark mb-1">{prof.nome}</h3>
                  <p className="text-brand-green font-semibold text-sm mb-3">{prof.especialidade}</p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="truncate">{prof.cidade} - {prof.estado}</span>
                  </div>
                  
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100/50 relative group">
                    <p className="text-gray-600 text-sm leading-relaxed italic text-left">
                      "{prof.apresentacao 
                        ? prof.apresentacao
                        : 'Este profissional ainda não adicionou um texto de apresentação ao seu perfil público.'}"
                    </p>
                  </div>
                </div>

                {/* Direita: Botões */}
                <div className="flex flex-row md:flex-col items-center justify-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 shrink-0">
                  <a 
                    href={formatarWhatsApp(prof.telefone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:w-full flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a] px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-sm shadow-[#25D366]/20"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </a>
                  
                  <div className="flex gap-3 md:w-full">
                    {prof.instagram_url && (
                      <a
                        href={prof.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center h-12 bg-gray-50 text-pink-600 border border-gray-100 hover:bg-pink-50 hover:border-pink-200 rounded-xl transition-colors"
                        title="Instagram"
                      >
                        <Camera className="w-5 h-5" />
                      </a>
                    )}
                    
                    {prof.site_url && (
                      <a
                        href={prof.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center h-12 bg-gray-50 text-blue-600 border border-gray-100 hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-colors"
                        title="Site"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                  <button
                    key={pagina}
                    onClick={() => setPaginaAtual(pagina)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                      pagina === paginaAtual
                        ? 'bg-brand-dark text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {pagina}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
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
