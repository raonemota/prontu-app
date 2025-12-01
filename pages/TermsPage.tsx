import React, { useEffect } from 'react';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

interface TermsPageProps {
  onBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white dark:bg-dark-bg min-h-screen font-sans text-dark dark:text-dark-text">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
                <img src="https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/image-removebg-preview%20(1).png" alt="Prontu" className="h-8 md:h-10 w-auto" />
            </div>
            <button 
                onClick={onBack}
                className="text-sm font-medium text-primary hover:text-purple-700 transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-dark-card"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Voltar
            </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-dark dark:text-white">Termos de Uso</h1>
        
        <div className="prose dark:prose-invert prose-purple max-w-none space-y-6 text-gray-600 dark:text-dark-subtext">
            <p>
                Bem-vindo ao Prontu. Ao acessar e utilizar nossa plataforma, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">1. Aceitação dos Termos</h3>
            <p>
                Ao criar uma conta no Prontu, você declara que tem pelo menos 18 anos de idade e capacidade legal para celebrar este contrato.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">2. Uso do Serviço</h3>
            <p>
                O Prontu é uma ferramenta de gestão para profissionais de saúde. Você concorda em usar o serviço apenas para fins legais e de acordo com as regulamentações profissionais aplicáveis à sua área de atuação.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">3. Contas e Segurança</h3>
            <p>
                Você é responsável por manter a confidencialidade de sua senha e conta. O Prontu não se responsabiliza por qualquer perda ou dano decorrente do seu fracasso em proteger suas informações de acesso.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">4. Planos e Pagamentos</h3>
            <p>
                Alguns recursos do serviço exigem pagamento. Ao assinar um plano Premium (Mensal, Semestral ou Anual), você concorda com os termos de cobrança recorrente. O cancelamento pode ser feito a qualquer momento, mantendo-se o acesso até o fim do ciclo pago.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">5. Propriedade Intelectual</h3>
            <p>
                O serviço e seu conteúdo original, recursos e funcionalidades são de propriedade exclusiva do Prontu e seus licenciadores.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">6. Limitação de Responsabilidade</h3>
            <p>
                Em nenhum caso o Prontu, seus diretores, funcionários ou agentes serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">7. Alterações nos Termos</h3>
            <p>
                Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes de quaisquer novos termos entrarem em vigor.
            </p>

            <p className="mt-8 text-sm italic">
                Última atualização: 20 de Setembro de 2024.
            </p>
        </div>
      </main>

      <footer className="bg-white dark:bg-dark-card py-8 border-t border-gray-100 dark:border-dark-border mt-12">
          <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-500 dark:text-dark-subtext">
              © {new Date().getFullYear()} Prontu. Todos os direitos reservados.
          </div>
      </footer>
    </div>
  );
};

export default TermsPage;