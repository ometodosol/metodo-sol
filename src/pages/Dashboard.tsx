import React, { useState, useEffect } from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PlusSquare, CheckSquare, Wrench, Calculator, AlertTriangle, Sun, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabase';

const defaultCarouselImages = [
  {
    imagem_url: 'https://images.unsplash.com/photo-1509391366360-1e97b524f425?q=80&w=2069&auto=format&fit=crop',
    titulo: 'Bem-vindo ao Dashboard',
    texto: 'Acompanhe seus projetos e orçamentos'
  },
  {
    imagem_url: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?q=80&w=2036&auto=format&fit=crop',
    titulo: 'Energia Solar',
    texto: 'Soluções completas para instaladores'
  }
];

export function Dashboard() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselImages, setCarouselImages] = useState<any[]>(defaultCarouselImages);

  useEffect(() => {
    async function fetchBanners() {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('local', 'dashboard')
        .eq('ativo', true)
        .order('id', { ascending: false });
      
      if (!error && data && data.length > 0) {
        setCarouselImages(data);
      }
    }
    fetchBanners();
  }, []);

  useEffect(() => {
    if (carouselImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages]);

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Top Carousel */}
      <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden relative shadow-md">
        {carouselImages.map((banner, idx) => (
          <img 
            key={idx}
            src={banner.imagem_url} 
            alt={`Slide ${idx + 1}`} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        {/* Overlay escuro e textos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold mb-1">{carouselImages[currentSlide]?.titulo || ''}</h2>
          <p className="text-sm text-gray-200 line-clamp-2 max-w-2xl">{carouselImages[currentSlide]?.texto || ''}</p>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Top Banner & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 bg-card border-0 rounded-2xl p-6 md:p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="z-10 relative">
            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground flex items-center gap-2">
              Olá, Instalador <Sun className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              Fique por dentro das análises de hoje. Dê uma olhada rápida nas principais estatísticas dos seus projetos.
            </p>
            <button 
              onClick={() => navigate('/projetos/novo')}
              className="mt-6 bg-foreground text-background hover:bg-foreground/90 transition-colors px-6 py-2 rounded-md font-medium text-sm inline-flex items-center gap-2"
            >
              Novo Projeto &rarr;
            </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <Lightbulb className="w-64 h-64 text-foreground" />
          </div>
        </div>

        {/* Key Insights Card */}
        <div className="bg-card border-0 rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Key Insights</h3>
          </div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-card-foreground">R$ 20.320</h2>
            <p className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
              +40% <span className="text-muted-foreground font-normal">vs último mês</span>
            </p>
          </div>
          {/* Mockup de Gráfico de barras simples */}
          <div className="flex gap-1 h-12 items-end mt-8">
            {[30, 50, 40, 70, 60, 90, 50, 60, 40, 70, 80, 50, 60, 100, 80, 70, 50, 40, 60, 90, 80, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-foreground rounded-t-sm opacity-20" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Novos Projetos"
          value="12"
          icon={PlusSquare}
          trend={{ value: 18, label: "vs last month", isPositive: true }}
          onClick={() => navigate('/projetos/novo')}
        />
        <MetricCard 
          title="Kits Conferidos"
          value="4"
          icon={CheckSquare}
          onClick={() => navigate('/conferir-kit')}
        />
        <MetricCard 
          title="Problemas Abertos"
          value="2"
          icon={AlertTriangle}
          trend={{ value: 10, label: "vs last month", isPositive: false }}
          onClick={() => navigate('/diagnostico')}
        />
        <MetricCard 
          title="Propostas Geradas"
          value="8"
          icon={Calculator}
          trend={{ value: 4, label: "vs last month", isPositive: true }}
          onClick={() => navigate('/orcamentos')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alertas Técnicos */}
        <section className="bg-card rounded-2xl shadow-md border-0 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-card-foreground">Alertas Técnicos</h2>
          </div>
          <div className="flex-1">
            <div className="pb-4 border-b border-gray-100 dark:border-white/5 flex items-start gap-4">
              <div className="mt-0.5">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h4 className="font-semibold text-card-foreground text-sm">Incompatibilidade CC/CA</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-2">O projeto "João Silva" possui um oversizing de 145%, acima do suportado pelo inversor.</p>
                <StatusBadge status="warning" label="Atenção Necessária" />
              </div>
            </div>
          </div>
          <button className="mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-center">
            Ver todos os alertas
          </button>
        </section>

        {/* Instalações em Andamento */}
        <section className="bg-card rounded-2xl shadow-md border-0 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-card-foreground">Instalações em Andamento</h2>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                <div>
                  <h4 className="font-semibold text-card-foreground text-sm">Residencial {i === 1 ? 'Maria Souza' : 'Carlos Almeida'}</h4>
                  <p className="text-xs text-muted-foreground">Atualizado há 2 dias</p>
                </div>
                <StatusBadge status="info" label="Em andamento" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
