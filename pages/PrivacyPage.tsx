import React, { useEffect } from 'react';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

interface PrivacyPageProps {
  onBack: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-dark dark:text-white">Política de Privacidade</h1>
        
        <div className="prose dark:prose-invert prose-purple max-w-none space-y-6 text-gray-600 dark:text-dark-subtext">
            <p>
                Sua privacidade é importante para nós. É política do Prontu respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Prontu, e outros sites que possuímos e operamos.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">1. Coleta de Informações</h3>
            <p>
                Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">2. Uso de Dados</h3>
            <p>
                Utilizamos seus dados para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Fornecer e operar os serviços do Prontu;</li>
                <li>Processar pagamentos e gerenciar sua assinatura;</li>
                <li>Melhorar e personalizar sua experiência na plataforma;</li>
                <li>Enviar comunicações importantes sobre sua conta.</li>
            </ul>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">3. Retenção de Dados</h3>
            <p>
                Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">4. Compartilhamento de Dados</h3>
            <p>
                Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei ou para processamento de pagamentos (ex: Kiwify) onde estritamente necessário.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">5. Segurança</h3>
            <p>
                Valorizamos sua confiança em nos fornecer suas Informações Pessoais, portanto, estamos nos empenhando para usar meios comercialmente aceitáveis de protegê-las. Mas lembre-se que nenhum método de transmissão pela internet, ou método de armazenamento eletrônico é 100% seguro e confiável.
            </p>

            <h3 className="text-xl font-bold text-dark dark:text-white mt-6 mb-2">6. Dados de Pacientes</h3>
            <p>
                Os dados dos seus pacientes inseridos na plataforma são de sua inteira responsabilidade e propriedade. O Prontu atua como operador destes dados, garantindo sua segurança e confidencialidade, mas não os utiliza para outros fins que não sejam o fornecimento do serviço a você.
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

export default PrivacyPage;