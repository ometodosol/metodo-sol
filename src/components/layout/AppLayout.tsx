import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, CheckSquare, Zap, Calculator, 
  LogOut, Settings, UserCircle, Wrench, Settings2, PlayCircle, BookOpen, GraduationCap, ClipboardList 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: FileText, label: 'Meus Projetos', path: '/projetos' },
  { icon: Calculator, label: 'Dimensionamento', path: '/dimensionamento' },
  { icon: Wrench, label: 'Instalação', path: '/instalacao' },
  { icon: Settings2, label: 'Homologação', path: '/homologacao' },
  { icon: CheckSquare, label: 'Comissionamento', path: '/comissionamento' },
  { icon: GraduationCap, label: 'Aprender', path: '/aprender' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  { icon: UserCircle, label: 'Minha Conta', path: '/conta' },
];

export function AppLayout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-brand-gray flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-dark text-white shadow-xl flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-brand-dark" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white">
              Método Sol
            </h1>
            <span className="text-[10px] text-brand-light uppercase tracking-wider font-semibold">
              Assistente Técnico
            </span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-brand-green text-brand-dark shadow-md shadow-brand-green/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10 space-y-2">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <button 
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl transition-colors font-medium text-red-400 hover:text-red-300 hover:bg-white/5"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Simples para MVP) */}
      <nav className="md:hidden bg-brand-dark text-white border-t border-white/10 flex items-center justify-around p-3 pb-safe z-50">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? 'text-brand-green' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button 
          onClick={signOut}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </nav>
    </div>
  );
}
