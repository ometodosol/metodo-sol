import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Image as ImageIcon, Bell, Briefcase, GraduationCap, 
  Plus, Save, Trash2, Loader2, Edit2, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profissional } from '../../types';

type Tab = 'banners' | 'notificacoes' | 'aulas' | 'profissionais';

// Interfaces
interface Banner {
  id: string;
  local: string;
  imagem_url: string;
  titulo: string;
  texto: string;
  ativo: boolean;
  botao_texto?: string;
  botao_link?: string;
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  ativa: boolean;
  criado_em: string;
}

interface AcademySlide {
  id: string;
  titulo: string;
  texto: string;
  imagem_url: string;
  link_url: string;
  ativo: boolean;
}

interface AcademyModulo {
  id: string;
  titulo: string;
  imagem_url: string;
  badge: string;
  link_url: string;
  ordem: number;
}

interface AcademyNovidade {
  id: string;
  titulo: string;
  imagem_url: string;
  link_url: string;
  ordem: number;
}

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

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('banners');
  
  // Temporariamente liberado para visualização
  const isAdmin = true;

  // Estados dos Dados
  const [banners, setBanners] = useState<Banner[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  
  // Academy Data
  const [academySlides, setAcademySlides] = useState<AcademySlide[]>([]);
  const [academyModulos, setAcademyModulos] = useState<AcademyModulo[]>([]);
  const [academyNovidades, setAcademyNovidades] = useState<AcademyNovidade[]>([]);
  
  // Estados de Carregamento
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);
  const [loadingProfissionais, setLoadingProfissionais] = useState(false);
  const [loadingAcademy, setLoadingAcademy] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulário Notificações
  const [notifForm, setNotifForm] = useState({ titulo: '', mensagem: '' });
  
  // Modal de Profissionais
  const [showProfModal, setShowProfModal] = useState(false);
  const [editingProfId, setEditingProfId] = useState<string | null>(null);
  const [profForm, setProfForm] = useState({
    nome: '',
    especialidade: '',
    telefone: '',
    estado: '',
    cidade: '',
    foto_url: '',
    instagram_url: '',
    site_url: '',
    nome_completo: '',
    endereco_residencia: '',
    cpf: '',
    rg: '',
    cnh: '',
    crea: '',
    foto_documento_url: '',
    foto_segurando_documento_url: ''
  });

  useEffect(() => {
    if (activeTab === 'banners') fetchBanners();
    if (activeTab === 'notificacoes') fetchNotificacoes();
    if (activeTab === 'profissionais') fetchProfissionais();
    if (activeTab === 'aulas') fetchAcademyData();
  }, [activeTab]);

  const fetchBanners = async () => {
    setLoadingBanners(true);
    const { data, error } = await supabase.from('banners').select('*').order('id', { ascending: false });
    if (error) console.error("Erro ao buscar banners:", error);
    if (!error && data) setBanners(data);
    setLoadingBanners(false);
  };

  const fetchNotificacoes = async () => {
    setLoadingNotificacoes(true);
    const { data, error } = await supabase.from('notificacoes').select('*').order('criado_em', { ascending: false });
    if (!error && data) setNotificacoes(data);
    setLoadingNotificacoes(false);
  };

  const fetchProfissionais = async () => {
    setLoadingProfissionais(true);
    const { data, error } = await supabase.from('profissionais').select('*').order('criado_em', { ascending: false });
    if (!error && data) setProfissionais(data as Profissional[]);
    setLoadingProfissionais(false);
  };

  const fetchAcademyData = async () => {
    setLoadingAcademy(true);
    const [slidesRes, modulosRes, novidadesRes] = await Promise.all([
      supabase.from('academy_slides').select('*').order('criado_em', { ascending: false }),
      supabase.from('academy_modulos').select('*').order('ordem', { ascending: true }),
      supabase.from('academy_novidades').select('*').order('ordem', { ascending: true })
    ]);
    
    if (!slidesRes.error && slidesRes.data) setAcademySlides(slidesRes.data);
    if (!modulosRes.error && modulosRes.data) setAcademyModulos(modulosRes.data);
    if (!novidadesRes.error && novidadesRes.data) setAcademyNovidades(novidadesRes.data);
    setLoadingAcademy(false);
  };

  // Funções de Banners
  const handleAddBanner = async (local: 'login' | 'dashboard') => {
    if (!user) return;
    const newBanner = { local, imagem_url: '', titulo: '', texto: '', ativo: true, usuario_id: user.id };
    const { data, error } = await supabase.from('banners').insert([newBanner]).select();
    if (error) console.error("Erro ao criar banner:", error);
    if (!error && data) setBanners([data[0], ...banners]);
  };

  const handleLocalBannerChange = (id: string, updates: Partial<Banner>) => {
    setBanners(banners.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleSaveBanner = async (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    setSaving(true);
    const { error } = await supabase.from('banners').update({
       imagem_url: banner.imagem_url,
       titulo: banner.titulo,
       texto: banner.texto,
       ativo: banner.ativo,
       botao_texto: banner.botao_texto,
       botao_link: banner.botao_link
    }).eq('id', id);
    if (error) {
      console.error(error);
      alert('Erro ao salvar banner.');
    } else {
      alert('Banner salvo com sucesso!');
    }
    setSaving(false);
  };

  const handleUpdateBanner = async (id: string, updates: Partial<Banner>) => {
    setSaving(true);
    const { error } = await supabase.from('banners').update(updates).eq('id', id);
    if (!error) {
      setBanners(banners.map(b => b.id === id ? { ...b, ...updates } : b));
    } else {
      alert('Erro ao atualizar banner.');
    }
    setSaving(false);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;
    setSaving(true);
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (!error) setBanners(banners.filter(b => b.id !== id));
    setSaving(false);
  };

  // Funções de Notificações
  const handleSendNotificacao = async () => {
    if (!notifForm.titulo || !notifForm.mensagem) return alert('Preencha título e mensagem.');
    if (!user) return;
    setSaving(true);
    const payload = { ...notifForm, usuario_id: user.id };
    const { data, error } = await supabase.from('notificacoes').insert([payload]).select();
    if (!error && data) {
      setNotificacoes([data[0], ...notificacoes]);
      setNotifForm({ titulo: '', mensagem: '' });
    } else {
      console.error("Erro ao enviar notificacao:", error);
      alert('Erro ao enviar notificação.');
    }
    setSaving(false);
  };

  const handleDeleteNotificacao = async (id: string) => {
    if (!window.confirm('Excluir notificação? Ela sumirá para todos os usuários.')) return;
    setSaving(true);
    const { error } = await supabase.from('notificacoes').delete().eq('id', id);
    if (!error) setNotificacoes(notificacoes.filter(n => n.id !== id));
    setSaving(false);
  };

  // Funções de Academy
  const handleAddAcademySlide = async () => {
    setSaving(true);
    const newItem = { titulo: 'Novo Banner', texto: '', imagem_url: '', link_url: '', ativo: true };
    const { data, error } = await supabase.from('academy_slides').insert([newItem]).select();
    if (!error && data) {
      setAcademySlides([data[0] as AcademySlide, ...academySlides]);
    } else {
      console.error(error);
      alert(`Erro ao criar slide: ${error?.message || 'Erro desconhecido'}`);
    }
    setSaving(false);
  };

  const handleLocalUpdateAcademySlide = (id: string, field: string, value: any) => {
    setAcademySlides(academySlides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSaveAcademySlide = async (slide: AcademySlide) => {
    setSaving(true);
    const { id, criado_em, ...updates } = slide as any;
    const { error } = await supabase.from('academy_slides').update(updates).eq('id', slide.id);
    if (!error) {
      alert('Slide salvo com sucesso!');
    } else {
      console.error(error);
      alert(`Erro ao salvar slide: ${error?.message || 'Erro desconhecido'}`);
    }
    setSaving(false);
  };

  const handleDeleteAcademySlide = async (id: string) => {
    if (!window.confirm('Excluir este slide?')) return;
    setSaving(true);
    const { error } = await supabase.from('academy_slides').delete().eq('id', id);
    if (!error) setAcademySlides(academySlides.filter(s => s.id !== id));
    setSaving(false);
  };

  const handleAddAcademyModulo = async () => {
    setSaving(true);
    const newItem = { titulo: 'Novo Módulo', badge: '', imagem_url: '', link_url: '', ordem: academyModulos.length };
    const { data, error } = await supabase.from('academy_modulos').insert([newItem]).select();
    if (!error && data) {
      setAcademyModulos([...academyModulos, data[0] as AcademyModulo]);
    } else {
      console.error(error);
      alert(`Erro ao criar módulo: ${error?.message || 'Erro desconhecido'}`);
    }
    setSaving(false);
  };

  const handleLocalUpdateAcademyModulo = (id: string, field: string, value: any) => {
    setAcademyModulos(academyModulos.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSaveAcademyModulo = async (modulo: AcademyModulo) => {
    setSaving(true);
    const { id, criado_em, ...updates } = modulo as any;
    const { error } = await supabase.from('academy_modulos').update(updates).eq('id', modulo.id);
    if (!error) {
      alert('Módulo salvo com sucesso!');
    } else {
      console.error(error);
      alert(`Erro ao salvar módulo: ${error?.message || 'Erro desconhecido'}`);
    }
    setSaving(false);
  };

  const handleDeleteAcademyModulo = async (id: string) => {
    if (!window.confirm('Excluir este módulo?')) return;
    setSaving(true);
    const { error } = await supabase.from('academy_modulos').delete().eq('id', id);
    if (!error) setAcademyModulos(academyModulos.filter(m => m.id !== id));
    setSaving(false);
  };

  const handleAddAcademyNovidade = async () => {
    setSaving(true);
    const newItem = { titulo: 'Nova Aula', imagem_url: '', link_url: '', ordem: academyNovidades.length };
    const { data, error } = await supabase.from('academy_novidades').insert([newItem]).select();
    if (!error && data) {
      setAcademyNovidades([...academyNovidades, data[0] as AcademyNovidade]);
    } else {
      console.error(error);
      alert(`Erro ao criar novidade: ${error?.message || 'Erro desconhecido'}`);
    }
    setSaving(false);
  };

  const handleLocalUpdateAcademyNovidade = (id: string, field: string, value: any) => {
    setAcademyNovidades(academyNovidades.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const handleSaveAcademyNovidade = async (novidade: AcademyNovidade) => {
    setSaving(true);
    const { id, criado_em, ...updates } = novidade as any;
    const { error } = await supabase.from('academy_novidades').update(updates).eq('id', novidade.id);
    if (!error) {
      alert('Novidade salva com sucesso!');
    } else {
      console.error(error);
      alert(`Erro ao salvar novidade: ${error?.message || 'Erro desconhecido'}`);
    }
    setSaving(false);
  };

  const handleDeleteAcademyNovidade = async (id: string) => {
    if (!window.confirm('Excluir esta novidade?')) return;
    setSaving(true);
    const { error } = await supabase.from('academy_novidades').delete().eq('id', id);
    if (!error) setAcademyNovidades(academyNovidades.filter(n => n.id !== id));
    setSaving(false);
  };

  // Funções de Profissionais
  const openProfModal = (prof?: Profissional & { foto_url?: string }) => {
    if (prof) {
      setEditingProfId(prof.id);
      setProfForm({
        nome: prof.nome,
        especialidade: prof.especialidade,
        telefone: prof.telefone,
        estado: prof.estado,
        cidade: prof.cidade,
        foto_url: prof.foto_url || '',
        instagram_url: prof.instagram_url || '',
        site_url: prof.site_url || '',
        nome_completo: prof.nome_completo || '',
        endereco_residencia: prof.endereco_residencia || '',
        cpf: prof.cpf || '',
        rg: prof.rg || '',
        cnh: prof.cnh || '',
        crea: prof.crea || '',
        foto_documento_url: prof.foto_documento_url || '',
        foto_segurando_documento_url: prof.foto_segurando_documento_url || ''
      });
    } else {
      setEditingProfId(null);
      setProfForm({ 
        nome: '', especialidade: '', telefone: '', estado: '', cidade: '', foto_url: '', instagram_url: '', site_url: '',
        nome_completo: '', endereco_residencia: '', cpf: '', rg: '', cnh: '', crea: '', foto_documento_url: '', foto_segurando_documento_url: ''
      });
    }
    setShowProfModal(true);
  };

  const handleSaveProfissional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    if (editingProfId) {
      const { error } = await supabase.from('profissionais').update(profForm).eq('id', editingProfId);
      if (!error) {
        setProfissionais(profissionais.map(p => p.id === editingProfId ? { ...p, ...profForm } : p));
        setShowProfModal(false);
      } else {
        alert('Erro ao atualizar profissional.');
      }
    } else {
      const payload = { ...profForm, usuario_id: user.id };
      const { data, error } = await supabase.from('profissionais').insert([payload]).select();
      if (!error && data) {
        setProfissionais([data[0] as Profissional, ...profissionais]);
        setShowProfModal(false);
      } else {
        alert('Erro ao criar profissional.');
      }
    }
    setSaving(false);
  };

  const handleDeleteProfissional = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este profissional?')) return;
    setSaving(true);
    const { error } = await supabase.from('profissionais').delete().eq('id', id);
    if (!error) setProfissionais(profissionais.filter(p => p.id !== id));
    setSaving(false);
  };

  const handleAprovarProfissional = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('profissionais').update({ status_aprovacao: 'aprovado' }).eq('id', id);
    if (!error) {
      setProfissionais(profissionais.map(p => p.id === id ? { ...p, status_aprovacao: 'aprovado' } : p));
    } else {
      console.error('Supabase update error:', error);
      alert('Erro ao aprovar profissional.');
    }
    setSaving(false);
  };

  const handleReprovarProfissional = async (id: string, nome: string) => {
    setSaving(true);
    const { error } = await supabase.from('profissionais').update({ status_aprovacao: 'reprovado' }).eq('id', id);
    if (!error) {
      setProfissionais(profissionais.map(p => p.id === id ? { ...p, status_aprovacao: 'reprovado' } : p));
      
      const emailSubject = encodeURIComponent('Atualização do seu cadastro - O Método Sol');
      const emailBody = encodeURIComponent(`Olá ${nome},\n\nRecebemos o seu cadastro para a plataforma O Método Sol, porém identificamos uma inconsistência nas informações ou fotos enviadas.\n\nPor favor, pedimos que acesse o portal novamente e refaça o seu cadastro com atenção aos dados inseridos e à qualidade da foto segurando o documento.\n\nAtenciosamente,\nEquipe O Método Sol`);
      window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, '_blank');
    } else {
      console.error('Supabase update error:', error);
      alert('Erro ao reprovar profissional.');
    }
    setSaving(false);
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  const loginBanners = banners.filter(b => b.local === 'login');
  const dashBanners = banners.filter(b => b.local === 'dashboard');

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão de conteúdo, banners, aulas e notificações do sistema.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 pb-px hide-scrollbar">
        {(['banners', 'notificacoes', 'aulas', 'profissionais'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-brand-light text-brand-light'
                : 'border-transparent text-gray-500 hover:text-foreground hover:border-gray-300'
            }`}
          >
            {tab === 'banners' && <ImageIcon className="w-4 h-4" />}
            {tab === 'notificacoes' && <Bell className="w-4 h-4" />}
            {tab === 'aulas' && <GraduationCap className="w-4 h-4" />}
            {tab === 'profissionais' && <Briefcase className="w-4 h-4" />}
            {tab === 'aulas' ? 'Academy' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-gray-200">
        
        {/* TAB: BANNERS */}
        {activeTab === 'banners' && (
          <div className="space-y-8">
            {loadingBanners ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
            ) : (
              <>
                {/* LOGIN BANNERS */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">Banners da Tela de Login</h3>
                      <p className="text-sm text-muted-foreground">Imagens exibidas no carrossel esquerdo da tela de login.</p>
                    </div>
                    <button onClick={() => handleAddBanner('login')} className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  </div>
                  <div className="space-y-4">
                    {loginBanners.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum banner cadastrado.</p>}
                    {loginBanners.map(banner => (
                      <div key={banner.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-xl bg-muted/20 items-center">
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">URL da Imagem</label>
                          <input type="text" value={banner.imagem_url || ''} onChange={e => handleLocalBannerChange(banner.id, { imagem_url: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">Título</label>
                          <input type="text" value={banner.titulo || ''} onChange={e => handleLocalBannerChange(banner.id, { titulo: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Ex: Energia Solar" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">Texto</label>
                          <input type="text" value={banner.texto || ''} onChange={e => handleLocalBannerChange(banner.id, { texto: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Descrição do slide" />
                        </div>
                        <div className="md:col-span-6">
                          <label className="text-xs font-semibold text-muted-foreground">Texto do Botão (Opcional)</label>
                          <input type="text" value={banner.botao_texto || ''} onChange={e => handleLocalBannerChange(banner.id, { botao_texto: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Ex: Saiba Mais" />
                        </div>
                        <div className="md:col-span-6">
                          <label className="text-xs font-semibold text-muted-foreground">Link do Botão (Opcional)</label>
                          <input type="text" value={banner.botao_link || ''} onChange={e => handleLocalBannerChange(banner.id, { botao_link: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-12 flex items-end gap-2 justify-end">
                          <button onClick={() => handleUpdateBanner(banner.id, { ativo: !banner.ativo })} className={`px-3 py-2 rounded-lg text-xs font-bold ${banner.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                            {banner.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                          <button onClick={() => handleSaveBanner(banner.id)} className="p-2 bg-brand-dark text-white rounded-lg hover:bg-brand-green hover:text-brand-dark transition-colors" title="Salvar Banner">
                            <Save className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* DASHBOARD BANNERS */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">Banners do Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Imagens que aparecem no topo do painel principal após o login.</p>
                    </div>
                    <button onClick={() => handleAddBanner('dashboard')} className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  </div>
                  <div className="space-y-4">
                    {dashBanners.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum banner cadastrado.</p>}
                    {dashBanners.map(banner => (
                      <div key={banner.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-xl bg-muted/20 items-center">
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">URL da Imagem</label>
                          <input type="text" value={banner.imagem_url || ''} onChange={e => handleLocalBannerChange(banner.id, { imagem_url: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">Título</label>
                          <input type="text" value={banner.titulo || ''} onChange={e => handleLocalBannerChange(banner.id, { titulo: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Ex: Novidade!" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">Texto</label>
                          <input type="text" value={banner.texto || ''} onChange={e => handleLocalBannerChange(banner.id, { texto: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Descrição do banner" />
                        </div>
                        <div className="md:col-span-6">
                          <label className="text-xs font-semibold text-muted-foreground">Texto do Botão (Opcional)</label>
                          <input type="text" value={banner.botao_texto || ''} onChange={e => handleLocalBannerChange(banner.id, { botao_texto: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Ex: Saiba Mais" />
                        </div>
                        <div className="md:col-span-6">
                          <label className="text-xs font-semibold text-muted-foreground">Link do Botão (Opcional)</label>
                          <input type="text" value={banner.botao_link || ''} onChange={e => handleLocalBannerChange(banner.id, { botao_link: e.target.value })} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-12 flex items-end gap-2 justify-end">
                          <button onClick={() => handleUpdateBanner(banner.id, { ativo: !banner.ativo })} className={`px-3 py-2 rounded-lg text-xs font-bold ${banner.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                            {banner.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                          <button onClick={() => handleSaveBanner(banner.id)} className="p-2 bg-brand-dark text-white rounded-lg hover:bg-brand-green hover:text-brand-dark transition-colors" title="Salvar Banner">
                            <Save className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: NOTIFICAÇÕES */}
        {activeTab === 'notificacoes' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-card-foreground mb-4">Disparar Novo Alerta</h2>
              <div className="grid gap-4 bg-muted/30 p-6 rounded-xl border border-gray-200">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Título do Alerta</label>
                  <input type="text" value={notifForm.titulo} onChange={e => setNotifForm({...notifForm, titulo: e.target.value})} className="w-full px-4 py-2 bg-background border border-gray-200 rounded-lg text-card-foreground focus:ring-2 focus:ring-brand-green" placeholder="Ex: Nova atualização disponível" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Mensagem</label>
                  <textarea rows={3} value={notifForm.mensagem} onChange={e => setNotifForm({...notifForm, mensagem: e.target.value})} className="w-full px-4 py-2 bg-background border border-gray-200 rounded-lg text-card-foreground focus:ring-2 focus:ring-brand-green" placeholder="Ex: Confira agora a nova ferramenta de dimensionamento..."></textarea>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSendNotificacao} disabled={saving} className="bg-brand-dark text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />} Disparar Alerta
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4">Notificações Enviadas</h3>
              {loadingNotificacoes ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
              ) : (
                <div className="space-y-3">
                  {notificacoes.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhuma notificação enviada.</p>}
                  {notificacoes.map(notif => (
                    <div key={notif.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl bg-background shadow-sm">
                      <div>
                        <h4 className="font-bold text-card-foreground">{notif.titulo}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notif.mensagem}</p>
                        <span className="text-xs text-gray-400 mt-2 block">{new Date(notif.criado_em).toLocaleString()}</span>
                      </div>
                      <button onClick={() => handleDeleteNotificacao(notif.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: AULAS / ACADEMY */}
        {activeTab === 'aulas' && (
          <div className="space-y-8">
            {loadingAcademy ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
            ) : (
              <>
                {/* ACADEMY SLIDES */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">Banners Principais (Hero)</h3>
                      <p className="text-sm text-muted-foreground">O slide de destaque gigante no topo da página Academy.</p>
                    </div>
                    <button onClick={handleAddAcademySlide} className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Adicionar Slide
                    </button>
                  </div>
                  <div className="space-y-4">
                    {academySlides.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum slide cadastrado.</p>}
                    {academySlides.map(slide => (
                      <div key={slide.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-xl bg-muted/20 items-center">
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">URL da Imagem</label>
                          <input type="text" value={slide.imagem_url || ''} onChange={e => handleLocalUpdateAcademySlide(slide.id, 'imagem_url', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-muted-foreground">Título</label>
                          <input type="text" value={slide.titulo || ''} onChange={e => handleLocalUpdateAcademySlide(slide.id, 'titulo', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="MasterFluxo" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">Subtítulo / Texto</label>
                          <input type="text" value={slide.texto || ''} onChange={e => handleLocalUpdateAcademySlide(slide.id, 'texto', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Texto de descrição..." />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-muted-foreground">Link "Assistir"</label>
                          <input type="text" value={slide.link_url || ''} onChange={e => handleLocalUpdateAcademySlide(slide.id, 'link_url', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2 flex items-end gap-2 justify-end">
                          <button onClick={() => handleLocalUpdateAcademySlide(slide.id, 'ativo', !slide.ativo)} className={`px-3 py-2 rounded-lg text-xs font-bold ${slide.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                            {slide.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                          <button onClick={() => handleSaveAcademySlide(slide)} className="px-3 py-2 bg-brand-green text-brand-dark rounded-lg text-xs font-bold hover:bg-[#baff4c] transition-colors" title="Salvar">
                            Salvar
                          </button>
                          <button onClick={() => handleDeleteAcademySlide(slide.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* ACADEMY MÓDULOS */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">Módulos Principais</h3>
                      <p className="text-sm text-muted-foreground">Os posters verticais principais logo abaixo do banner.</p>
                    </div>
                    <button onClick={handleAddAcademyModulo} className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Adicionar Módulo
                    </button>
                  </div>
                  <div className="space-y-4">
                    {academyModulos.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum módulo cadastrado.</p>}
                    {academyModulos.map(modulo => (
                      <div key={modulo.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-xl bg-muted/20 items-center">
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">URL da Imagem (Poster 2:3)</label>
                          <input type="text" value={modulo.imagem_url || ''} onChange={e => handleLocalUpdateAcademyModulo(modulo.id, 'imagem_url', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">Título</label>
                          <input type="text" value={modulo.titulo || ''} onChange={e => handleLocalUpdateAcademyModulo(modulo.id, 'titulo', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Ex: Master Fluxo" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-muted-foreground">Selo (Ex: Nova aula)</label>
                          <input type="text" value={modulo.badge || ''} onChange={e => handleLocalUpdateAcademyModulo(modulo.id, 'badge', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Nova aula" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-muted-foreground">Link do Módulo</label>
                          <input type="text" value={modulo.link_url || ''} onChange={e => handleLocalUpdateAcademyModulo(modulo.id, 'link_url', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2 flex items-end gap-2 justify-end">
                          <button onClick={() => handleSaveAcademyModulo(modulo)} className="px-3 py-2 bg-brand-green text-brand-dark rounded-lg text-xs font-bold hover:bg-[#baff4c] transition-colors" title="Salvar">
                            Salvar
                          </button>
                          <button onClick={() => handleDeleteAcademyModulo(modulo.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* ACADEMY NOVIDADES */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">Sessão "Novidades"</h3>
                      <p className="text-sm text-muted-foreground">Vídeos horizontais recentes da plataforma.</p>
                    </div>
                    <button onClick={handleAddAcademyNovidade} className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Adicionar Novidade
                    </button>
                  </div>
                  <div className="space-y-4">
                    {academyNovidades.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhuma novidade cadastrada.</p>}
                    {academyNovidades.map(novidade => (
                      <div key={novidade.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-xl bg-muted/20 items-center">
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">URL da Imagem (Thumb 16:9)</label>
                          <input type="text" value={novidade.imagem_url || ''} onChange={e => handleLocalUpdateAcademyNovidade(novidade.id, 'imagem_url', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-4">
                          <label className="text-xs font-semibold text-muted-foreground">Título</label>
                          <input type="text" value={novidade.titulo || ''} onChange={e => handleLocalUpdateAcademyNovidade(novidade.id, 'titulo', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="Ex: Encontro Zoom" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-semibold text-muted-foreground">Link</label>
                          <input type="text" value={novidade.link_url || ''} onChange={e => handleLocalUpdateAcademyNovidade(novidade.id, 'link_url', e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-gray-200 rounded-lg text-card-foreground" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2 flex items-end gap-2 justify-end">
                          <button onClick={() => handleSaveAcademyNovidade(novidade)} className="px-3 py-2 bg-brand-green text-brand-dark rounded-lg text-xs font-bold hover:bg-[#baff4c] transition-colors" title="Salvar">
                            Salvar
                          </button>
                          <button onClick={() => handleDeleteAcademyNovidade(novidade.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: PROFISSIONAIS */}
        {activeTab === 'profissionais' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Rede de Conexões</h2>
                <p className="text-sm text-muted-foreground">Cadastre, edite e remova os profissionais do banco de dados.</p>
              </div>
              <button onClick={() => openProfModal()} className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green hover:text-brand-dark transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar Profissional
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-background">
              {loadingProfissionais ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nome</th>
                      <th className="px-4 py-3 font-medium">Especialidade</th>
                      <th className="px-4 py-3 font-medium">Localização</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profissionais.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                          Nenhum profissional cadastrado na rede.
                        </td>
                      </tr>
                    )}
                    {profissionais.map(prof => (
                      <tr key={prof.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 text-card-foreground font-medium">{prof.nome}</td>
                        <td className="px-4 py-4 text-muted-foreground">{prof.especialidade}</td>
                        <td className="px-4 py-4 text-muted-foreground">{prof.cidade} - {prof.estado}</td>
                        <td className="px-4 py-4">
                          {prof.status_aprovacao === 'pendente' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Pendente</span>}
                          {prof.status_aprovacao === 'aprovado' && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Aprovado</span>}
                          {prof.status_aprovacao === 'reprovado' && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">Reprovado</span>}
                          {!prof.status_aprovacao && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Aprovado</span>}
                        </td>
                        <td className="px-4 py-4 flex gap-2 flex-wrap">
                          {(!prof.status_aprovacao || prof.status_aprovacao === 'pendente' || prof.status_aprovacao === 'reprovado') && (
                            <button onClick={() => handleAprovarProfissional(prof.id)} className="text-white bg-brand-green hover:bg-brand-green/90 font-bold transition-colors px-3 py-1.5 rounded-lg text-xs">Aprovar</button>
                          )}
                          {(!prof.status_aprovacao || prof.status_aprovacao === 'pendente' || prof.status_aprovacao === 'aprovado') && (
                            <button onClick={() => handleReprovarProfissional(prof.id, prof.nome)} className="text-white bg-red-500 hover:bg-red-600 font-bold transition-colors px-3 py-1.5 rounded-lg text-xs">Reprovar</button>
                          )}
                          <button onClick={() => openProfModal(prof)} className="text-gray-400 hover:text-brand-dark transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5" title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteProfissional(prof.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modal de Cadastro/Edição de Profissional */}
      {showProfModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProfId ? 'Editar Profissional' : 'Cadastrar Profissional'}
              </h2>
              <button 
                onClick={() => setShowProfModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="prof-form" onSubmit={handleSaveProfissional} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo ou Empresa</label>
                  <input required type="text" value={profForm.nome} onChange={(e) => setProfForm({...profForm, nome: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-brand-dark focus:border-brand-dark" placeholder="Ex: João Silva Soluções" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                  <select required value={profForm.especialidade} onChange={(e) => setProfForm({...profForm, especialidade: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-brand-dark focus:border-brand-dark">
                    <option value="">Selecione a especialidade</option>
                    {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
                  <input type="text" value={profForm.foto_url} onChange={(e) => setProfForm({...profForm, foto_url: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-brand-dark focus:border-brand-dark" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp de Contato</label>
                  <input required type="text" value={profForm.telefone} onChange={(e) => setProfForm({...profForm, telefone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-brand-dark focus:border-brand-dark" placeholder="Ex: (11) 99999-9999" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link do Instagram (Opcional)</label>
                    <input type="text" value={profForm.instagram_url} onChange={(e) => setProfForm({...profForm, instagram_url: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-brand-dark focus:border-brand-dark" placeholder="https://instagram.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link do Site (Opcional)</label>
                    <input type="text" value={profForm.site_url} onChange={(e) => setProfForm({...profForm, site_url: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-brand-dark focus:border-brand-dark" placeholder="https://..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                    <select required value={profForm.estado} onChange={(e) => setProfForm({...profForm, estado: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-brand-dark focus:border-brand-dark">
                      <option value="">Selecione</option>
                      {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input required type="text" value={profForm.cidade} onChange={(e) => setProfForm({...profForm, cidade: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-brand-dark focus:border-brand-dark" placeholder="Ex: São Paulo" />
                  </div>
                </div>

                {/* --- DADOS INTERNOS SIGILOSOS --- */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
                    Dados Internos (Sigilosos - Não visível para clientes)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo (Pessoa Física)</label>
                      <input type="text" value={profForm.nome_completo} onChange={(e) => setProfForm({...profForm, nome_completo: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500" placeholder="Ex: João da Silva Sauro" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Residência Completo</label>
                      <input type="text" value={profForm.endereco_residencia} onChange={(e) => setProfForm({...profForm, endereco_residencia: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500" placeholder="Rua, Número, Bairro, Cidade, CEP..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input type="text" value={profForm.cpf} onChange={(e) => setProfForm({...profForm, cpf: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500" placeholder="000.000.000-00" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                        <input type="text" value={profForm.rg} onChange={(e) => setProfForm({...profForm, rg: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500" placeholder="00.000.000-0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNH</label>
                        <input type="text" value={profForm.cnh} onChange={(e) => setProfForm({...profForm, cnh: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500" placeholder="Nº da CNH" />
                      </div>
                    </div>
                    {(profForm.especialidade === 'Engenheiro Eletricista' || profForm.especialidade === 'Engenheiro Civil') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CREA *</label>
                        <input required type="text" value={profForm.crea} onChange={(e) => setProfForm({...profForm, crea: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500" placeholder="Número do CREA" />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto do Documento (Frente/Verso)</label>
                        <input type="text" value={profForm.foto_documento_url} onChange={(e) => setProfForm({...profForm, foto_documento_url: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500" placeholder="https://..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Selfie com Documento</label>
                        <input type="text" value={profForm.foto_segurando_documento_url} onChange={(e) => setProfForm({...profForm, foto_segurando_documento_url: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500" placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-auto">
              <button type="button" onClick={() => setShowProfModal(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">
                Cancelar
              </button>
              <button type="submit" form="prof-form" disabled={saving} className="px-5 py-2.5 bg-brand-dark text-brand-green font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving ? 'Salvando...' : 'Salvar Profissional'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
