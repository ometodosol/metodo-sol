import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, CheckSquare, Calculator, 
  LogOut, Settings, UserCircle, Wrench, Settings2, PlayCircle, BookOpen, GraduationCap, ClipboardList, Briefcase, Bell,
  Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navGroups = [
  {
    title: 'VISÃO GERAL',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: Users, label: 'Clientes', path: '/clientes' },
      { icon: FileText, label: 'Meus Projetos', path: '/projetos' },
    ]
  },
  {
    title: 'ENGENHARIA',
    items: [
      { icon: Calculator, label: 'Dimensionamento', path: '/dimensionamento' },
      { icon: Settings2, label: 'Homologação', path: '/homologacao' },
      { icon: CheckSquare, label: 'Comissionamento', path: '/comissionamento' },
    ]
  },
  {
    title: 'NEGÓCIOS',
    items: [
      { icon: ClipboardList, label: 'Orçamentos', path: '/orcamentos' },
      { icon: GraduationCap, label: 'Aulas', path: '/aprender' },
      { icon: Briefcase, label: 'Conexões', path: '/profissionais' },
    ]
  }
];

const bottomNavItems = [
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  { icon: UserCircle, label: 'Minha Conta', path: '/conta' },
];

export function AppLayout() {
  const { signOut } = useAuth();
  const { theme, setTheme, actualTheme } = useTheme();
  const navigate = useNavigate();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-dark text-white flex-shrink-0">
        <div className="h-14 lg:h-[60px] px-6 flex items-center">
          <img src="https://ometodosol.com.br/wp-content/uploads/2026/08/o-metodo-sol-logo-ligth.png" alt="O Método Sol" className="h-8 object-contain" />
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {/* Títulos removidos a pedido do usuário */}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                      isActive
                        ? 'bg-brand-light/20 text-brand-green shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50/50 dark:bg-background">
        <header className="h-14 lg:h-[60px] bg-transparent flex items-center justify-between px-6 flex-shrink-0 pt-2">
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground w-full max-w-sm">
            <div className="relative w-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-sm border-0 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-accent"
              title="Alternar Tema"
            >
              {actualTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-accent">
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-9 h-9 rounded-full bg-white dark:bg-card flex items-center justify-center cursor-pointer hover:ring-2 ring-primary/50 transition-all shadow-sm"
              >
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0a1120] rounded-2xl shadow-xl border-0 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5 dark:ring-white/5">
                  <div className="p-4 text-center">
                    <p className="text-sm font-semibold text-foreground">Minha Conta</p>
                  </div>
                  <div className="p-2 space-y-1 bg-gray-50/50 dark:bg-black/20">
                    <button 
                      onClick={() => { navigate('/conta'); setIsProfileOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all"
                    >
                      <UserCircle className="w-4 h-4" />
                      Perfil
                    </button>
                    <button 
                      onClick={() => { navigate('/configuracoes'); setIsProfileOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      Configurações
                    </button>
                  </div>
                  <div className="p-2 pt-0 bg-gray-50/50 dark:bg-black/20">
                    <button 
                      onClick={() => { signOut(); setIsProfileOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-all font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (Flattened for simplicity) */}
      <nav className="md:hidden bg-brand-dark flex items-center justify-around p-3 pb-safe z-50">
        {navGroups.flatMap(g => g.items).slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? 'text-brand-green' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button 
          onClick={signOut}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </nav>
    </div>
  );
}
