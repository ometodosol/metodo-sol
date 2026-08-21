import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, CheckSquare, Calculator, 
  LogOut, Settings, UserCircle, Wrench, Settings2, PlayCircle, BookOpen, GraduationCap, ClipboardList, Briefcase, Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: FileText, label: 'Meus Projetos', path: '/projetos' },
  { icon: Calculator, label: 'Dimensionamento', path: '/dimensionamento' },
  { icon: ClipboardList, label: 'Orçamentos', path: '/orcamentos' },

  { icon: Settings2, label: 'Homologação', path: '/homologacao' },
  { icon: CheckSquare, label: 'Comissionamento', path: '/comissionamento' },
  { icon: GraduationCap, label: 'Aulas', path: '/aprender' },
  { icon: Briefcase, label: 'Conexões', path: '/profissionais' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  { icon: UserCircle, label: 'Minha Conta', path: '/conta' },
];

export function AppLayout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border flex-shrink-0">
        <div className="h-14 lg:h-[60px] px-6 border-b border-border flex items-center">
          <img src="/logo-dark.png" alt="O Método Sol" className="h-8 object-contain" />
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-border space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
          <button 
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md transition-colors text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-muted/20">
        <header className="h-14 lg:h-[60px] border-b border-border bg-background flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            {/* Breadcrumb Area */}
            Plataforma
          </div>
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border cursor-pointer">
              <UserCircle className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-background border-t border-border flex items-center justify-around p-3 pb-safe z-50">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button 
          onClick={signOut}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </nav>
    </div>
  );
}
