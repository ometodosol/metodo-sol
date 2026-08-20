import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Projeto } from '../types';
import { ArrowLeft, Save, Zap, User, FileText, Component, ShoppingCart, Copy, Check } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

interface ProjetoComCliente extends Projeto {
  clientes: {
    id: string;
    nome: string;
  };
}

export function ProjetoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [copiado, setCopiado] = useState(false);
  
  const [projeto, setProjeto] = useState<ProjetoComCliente | null>(null);

  useEffect(() => {
    async function fetchProjeto() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('projetos')
        .select('*, clientes(id, nome)')
        .eq('id', id)
        .single();
        
      if (data && !error) {
        setProjeto(data as any);
      }
      setLoading(false);
    }
    fetchProjeto();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!projeto) return;
    setProjeto({ ...projeto, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projeto) return;
    
    setSaving(true);
    setMensagem({ texto: '', tipo: '' });

    const { error } = await supabase
      .from('projetos')
      .update({
        titulo: projeto.titulo,
        status: projeto.status,
        potencia_kwp: projeto.potencia_kwp ? parseFloat(projeto.potencia_kwp.toString()) : null,
        inversor_modelo: projeto.inversor_modelo,
        modulos_modelo: projeto.modulos_modelo,
        modulos_quantidade: projeto.modulos_quantidade ? parseInt(projeto.modulos_quantidade.toString()) : null,
      })
      .eq('id', projeto.id);

    setSaving(false);

    if (error) {
      setMensagem({ texto: 'Erro ao salvar: ' + error.message, tipo: 'error' });
    } else {
      setMensagem({ texto: 'Projeto atualizado com sucesso!', tipo: 'success' });
    }
  };

  const copiarLista = () => {
    if (!projeto?.dimensionamento) return;
    const res = projeto.dimensionamento;
    const texto = `LISTA DE MATERIAIS - ${projeto.titulo}

SISTEMA: ${res.tipoSistema === 'ongrid' ? 'On-Grid' : res.tipoSistema === 'offgrid' ? 'Off-Grid' : 'Híbrido'}
POTÊNCIA: ${res.potTotalKwp} kWp
ÁREA: ${res.areaTotal} m²

EQUIPAMENTOS:
- ${res.numPlacas}x Módulos Solares ${res.nomePlaca} (${res.potPlacaW}W)
- 1x ${res.nomeInversor} (~${res.inversorSugeridoKwp} kW)
${res.precisaBateria ? '- Banco de Baterias (A dimensionar)\n' : ''}- ${res.numPlacas}x Kits de Fixação

CABEAMENTO CC:
- ${res.caboCCPreto}m Cabo Solar CC Preto
- ${res.caboCCVermelho}m Cabo Solar CC Vermelho
- ${res.caboTerraCC}m Cabo Aterramento CC (Verde/Amarelo)
- ${res.mc4Pares} pares Conector MC4
- 1x String Box CC

CABEAMENTO CA:
- ${res.caboCA}m ${res.descricaoCaboCA}
- ${res.caboTerraCA}m Cabo Aterramento CA (Verde/Amarelo)
- 1x ${res.nomeQuadroCA} (Disjuntor ${res.tipoDisjuntor} ${res.disjuntorCA}A + DPS)
`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="p-10 text-center text-gray-500">Projeto não encontrado.</div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/projetos')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-dark line-clamp-1">{projeto.titulo}</h1>
              <StatusBadge 
                status={
                  projeto.status === 'levantamento' ? 'warning' :
                  projeto.status === 'contrato' ? 'info' :
                  projeto.status === 'instalacao' ? 'info' : 'success'
                } 
                label={projeto.status} 
              />
            </div>
            <div 
              onClick={() => navigate(`/clientes/${projeto.clientes.id}`)}
              className="inline-flex items-center gap-1.5 text-gray-500 mt-1 hover:text-brand-dark cursor-pointer transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{projeto.clientes.nome}</span>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        {mensagem.texto && (
          <div className={`p-4 rounded-lg text-sm ${mensagem.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {mensagem.texto}
          </div>
        )}

        {/* Status e Título */}
        <div>
          <h3 className="font-semibold text-lg text-brand-dark border-b pb-2 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informações Gerais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do Projeto</label>
              <input
                type="text"
                name="titulo"
                required
                value={projeto.titulo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fase (Status)</label>
              <select
                name="status"
                value={projeto.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark bg-white"
              >
                <option value="levantamento">Levantamento</option>
                <option value="contrato">Em Contrato</option>
                <option value="instalacao">Em Instalação</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dimensionamento e Equipamentos */}
        <div>
          <h3 className="font-semibold text-lg text-brand-dark border-b pb-2 mb-4 flex items-center gap-2">
            <Component className="w-5 h-5" />
            Dimensionamento Técnico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Potência Final (kWp)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Zap className="h-4 w-4 text-brand-green" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  name="potencia_kwp"
                  value={projeto.potencia_kwp || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">kWp</span>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo do Inversor/Microinversor</label>
              <input
                type="text"
                name="inversor_modelo"
                value={projeto.inversor_modelo || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                placeholder="Ex: Deye 5kW, Hoymiles HMS-2000"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo dos Módulos (Placas)</label>
              <input
                type="text"
                name="modulos_modelo"
                value={projeto.modulos_modelo || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                placeholder="Ex: Canadian 550W, Jinko 570W"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. de Módulos</label>
              <input
                type="number"
                name="modulos_quantidade"
                value={projeto.modulos_quantidade || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                placeholder="0"
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
            {saving ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Projeto</>}
          </button>
        </div>
      </form>

      {projeto.dimensionamento && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-400" />
              Lista de Materiais Salva
            </h3>
            <button 
              onClick={copiarLista}
              className="text-sm font-bold text-brand-dark bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {copiado ? <><Check className="w-4 h-4 text-brand-green" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Lista</>}
            </button>
          </div>
          
          <ul className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
            <li className="p-4 flex items-center justify-between hover:bg-white transition-colors bg-white/50">
              <div>
                <span className="font-semibold text-brand-dark block">Módulos Solares {projeto.dimensionamento.nomePlaca}</span>
                <span className="text-sm text-gray-500">{projeto.dimensionamento.potPlacaW}W por placa</span>
              </div>
              <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{projeto.dimensionamento.numPlacas} un</span>
            </li>
            <li className="p-4 flex items-center justify-between hover:bg-white transition-colors bg-white/50">
              <div>
                <span className="font-semibold text-brand-dark block">{projeto.dimensionamento.nomeInversor}</span>
                <span className="text-sm text-gray-500">Potência recomendada aprox. {projeto.dimensionamento.inversorSugeridoKwp} kW</span>
              </div>
              <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">1 un</span>
            </li>
            {projeto.dimensionamento.precisaBateria && (
              <li className="p-4 flex items-center justify-between bg-blue-50/50 hover:bg-blue-50 transition-colors">
                <div>
                  <span className="font-semibold text-blue-900 block">Banco de Baterias</span>
                  <span className="text-sm text-blue-700">A dimensionar conforme autonomia desejada pelo cliente</span>
                </div>
                <span className="bg-blue-600 text-white font-bold py-1 px-3 rounded-full">A definir</span>
              </li>
            )}
            <li className="p-4 flex items-center justify-between hover:bg-white transition-colors bg-white/50">
                <div>
                  <span className="font-semibold text-brand-dark block">Kits de Fixação</span>
                  <span className="text-sm text-gray-500">Trilhos e suportes baseados em {projeto.dimensionamento.numPlacas} placas</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{projeto.dimensionamento.numPlacas} un</span>
              </li>

              {/* Lado CC */}
              <li className="px-4 py-2 bg-gray-100 border-y border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cabeamento Lado CC (Módulos ➡️ Inversor)</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <span className="font-semibold text-brand-dark block">Cabo Solar CC Preto (Negativo)</span>
                  <span className="text-sm text-gray-500">Já inclui 15% de folga</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{projeto.dimensionamento.caboCCPreto} m</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <span className="font-semibold text-brand-dark block">Cabo Solar CC Vermelho (Positivo)</span>
                  <span className="text-sm text-gray-500">Já inclui 15% de folga</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{projeto.dimensionamento.caboCCVermelho} m</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <span className="font-semibold text-brand-dark block">Cabo de Aterramento (Verde/Amarelo)</span>
                  <span className="text-sm text-gray-500">Aterramento da estrutura dos módulos ao inversor</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{projeto.dimensionamento.caboTerraCC} m</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <span className="font-semibold text-brand-dark block">Conectores MC4</span>
                  <span className="text-sm text-gray-500">Pares macho/fêmea necessários</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{projeto.dimensionamento.mc4Pares} pares</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <span className="font-semibold text-brand-dark block">String Box CC</span>
                  <span className="text-sm text-gray-500">Com chaves/disjuntores CC e DPS CC</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">1 un</span>
              </li>

              {/* Lado CA */}
              <li className="px-4 py-2 bg-gray-100 border-y border-gray-200 mt-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cabeamento Lado CA (Inversor ➡️ Padrão/Quadro)</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <span className="font-semibold text-brand-dark block">{projeto.dimensionamento.descricaoCaboCA}</span>
                  <span className="text-sm text-gray-500">Já inclui 15% de folga</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{projeto.dimensionamento.caboCA} m</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <span className="font-semibold text-brand-dark block">Cabo de Aterramento (Verde/Amarelo)</span>
                  <span className="text-sm text-gray-500">Aterramento do inversor ao quadro</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">{projeto.dimensionamento.caboTerraCA} m</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <span className="font-semibold text-brand-dark block">{projeto.dimensionamento.nomeQuadroCA}</span>
                  <span className="text-sm text-gray-500">Disjuntor {projeto.dimensionamento.tipoDisjuntor} de {projeto.dimensionamento.disjuntorCA}A + DPS CA</span>
                </div>
                <span className="bg-brand-dark text-white font-bold py-1 px-3 rounded-full">1 un</span>
              </li>
          </ul>
        </div>
      )}
    </div>
  );
}
