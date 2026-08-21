import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const carouselImages = [
  'https://images.unsplash.com/photo-1509391366360-1e97b524f425?q=80&w=2069&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548337138-e87d889cc369?q=80&w=2036&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=2076&auto=format&fit=crop'
];

export function Login() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Se já estiver logado, redireciona pro Dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex font-sans text-white">
      {/* Left Column - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 p-4">
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl">
          {carouselImages.map((src, idx) => (
            <img 
              key={idx}
              src={src} 
              alt={`Slide ${idx + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          {/* Gradient Overlay for Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent"></div>
          
          {/* Text and Carousel Indicators */}
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-3xl font-bold text-white mb-2">Do orçamento à instalação</h2>
            <p className="text-gray-300 text-sm mb-8 max-w-md">
              Um fluxo de trabalho completo: geração de propostas, dimensionamento e gestão de projetos com precisão profissional.
            </p>
            
            <div className="flex gap-6 text-[10px] font-bold tracking-widest text-gray-500">
              {['DIMENSIONAR', 'PROPOSTAS', 'PROJETOS'].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`pb-3 border-b-2 transition-all ${idx === currentSlide ? 'border-white text-white' : 'border-transparent hover:text-gray-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative">
        <div className="w-full max-w-sm flex flex-col items-center">
          
          <img src="https://ometodosol.com.br/wp-content/uploads/2026/08/o-metodo-sol-logo-dark.png" alt="O Método Sol" className="h-10 object-contain mb-8" />
          
          <p className="text-gray-400 mb-8 text-center text-sm">
            Acesse sua conta
          </p>

          <form className="w-full space-y-4" onSubmit={handleLogin}>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-400 text-center font-medium">{error}</p>
              </div>
            )}

            <div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
                  placeholder="E-mail de acesso"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
                  placeholder="Senha"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-sm font-bold text-[#0a0a0a] bg-white hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
