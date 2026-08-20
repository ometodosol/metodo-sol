import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderOpen, PlusSquare, 
  CheckSquare, Wrench, Activity, Calculator, 
  Cpu, Briefcase, FileSignature, GraduationCap, 
  Settings, User, Star, LifeBuoy 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: PlusSquare, label: 'Novo Projeto', path: '/projetos/novo' },
  { icon: FolderOpen, label: 'Meus Projetos', path: '/projetos' },
  { icon: CheckSquare, label: 'Conferir Kit', path: '/conferir-kit' },

  { icon: Activity, label: 'Diagnóstico', path: '/diagnostico' },
  { icon: Calculator, label: 'Dimensionamento', path: '/dimensionamento' },
  { icon: Cpu, label: 'Equipamentos', path: '/equipamentos' },
  { icon: GraduationCap, label: 'Aulas', path: '/aprender' },
  { icon: Briefcase, label: 'Conexões', path: '/profissionais' },
  { icon: FileSignature, label: 'Homologação', path: '/homologacao' },
];

const bottomItems = [
  { icon: User, label: 'Perfil', path: '/perfil' },
  { icon: Star, label: 'Plano', path: '/plano' },
  { icon: LifeBuoy, label: 'Suporte', path: '/suporte' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export function AppSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-brand-dark h-screen text-brand-gray border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-brand-green">MÉTODO</span>SOL
        </h1>
        <p className="text-xs text-brand-light mt-1 uppercase tracking-wider">Assistente Técnico</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-brand-green/10 text-brand-green" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
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

      <div className="p-4 border-t border-gray-800">
        <ul className="space-y-1">
          {bottomItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-brand-green/10 text-brand-green" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
