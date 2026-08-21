import React from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PlusSquare, CheckSquare, Wrench, Calculator, AlertTriangle, Sun, Lightbulb, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Top Banner & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
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
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
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
        <section className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-card-foreground">Alertas Técnicos</h2>
          </div>
          <div className="flex-1">
            <div className="pb-4 border-b border-border flex items-start gap-4">
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
        <section className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-card-foreground">Instalações em Andamento</h2>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors border border-transparent hover:border-border">
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
