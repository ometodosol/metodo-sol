import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, FolderOpen, PlusCircle, Activity, Menu, 
  X, Users, CheckSquare, Wrench, Calculator, 
  Cpu, Briefcase, FileSignature, GraduationCap, Settings 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const mainTabs = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: FolderOpen, label: 'Projetos', path: '/projetos' },
  { icon: PlusCircle, label: 'Novo', path: '/projetos/novo', highlight: true },
  { icon: Activity, label: 'Diagnóstico', path: '/diagnostico' },
];

const moreMenu = [
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: CheckSquare, label: 'Conferir Kit', path: '/conferir-kit' },

  { icon: Calculator, label: 'Dimensionamento', path: '/dimensionamento' },
  { icon: Cpu, label: 'Equipamentos', path: '/equipamentos' },
  { icon: GraduationCap, label: 'Aulas', path: '/aprender' },
  { icon: Briefcase, label: 'Conexões', path: '/profissionais' },
  { icon: FileSignature, label: 'Homologação', path: '/homologacao' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Off-canvas Menu for "Mais" */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-brand-dark h-full flex flex-col overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center text-white">
              <span className="font-bold">Menu Principal</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-gray-800 rounded-md">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 flex-1">
              <ul className="space-y-2">
                {moreMenu.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-3 rounded-md transition-colors text-base font-medium",
                          isActive 
                            ? "bg-brand-green/10 text-brand-green" 
                            : "text-gray-300 hover:bg-gray-800"
                        )
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe">
        <ul className="flex items-center justify-around">
          {mainTabs.map((tab) => (
            <li key={tab.path} className="flex-1">
              <NavLink
                to={tab.path}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center py-2 h-14",
                    isActive ? "text-brand-dark" : "text-gray-500 hover:text-gray-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <tab.icon className={cn("w-6 h-6 mb-1", tab.highlight && "text-brand-green stroke-[2.5px]", isActive && !tab.highlight && "text-brand-dark stroke-[2.5px]")} />
                    <span className={cn("text-[10px] font-medium", tab.highlight && "text-brand-green font-bold")}>{tab.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-full flex flex-col items-center justify-center py-2 h-14 text-gray-500 hover:text-gray-900"
            >
              <Menu className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Mais</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
