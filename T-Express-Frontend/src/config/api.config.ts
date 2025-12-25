/**
 * Configuration centralisée pour l'API
 * Adapté pour le contexte sénégalais
 */

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '5000'), // Réduit à 5s pour des erreurs très rapides
  
  endpoints: {
    // Authentification
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
    },
    
    // Client
    client: {
      profile: '/client/profil',
      update: '/client/update',
    },
    
    // Catalogue
    catalogue: {
      index: '/catalogue/index',
      rechercher: '/catalogue/rechercher',
      detail: '/catalogue/produit',
    },
    
    // Catégories
    categories: {
      liste: '/categories/liste',
      detail: '/categories/detail',
    },
    
    // Sections Hero
    hero: {
      liste: '/hero/liste',
      detail: '/hero/detail',
    },
    
    // Panier
    panier: {
      contenu: '/panier/contenu',
      ajouter: '/panier/ajouter',
      mettreAJour: '/panier/mettreAJour',
      supprimer: '/panier/supprimer',
    },
    
    // Adresses
    adresses: {
      liste: '/adresses/liste',
      ajouter: '/adresses/ajouter',
      supprimer: '/adresses/supprimer',
    },
    
    // Commandes
    commande: {
      creer: '/commande/creer',
      historique: '/commande/historique',
      detail: '/commande/detail',
    },
    
    // Avis
    avis: {
      soumettre: '/avis/soumettre',
    },
    
    // Favoris
    favoris: {
      toggle: '/favoris/toggle',
      liste: '/favoris/liste',
    },
    
    // Retours
    retour: {
      demander: '/retour/demander',
    },
    
    // Articles (Blog)
    articles: {
      liste: '/articles/liste',
      detail: '/articles/detail',
      recents: '/articles/recents',
      populaires: '/articles/populaires',
      categories: '/articles/categories',
      rechercher: '/articles/rechercher',
      commentaire: '/articles/commentaire',
    },
    
    // Paramètres
    settings: {
      footer: '/settings/footer',
    },
    
    // Admin
    admin: {
      produits: {
        liste: '/admin/produits/liste',
        detail: '/admin/produits/detail',
        creer: '/admin/produits/creer',
        modifier: '/admin/produits/modifier',
        supprimer: '/admin/produits/supprimer',
      },
      categories: {
        liste: '/admin/categories/liste',
        detail: '/admin/categories/detail',
        creer: '/admin/categories/creer',
        modifier: '/admin/categories/modifier',
        supprimer: '/admin/categories/supprimer',
      },
      hero: {
        liste: '/admin/hero/liste',
        detail: '/admin/hero/detail',
        creer: '/admin/hero/creer',
        modifier: '/admin/hero/modifier',
        supprimer: '/admin/hero/supprimer',
        toggleActif: '/admin/hero/toggle-actif',
      },
      clients: {
        liste: '/admin/clients/liste',
        detail: '/admin/clients/detail',
        creer: '/admin/clients/creer',
        modifier: '/admin/clients/modifier',
        supprimer: '/admin/clients/supprimer',
      },
      commandes: {
        liste: '/admin/commandes/liste',
        detail: '/admin/commandes/detail',
        updateStatus: '/admin/commandes/changer-statut',
      },
      stock: {
        liste: '/admin/stock/liste',
        update: '/admin/stock/ajuster',
      },
      dashboard: {
        stats: '/admin/dashboard/stats',
      },
      avis: {
        liste: '/admin/avis/liste',
        detail: '/admin/avis/detail',
        modifier: '/admin/avis/modifier',
        supprimer: '/admin/avis/supprimer',
      },
      retours: {
        liste: '/admin/retours/liste',
        detail: '/admin/retours/detail',
        approuver: '/admin/retours/approuver',
        refuser: '/admin/retours/refuser',
        supprimer: '/admin/retours/supprimer',
      },
      paiements: {
        liste: '/admin/paiements/liste',
        detail: '/admin/paiements/detail',
        modifierStatut: '/admin/paiements/modifier-statut',
        supprimer: '/admin/paiements/supprimer',
      },
      livraisons: {
        liste: '/admin/livraisons/liste',
        detail: '/admin/livraisons/detail',
        modifierStatut: '/admin/livraisons/modifier-statut',
        supprimer: '/admin/livraisons/supprimer',
      },
      articles: {
        liste: '/admin/articles/liste',
        detail: '/admin/articles/detail',
        creer: '/admin/articles/creer',
        modifier: '/admin/articles/modifier',
        supprimer: '/admin/articles/supprimer',
      },
      adresses: {
        liste: '/admin/adresses',
        supprimer: '/admin/adresses/supprimer',
      },
      favoris: {
        liste: '/admin/favoris',
        supprimer: '/admin/favoris/supprimer',
      },
    },
  },
};

// Configuration de localisation pour le Sénégal
export const LOCALE_CONFIG = {
  locale: 'fr-SN',
  currency: 'XOF',
  currencySymbol: 'FCFA',
  phonePrefix: '+221',
  
  // Format de téléphone sénégalais (9 chiffres après +221)
  phonePattern: /^(\+221|00221)?[0-9]{9}$/,
  
  // Format de prix
  formatPrice: (amount: number): string => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },
  
  // Format de date
  formatDate: (date: Date | string): string => {
    return new Intl.DateTimeFormat('fr-SN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  },
  
  // Format de téléphone
  formatPhone: (phone: string): string => {
    // Nettoyer le numéro
    const cleaned = phone.replace(/\D/g, '');
    
    // Format: +221 XX XXX XX XX
    if (cleaned.length === 9) {
      return `+221 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('221')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }
    
    return phone;
  },
};

// Configuration des paiements (Wave & Orange Money)
export const PAYMENT_CONFIG = {
  wave: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_WAVE === 'true',
    apiUrl: process.env.NEXT_PUBLIC_WAVE_API_URL,
    name: 'Wave',
    logo: '/images/payment/wave.png',
  },
  orangeMoney: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ORANGE_MONEY === 'true',
    apiUrl: process.env.NEXT_PUBLIC_ORANGE_MONEY_API_URL,
    name: 'Orange Money',
    logo: '/images/payment/orange-money.png',
  },
};

// Configuration de l'upload
export const UPLOAD_CONFIG = {
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'), // 5MB
  allowedImageTypes: (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  
  validateFile: (file: File): { valid: boolean; error?: string } => {
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux. Taille maximale: ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`,
      };
    }
    
    if (!UPLOAD_CONFIG.allowedImageTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé. Types acceptés: ${UPLOAD_CONFIG.allowedImageTypes.join(', ')}`,
      };
    }
    
    return { valid: true };
  },
};
