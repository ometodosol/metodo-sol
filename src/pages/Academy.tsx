import React, { useState, useEffect } from 'react';
import { Play, Sparkles, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

export function Academy() {
  const [slides, setSlides] = useState<AcademySlide[]>([]);
  const [modulos, setModulos] = useState<AcademyModulo[]>([]);
  const [novidades, setNovidades] = useState<AcademyNovidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    fetchAcademyData();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const fetchAcademyData = async () => {
    setLoading(true);
    const [slidesRes, modulosRes, novidadesRes] = await Promise.all([
      supabase.from('academy_slides').select('*').eq('ativo', true).order('criado_em', { ascending: false }),
      supabase.from('academy_modulos').select('*').order('ordem', { ascending: true }),
      supabase.from('academy_novidades').select('*').order('ordem', { ascending: true })
    ]);
    
    if (!slidesRes.error && slidesRes.data) setSlides(slidesRes.data);
    if (!modulosRes.error && modulosRes.data) setModulos(modulosRes.data);
    if (!novidadesRes.error && novidadesRes.data) setNovidades(novidadesRes.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02050A] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#a8ff35]" />
      </div>
    );
  }

  const mainSlide = slides.length > 0 ? slides[currentSlideIndex] : null;

  return (
    <div className="min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] bg-[#02050A] text-white rounded-[2rem] animate-in fade-in duration-500 pb-24 shadow-2xl border border-white/5">
      
      {/* Hero Banner */}
      {mainSlide && (
        <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] rounded-t-[2rem] overflow-hidden">
          {/* Banner Image / Video Placeholder */}
          <div className="absolute inset-0 transition-opacity duration-1000">
            <img 
              key={mainSlide.id}
              src={mainSlide.imagem_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"} 
              alt={mainSlide.titulo} 
              className="w-full h-full object-cover object-center animate-in fade-in duration-1000"
            />
            {/* Gradient Overlay for Netflix effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02050A] via-[#02050A]/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#02050A] via-[#02050A]/40 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-1/4 left-6 md:left-12 lg:left-20 z-10 max-w-2xl animate-in slide-in-from-bottom-4 duration-700 fade-in" key={`content-${mainSlide.id}`}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-shadow-lg">{mainSlide.titulo || 'MasterFluxo'}</h1>
            {mainSlide.texto && (
              <p className="text-base md:text-lg text-gray-300 font-medium mb-8 max-w-lg text-shadow">
                {mainSlide.texto}
              </p>
            )}
            
            {mainSlide.link_url && (
              <div className="flex items-center gap-4">
                <a href={mainSlide.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors">
                  <Play className="w-5 h-5 fill-black" />
                  Assistir Agora
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`relative z-20 space-y-12 pb-12 overflow-x-hidden px-4 md:px-0 ${mainSlide ? 'mt-[25px]' : 'mt-12 pt-12'}`}>
        
        {/* Row: Módulos (Posters verticais) */}
        {modulos.length > 0 && (
          <section className="px-6 md:px-12 lg:px-20">
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
              Módulos Principais
            </h2>
            <div className="relative group">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4">
                {modulos.map((modulo) => (
                  <a href={modulo.link_url || '#'} target={modulo.link_url ? "_blank" : "_self"} rel="noopener noreferrer" key={modulo.id} className="snap-start flex-none w-40 md:w-56 aspect-[2/3] relative rounded-xl overflow-hidden group/card cursor-pointer block">
                    <img 
                      src={modulo.imagem_url} 
                      alt={modulo.titulo} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity"></div>
                    
                    {modulo.badge && (
                      <div className="absolute top-3 left-3 bg-[#a8ff35] text-black text-xs font-bold px-2 py-1 rounded-sm">
                        {modulo.badge}
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-lg leading-tight">{modulo.titulo}</h3>
                    </div>
                  </a>
                ))}
              </div>
              
              {/* Nav arrows (desktop only) */}
              <button className="absolute -left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full hidden lg:group-hover:block transition-all backdrop-blur-sm pointer-events-none">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full hidden lg:group-hover:block transition-all backdrop-blur-sm pointer-events-none">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </section>
        )}

        {/* Row: Novidades */}
        {novidades.length > 0 && (
          <section className="px-6 md:px-12 lg:px-20">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#a8ff35]" />
                Novidades
              </h2>
              <p className="text-gray-400 text-sm mt-1">Aulas disponibilizadas recentemente</p>
            </div>
            
            <div className="relative group">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4">
                {novidades.map((item) => (
                  <a href={item.link_url || '#'} target={item.link_url ? "_blank" : "_self"} rel="noopener noreferrer" key={item.id} className="snap-start flex-none w-64 md:w-80 aspect-video relative rounded-xl overflow-hidden group/card cursor-pointer block">
                    <img 
                      src={item.imagem_url} 
                      alt={item.titulo} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-sm leading-tight text-white">{item.titulo}</h3>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-sm">
                      <Play className="w-5 h-5 fill-white" />
                    </div>
                  </a>
                ))}
              </div>
              
              <button className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full hidden lg:group-hover:block transition-all backdrop-blur-sm pointer-events-none">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
