import React from 'react';
import { Page } from '../types';
import SubPageHeader from '../components/SubPageHeader';
import { DocumentArrowDownIcon } from '../components/icons/DocumentArrowDownIcon'; // Using generic doc icon

interface TermsPageProps {
  setActivePage: (page: Page) => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ setActivePage }) => {
  return (
    <div className="space-y-6 pb-12">
      <SubPageHeader 
        title="Termos de Uso" 
        onBack={() => setActivePage(Page.Landing)}
        icon={<DocumentArrowDownIcon className="w-6 h-6" />}
      />

      <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md space-y-6 text-dark dark:text-dark-text leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">1. Aceitação dos Termos</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            Ao acessar e utilizar o aplicativo Prontu, você concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso serviço.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">2. Descrição do Serviço</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            O Prontu é uma plataforma de gestão para profissionais de saúde, permitindo o cadastro de pacientes, agendamentos, anotações de sessões e controle financeiro simples.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">3. Responsabilidades do Usuário</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em não compartilhar suas credenciais de acesso e assume total responsabilidade por todas as atividades que ocorram em sua conta. Os dados inseridos sobre pacientes são de responsabilidade exclusiva do profissional de saúde, devendo este seguir as normas éticas de sua profissão.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">4. Planos e Pagamentos</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            O Prontu oferece planos gratuitos e pagos (Premium). Os planos pagos podem ser mensais, semestrais ou anuais. O pagamento é processado via plataforma segura (Kiwify). O cancelamento pode ser solicitado a qualquer momento, mantendo-se o acesso até o fim do ciclo vigente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">5. Propriedade Intelectual</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            Todo o conteúdo, design, logotipos e software do Prontu são propriedade exclusiva da nossa equipe ou de seus licenciadores e são protegidos por leis de direitos autorais.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-primary">6. Alterações nos Termos</h2>
          <p className="text-sm text-gray-600 dark:text-dark-subtext">
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre alterações significativas através do aplicativo ou e-mail.
          </p>
        </section>
        
        <div className="pt-6 border-t border-gray-100 dark:border-dark-border">
            <p className="text-xs text-gray-400">Última atualização: Outubro de 2024</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;