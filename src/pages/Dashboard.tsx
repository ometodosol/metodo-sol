import React from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PlusSquare, CheckSquare, Wrench, Calculator, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-brand-dark">Olá, Instalador.</h1>
        <p className="text-gray-500 mt-2">O que vamos resolver hoje?</p>
      </header>

      {/* Main Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Novo"
          value="Projeto"
          icon={PlusSquare}
          className="bg-brand-green/10 border-brand-green/20"
          onClick={() => navigate('/projetos/novo')}
        />
        <MetricCard 
          title="Conferir"
          value="Kit"
          icon={CheckSquare}
          onClick={() => navigate('/conferir-kit')}
        />
        <MetricCard 
          title="Resolver"
          value="Problema"
          icon={Wrench}
          onClick={() => navigate('/diagnostico')}
        />
        <MetricCard 
          title="Fazer"
          value="Cálculo"
          icon={Calculator}
          onClick={() => navigate('/calculadoras')}
        />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Alertas Técnicos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-dark">Alertas Técnicos</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-start gap-4">
              <div className="p-2 bg-status-warning/10 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <h4 className="font-semibold text-brand-dark text-sm">Incompatibilidade CC/CA</h4>
                <p className="text-xs text-gray-500 mt-1">O projeto "João Silva" possui um oversizing de 145%, acima do suportado pelo inversor.</p>
                <div className="mt-3">
                  <StatusBadge status="warning" label="Atenção Necessária" />
                </div>
              </div>
            </div>
            {/* Mais alertas podem entrar aqui */}
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-sm font-medium text-brand-dark hover:text-brand-light transition-colors">
                Ver todos os alertas
              </button>
            </div>
          </div>
        </section>

        {/* Instalações em Andamento */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-dark">Instalações em Andamento</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <h4 className="font-semibold text-brand-dark text-sm">Residencial {i === 1 ? 'Maria Souza' : 'Carlos Almeida'}</h4>
                  <p className="text-xs text-gray-500">Atualizado há 2 dias</p>
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
