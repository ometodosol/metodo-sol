import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

export function SejaParceiro() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    if (accepted) {
      navigate('/cadastro-profissional');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      {/* Header */}
      <header className="py-6">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
          <img src="/logo-light.png" alt="O Método Sol" className="h-7 opacity-90" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Hero Section */}
          <div className="bg-brand-dark px-8 py-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-green/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-brand-green/20 rounded-full blur-3xl"></div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 relative z-10">
              Torne-se um Profissional Parceiro
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto relative z-10">
              Faça parte da nossa rede exclusiva e seja indicado diretamente para os alunos d'O Método Sol que precisam de prestadores de serviços de confiança.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* Benefícios */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Por que ser nosso parceiro?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-green">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Clientes Qualificados</h3>
                  <p className="text-sm text-gray-600">
                    Você será recomendado para pessoas que já estudam nossa metodologia e estão prontas para investir, sem perda de tempo.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-brand-dark/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-dark">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Mais Fechamentos</h3>
                  <p className="text-sm text-gray-600">
                    Uma indicação direta nossa eleva a sua autoridade instantaneamente, aumentando drasticamente sua taxa de conversão.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Selo de Confiança</h3>
                  <p className="text-sm text-gray-600">
                    Nossos alunos confiam em nós, e ao fazer parte da nossa rede, esse selo de confiança é transferido para o seu negócio.
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Como Funciona */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Como Funciona?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-brand-green flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>1. Análise de Perfil:</strong> Você preenche os dados a seguir e anexa as fotos solicitadas para nossa equipe validar a sua identidade.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-brand-green flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>2. Aprovação Interna:</strong> Se tudo estiver correto, você é aprovado para ingressar no banco de dados visível aos nossos clientes.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-brand-green flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>3. Indicações Orgânicas:</strong> Alunos que necessitarem de profissionais da sua área e região entrarão em contato diretamente no seu WhatsApp.
                  </div>
                </li>
              </ul>
            </div>

            {/* Termos */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-700" />
                Termo de Responsabilidade e Parceria
              </h3>
              
              <div className="prose prose-sm text-gray-600 mb-6 max-h-48 overflow-y-auto bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                <p>Ao se cadastrar como Profissional Parceiro da plataforma O Método Sol, você declara e concorda que:</p>
                <ol className="list-decimal pl-4 space-y-2 mt-2">
                  <li>Todas as informações fornecidas, incluindo dados pessoais, documentos e qualificações profissionais, são rigorosamente verdadeiras e atualizadas.</li>
                  <li>O Método Sol atua unicamente como uma plataforma de conexão entre alunos/clientes e prestadores de serviços, não possuindo qualquer vínculo empregatício, societário ou de responsabilidade técnica sobre os serviços por você prestados.</li>
                  <li>Qualquer negociação, contrato, garantia, pagamento ou execução de serviço firmado a partir das indicações geradas pela plataforma é de responsabilidade exclusiva entre você e o cliente final. O Método Sol é inteiramente isento de responsabilidade civil, criminal ou comercial oriunda dessa relação.</li>
                  <li>Você compromete-se a manter um elevado padrão de qualidade, ética e respeito no atendimento aos clientes indicados pela plataforma.</li>
                  <li>O Método Sol reserva-se o direito de excluir, suspender ou reprovar o seu perfil da base de parceiros a qualquer momento, sem aviso prévio, caso sejam identificadas condutas inadequadas, reclamações de clientes ou informações falsas no cadastro.</li>
                  <li>Os dados sigilosos enviados neste formulário (como CPF, RG e fotos de documentos) serão utilizados exclusivamente para a validação de segurança interna da plataforma e não serão expostos publicamente.</li>
                </ol>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-brand-dark focus:ring-brand-dark cursor-pointer transition-all"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                </div>
                <span className="text-gray-700 text-sm font-medium group-hover:text-gray-900 transition-colors">
                  Li, compreendi e concordo integralmente com os Termos de Responsabilidade e com a veracidade de todas as informações que vou fornecer a seguir.
                </span>
              </label>
            </div>

            {/* Ação */}
            <div className="text-center pt-4">
              <button
                onClick={handleStart}
                disabled={!accepted}
                className={`w-full md:w-auto min-w-[300px] px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  accepted 
                    ? 'bg-brand-dark hover:bg-brand-dark/90 text-white shadow-brand-dark/20 transform hover:-translate-y-0.5' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Iniciar meu Cadastro
              </button>
            </div>

          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} O Método Sol. Todos os direitos reservados.</p>
        </div>
      </main>
    </div>
  );
}
