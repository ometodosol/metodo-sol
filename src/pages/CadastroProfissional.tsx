import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ESPECIALIDADES = [
  'Engenheiro Eletricista',
  'Engenheiro Civil',
  'Instalador Solar',
  'Projetista',
  'Vendedor / Comercial',
  'Consultor',
  'Integrador',
  'Outros'
];

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function CadastroProfissional() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    nome_completo: '',
    especialidade: '',
    telefone: '',
    estado: '',
    cidade: '',
    endereco_residencia: '',
    cpf: '',
    rg: '',
    cnh: '',
    foto_url: '',
    instagram_url: '',
    site_url: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'selfie') => {
    if (e.target.files && e.target.files.length > 0) {
      if (type === 'doc') setDocFile(e.target.files[0]);
      else setSelfieFile(e.target.files[0]);
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `cadastros/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('documentos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setUploading(true);

    try {
      let docUrl = '';
      let selfieUrl = '';

      if (docFile) {
        docUrl = await uploadFileToSupabase(docFile);
      }
      
      if (selfieFile) {
        selfieUrl = await uploadFileToSupabase(selfieFile);
      }

      setUploading(false);

      const payload = {
        ...form,
        foto_documento_url: docUrl,
        foto_segurando_documento_url: selfieUrl,
        status_aprovacao: 'pendente'
      };

      const { error } = await supabase.from('profissionais').insert([payload]);

      if (error) {
        console.error(error);
        setErrorMsg('Ocorreu um erro ao enviar seu cadastro. Tente novamente.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro ao fazer upload das imagens. Tente com imagens menores.');
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100">
          <div className="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-brand-green" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Enviado!</h1>
          <p className="text-gray-600 mb-8">
            Recebemos as suas informações com sucesso. Nossa equipe fará a validação dos documentos e, se aprovado, seu perfil aparecerá na nossa rede de conexões.
          </p>
          <Link to="/login" className="inline-block px-6 py-3 bg-brand-dark text-white font-medium rounded-xl hover:bg-brand-dark/90 transition-colors">
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <img src="/logo-light.png" alt="O Método Sol" className="h-8 mx-auto mb-6 opacity-90" />
          <h1 className="text-3xl font-black text-white">Seja um Profissional Parceiro</h1>
          <p className="mt-3 text-lg text-blue-100">
            Cadastre-se para fazer parte da nossa rede exclusiva de conexões.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 mb-0 flex items-start gap-3 rounded-r-xl">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* Seção 1: Perfil Público */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-brand-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                Perfil Público
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição / Fantasia *</label>
                  <input required type="text" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" placeholder="Como os clientes verão você" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade Principal *</label>
                  <select required value={form.especialidade} onChange={(e) => setForm({...form, especialidade: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark">
                    <option value="">Selecione...</option>
                    {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Comercial *</label>
                  <input required type="text" value={form.telefone} onChange={(e) => setForm({...form, telefone: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link de Foto de Perfil (Opcional)</label>
                  <input type="url" value={form.foto_url} onChange={(e) => setForm({...form, foto_url: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF) de Atuação *</label>
                  <select required value={form.estado} onChange={(e) => setForm({...form, estado: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark">
                    <option value="">Selecione...</option>
                    {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade Principal *</label>
                  <input required type="text" value={form.cidade} onChange={(e) => setForm({...form, cidade: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" placeholder="Ex: São Paulo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (Opcional)</label>
                  <input type="url" value={form.instagram_url} onChange={(e) => setForm({...form, instagram_url: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site (Opcional)</label>
                  <input type="url" value={form.site_url} onChange={(e) => setForm({...form, site_url: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Seção 2: Dados Sigilosos */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="bg-brand-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                Dados Cadastrais (Sigilosos)
              </h2>
              <p className="text-sm text-gray-500 pl-8 mb-4">Esses dados são apenas para segurança interna e não serão exibidos publicamente.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo (Pessoa Física) *</label>
                  <input required type="text" value={form.nome_completo} onChange={(e) => setForm({...form, nome_completo: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Residência Completo *</label>
                  <input required type="text" value={form.endereco_residencia} onChange={(e) => setForm({...form, endereco_residencia: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" placeholder="Rua, Número, Bairro, CEP..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input required type="text" value={form.cpf} onChange={(e) => setForm({...form, cpf: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RG *</label>
                  <input required type="text" value={form.rg} onChange={(e) => setForm({...form, rg: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNH (Opcional se tiver RG)</label>
                  <input type="text" value={form.cnh} onChange={(e) => setForm({...form, cnh: e.target.value})} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-brand-dark focus:border-brand-dark" />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Seção 3: Validação de Identidade */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="bg-brand-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                Validação de Identidade
              </h2>
              <p className="text-sm text-gray-500 pl-8 mb-4">Envie fotos nítidas para validação de segurança.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-8">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group">
                  <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'doc')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-brand-dark transition-colors" />
                  <p className="font-medium text-gray-900 mb-1">Foto do Documento *</p>
                  <p className="text-xs text-gray-500 mb-3">RG ou CNH (frente e verso se possível)</p>
                  {docFile && <p className="text-sm font-medium text-brand-green bg-brand-green/10 py-1 px-2 rounded-lg truncate">{docFile.name}</p>}
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group">
                  <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'selfie')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-brand-dark transition-colors" />
                  <p className="font-medium text-gray-900 mb-1">Selfie com Documento *</p>
                  <p className="text-xs text-gray-500 mb-3">Segure o documento próximo ao rosto</p>
                  {selfieFile && <p className="text-sm font-medium text-brand-green bg-brand-green/10 py-1 px-2 rounded-lg truncate">{selfieFile.name}</p>}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto min-w-[280px] px-8 py-4 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl text-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-green/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploading ? 'Enviando imagens...' : 'Processando...'}
                  </>
                ) : (
                  'Enviar Cadastro para Aprovação'
                )}
              </button>
              <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Seus dados serão criptografados e armazenados com segurança.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
