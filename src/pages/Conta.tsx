import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Lock, Upload, Info } from 'lucide-react';

export function Conta() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Simulando dados que viriam do metadata do Supabase populado pelo webhook da Hotmart
  const nome = user?.user_metadata?.nome || 'Aluno Método Sol';
  const cpf = user?.user_metadata?.cpf || '000.000.000-00';
  const email = user?.email || '';

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (password !== confirmPassword) {
      setMessage({ text: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: 'A senha deve ter no mínimo 6 caracteres.', type: 'error' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage({ text: 'Erro ao atualizar senha: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: 'Senha atualizada com sucesso!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">Minha Conta</h1>
        <p className="text-gray-500 mt-1">Gerencie seu perfil e credenciais de acesso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna da Foto e Perfil */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-4">
              <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                <User className="w-16 h-16 text-gray-300" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-lg text-brand-dark">{nome}</h3>
            <span className="inline-block mt-2 px-3 py-1 bg-brand-green/20 text-brand-dark text-xs font-semibold rounded-full">
              Instalador Oficial
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p>Seus dados principais são sincronizados automaticamente com a Hotmart e não podem ser alterados aqui.</p>
          </div>
        </div>

        {/* Coluna do Formulário */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-brand-dark mb-4 border-b pb-2">Dados de Cadastro</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={nome} 
                  disabled 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input 
                  type="text" 
                  value={cpf} 
                  disabled 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Acesso (Hotmart)</label>
                <input 
                  type="email" 
                  value={email} 
                  disabled 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-brand-dark mb-4 border-b pb-2 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Alterar Senha
            </h3>

            {message.text && (
              <div className={`p-4 rounded-lg mb-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                  placeholder="Repita a nova senha"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-dark/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Atualizar Senha'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
