import React from 'react';
import { Page } from '../types';
import SubPageHeader from '../components/SubPageHeader';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';

interface PrivacyPageProps {
  setActivePage: (page: Page) => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ setActivePage }) => {
  return (
    <div className="space-y-6 pb-12">
      <SubPageHeader 
        title="Política de Privacidade" 
        onBack={() => setActivePage(Page.Landing)}
        icon={<ShieldCheckIcon className="w-6 h-6" />}
      />

      <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md space-y-6 text-dark dark:text-dark-text leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">1. Coleta de Informações</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            Coletamos informações que você nos fornece diretamente, como nome, e-mail e foto de perfil ao criar uma conta. Também armazenamos os dados que você insere no sistema, como informações de pacientes e agendamentos, estritamente para o funcionamento do serviço.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">2. Uso das Informações</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            Utilizamos suas informações para:
            <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Fornecer, operar e manter o Prontu;</li>
                <li>Processar transações e gerenciar sua assinatura;</li>
                <li>Melhorar a experiência do usuário e desenvolver novas funcionalidades;</li>
                <li>Enviar notificações importantes sobre o serviço.</li>
            </ul>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">3. Proteção e Armazenamento</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            A segurança dos seus dados é nossa prioridade. Utilizamos infraestrutura segura (Supabase) com criptografia padrão da indústria para proteger as informações em trânsito e em repouso. Seus dados não são vendidos a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">4. Seus Direitos (LGPD)</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a acessar, corrigir, portar e excluir seus dados pessoais. Você pode gerenciar suas informações diretamente nas configurações do perfil ou entrar em contato conosco para solicitações específicas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">5. Cookies</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            Utilizamos cookies essenciais para manter sua sessão ativa e segura. Não utilizamos cookies de rastreamento publicitário intrusivo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">6. Contato</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            Se tiver dúvidas sobre esta Política de Privacidade, entre em contato através do e-mail de suporte: <strong>raonemota@hotmail.com</strong>.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 dark:border-dark-border">
            <p className="text-xs text-gray-400">Última atualização: Outubro de 2024</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;