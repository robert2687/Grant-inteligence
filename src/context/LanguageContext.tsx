import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Locale = 'en' | 'es' | 'fr';

interface Translations {
  [key: string]: {
    [key in Locale]: string;
  };
}

const translations: Translations = {
  orchestrator: {
    en: 'Orchestrator',
    es: 'Orquestador',
    fr: 'Orchestrateur',
  },
  userProfile: {
    en: 'User Profile',
    es: 'Perfil de Usuario',
    fr: 'Profil Utilisateur',
  },
  myProjects: {
    en: 'My Projects',
    es: 'Mis Proyectos',
    fr: 'Mes Projets',
  },
  grantScanner: {
    en: 'Grant Scanner',
    es: 'Escáner de Subvenciones',
    fr: 'Scanner de Subventions',
  },
  evaluator: {
    en: 'Evaluator',
    es: 'Evaluador',
    fr: 'Évaluateur',
  },
  proposalStudio: {
    en: 'Proposal Studio',
    es: 'Estudio de Propuestas',
    fr: 'Studio de Propositions',
  },
  adminCompliance: {
    en: 'Admin & Compliance',
    es: 'Admin y Cumplimiento',
    fr: 'Admin et Conformité',
  },
  dashboardTitle: {
    en: 'Orchestrator Dashboard',
    es: 'Panel del Orquestador',
    fr: 'Tableau de bord de l\'Orchestrateur',
  },
  dashboardSubtitle: {
    en: 'System overview and multi-agent status.',
    es: 'Descripción general del sistema y estado multi-agente.',
    fr: 'Aperçu du système et statut multi-agents.',
  },
  triggerScan: {
    en: 'Trigger Scan',
    es: 'Iniciar Escaneo',
    fr: 'Lancer le Scan',
  },
  scanning: {
    en: 'Scanning Global Sources...',
    es: 'Escaneando Fuentes Globales...',
    fr: 'Analyse des Sources Mondiales...',
  },
  filterGrants: {
    en: 'Filter Grants',
    es: 'Filtrar Subvenciones',
    fr: 'Filtrer les Subventions',
  },
  region: {
    en: 'Region',
    es: 'Región',
    fr: 'Région',
  },
  amount: {
    en: 'Amount',
    es: 'Monto',
    fr: 'Montant',
  },
  deadlineBefore: {
    en: 'Deadline Before',
    es: 'Plazo Antes de',
    fr: 'Date Limite Avant',
  },
  minFitScore: {
    en: 'Min Fit Score (%)',
    es: 'Puntaje Mínimo de Ajuste (%)',
    fr: 'Score d\'Adéquation Min (%)',
  },
  hideMenu: {
    en: 'Hide Menu',
    es: 'Ocultar Menú',
    fr: 'Masquer le Menu',
  },
  showMenu: {
    en: 'Show Menu',
    es: 'Mostrar Menú',
    fr: 'Afficher le Menu',
  },
  discoveredGrants: {
    en: 'Discovered Grants',
    es: 'Subvenciones Descubiertas',
    fr: 'Subventions Découvertes',
  },
  evaluated: {
    en: 'Evaluated',
    es: 'Evaluadas',
    fr: 'Évaluées',
  },
  proposalsDrafted: {
    en: 'Proposals Drafted',
    es: 'Propuestas Redactadas',
    fr: 'Propositions Rédigées',
  },
  submitted: {
    en: 'Submitted',
    es: 'Enviadas',
    fr: 'Soumises',
  },
  recentOpportunities: {
    en: 'Recent Opportunities',
    es: 'Oportunidades Recientes',
    fr: 'Opportunités Récentes',
  },
  viewAll: {
    en: 'View All',
    es: 'Ver Todo',
    fr: 'Voir Tout',
  },
  noGrantsFound: {
    en: 'No grants found',
    es: 'No se encontraron subvenciones',
    fr: 'Aucune subvention trouvée',
  },
  triggerScanDesc: {
    en: 'Trigger a scan to find relevant opportunities.',
    es: 'Inicia un escaneo para encontrar oportunidades relevantes.',
    fr: 'Lancez un scan pour trouver des opportunités pertinentes.',
  },
  relevance: {
    en: 'Relevance',
    es: 'Relevancia',
    fr: 'Pertinence',
  },
  eligibility: {
    en: 'Eligibility',
    es: 'Elegibilidad',
    fr: 'Éligibilité',
  },
  source: {
    en: 'Source',
    es: 'Fuente',
    fr: 'Source',
  },
  fit: {
    en: 'Fit',
    es: 'Ajuste',
    fr: 'Adéquation',
  }
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('en');

  const t = (key: string) => {
    return translations[key]?.[locale] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
