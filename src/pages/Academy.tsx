import React from 'react';
import { Play, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

export function Academy() {
  const modulos = [
    { id: 1, title: 'Master Fluxo', image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop', badge: '' },
    { id: 2, title: 'Mentoria Fluxo', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop', badge: 'Nova aula' },
    { id: 3, title: 'Venda Todo Santo Dia', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop', badge: 'Nova aula' },
    { id: 4, title: 'Stories 10X', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop', badge: '' },
    { id: 5, title: 'Light Copy', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop', badge: '' },
  ];

  const novidades = [
    { id: 1, title: 'Encontros Zoom', image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1974&auto=format&fit=crop' },
    { id: 2, title: 'Como o YouTube pode vender todo santo dia', image: 'https://images.unsplash.com/photo-1611162618828-bc409f073cbf?q=80&w=1974&auto=format&fit=crop' },
    { id: 3, title: 'Como conseguir ROAS 10 nos picos', image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=2031&auto=format&fit=crop' },
    { id: 4, title: 'Bate papo veteranos', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop' },
  ];

  const continuarAssistindo = [
    { id: 1, title: 'Como Criar o Efeito Paliativo', subtitle: 'Oficina Fluxo 2024 - 09', progress: 0, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop' },
    { id: 2, title: 'Como Criar um Ebook, PDFs', subtitle: 'Planilhas e Templates', progress: 0, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden animate-in fade-in duration-500 pb-24">
      
      {/* Hero Banner */}
      <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]">
        {/* Banner Image / Video Placeholder */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
            alt="MasterFluxo Event" 
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay for Netflix effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-1/4 left-6 md:left-12 lg:left-20 z-10 max-w-2xl">
          <img 
            src="https://via.placeholder.com/300x80/000000/FFFFFF?text=MasterFluxo" 
            alt="MasterFluxo Logo" 
            className="h-12 md:h-20 mb-4 hidden" 
          />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">MasterFluxo</h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium mb-8 max-w-lg">
            O grupo de master mind do VTSD. Acesso exclusivo aos encontros e estratégias avançadas.
          </p>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors">
              <Play className="w-5 h-5 fill-black" />
              Assistir Agora
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-20 md:-mt-32 space-y-12 pb-12">
        
        {/* Row: Módulos (Posters verticais) */}
        <section className="px-6 md:px-12 lg:px-20">
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            Módulos Principais
          </h2>
          <div className="relative group">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4">
              {modulos.map((modulo) => (
                <div key={modulo.id} className="snap-start flex-none w-40 md:w-56 aspect-[2/3] relative rounded-xl overflow-hidden group/card cursor-pointer">
                  <img 
                    src={modulo.image} 
                    alt={modulo.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity"></div>
                  
                  {modulo.badge && (
                    <div className="absolute top-3 left-3 bg-[#a8ff35] text-black text-xs font-bold px-2 py-1 rounded-sm">
                      {modulo.badge}
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-lg leading-tight">{modulo.title}</h3>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Nav arrows (desktop only) */}
            <button className="absolute -left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full hidden lg:group-hover:block transition-all backdrop-blur-sm">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full hidden lg:group-hover:block transition-all backdrop-blur-sm">
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </section>

        {/* Row: Novidades */}
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
                <div key={item.id} className="snap-start flex-none w-64 md:w-80 aspect-video relative rounded-xl overflow-hidden group/card cursor-pointer">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-sm leading-tight text-white">{item.title}</h3>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-sm">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full hidden lg:group-hover:block transition-all backdrop-blur-sm">
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </section>

        {/* Row: Continue Assistindo */}
        <section className="px-6 md:px-12 lg:px-20">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Continue Assistindo</h2>
          <p className="text-gray-400 text-sm mb-6">Retome de onde você parou nas suas últimas aulas.</p>
          
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4">
            {continuarAssistindo.map((item) => (
              <div key={item.id} className="snap-start flex-none w-[300px] md:w-[400px] bg-[#1a1a1a] rounded-xl overflow-hidden flex cursor-pointer hover:bg-[#252525] transition-colors border border-gray-800">
                <div className="w-1/3 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.subtitle}</p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#a8ff35] w-0"></div>
                    </div>
                    <button className="mt-3 w-full flex items-center justify-center gap-2 bg-[#a8ff35] text-black hover:bg-[#baff4c] py-2 rounded-md font-bold text-xs transition-colors">
                      <Play className="w-3 h-3 fill-black" />
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
