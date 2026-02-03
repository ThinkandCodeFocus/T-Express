/**
 * Utilitaires pour le formatage Sénégalais
 */

import { LOCALE_CONFIG } from '@/config/api.config';

/**
 * Formater un prix en FCFA
 */
export function formatPrice(amount: number): string {
  return LOCALE_CONFIG.formatPrice(amount);
}

/**
 * Formater une date
 */
export function formatDate(date: Date | string): string {
  return LOCALE_CONFIG.formatDate(date);
}

/**
 * Formater un numéro de téléphone sénégalais
 */
export function formatPhone(phone: string): string {
  return LOCALE_CONFIG.formatPhone(phone);
}

/**
 * Valider un numéro de téléphone sénégalais
 * Accepte n'importe quel format avec espaces, tirets, etc.
 */
export function validatePhone(phone: string): boolean {
  // Nettoyer le numéro (enlever espaces, tirets, parenthèses)
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Vérifier le format nettoyé
  // Doit être : +221XXXXXXXXX (12 chars) ou 00221XXXXXXXXX (14 chars) ou XXXXXXXXX (9 chars)
  const pattern = /^(\+221|00221)\d{9}$|^\d{9}$/;
  
  return pattern.test(cleaned);
}

/**
 * Formater un numéro de téléphone pour l'API (enlever les espaces et le +)
 */
export function normalizePhone(phone: string): string {
  // Enlever tout sauf les chiffres
  const cleaned = phone.replace(/\D/g, '');
  
  // Si commence par 221, garder tel quel
  if (cleaned.startsWith('221')) {
    return `+${cleaned}`;
  }
  
  // Sinon, ajouter +221
  return `+221${cleaned}`;
}

/**
 * Calculer la réduction en pourcentage
 */
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Formater un pourcentage de réduction
 */
export function formatDiscount(originalPrice: number, salePrice: number): string {
  const discount = calculateDiscount(originalPrice, salePrice);
  return `-${discount}%`;
}

/**
 * Tronquer un texte
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Slugifier un texte
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ''); // Enlever les tirets au début et à la fin
}

/**
 * Générer une couleur aléatoire (pour les avatars)
 */
export function generateColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Obtenir les initiales d'un nom
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formater une taille de fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Valider une adresse email
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Formater un délai relatif (il y a X jours/heures/minutes)
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSeconds < 60) {
    return 'À l\'instant';
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffWeeks < 4) {
    return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
  } else if (diffMonths < 12) {
    return `Il y a ${diffMonths} mois`;
  } else {
    return `Il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
  }
}

/**
 * Capitaliser la première lettre
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Obtenir le statut de commande formaté
 */
export function formatCommandeStatus(
  statut: string
): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    // Format legacy (minuscules avec underscores)
    en_attente: {
      label: 'En attente',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
    confirmee: {
      label: 'Confirmée',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    en_preparation: {
      label: 'En préparation',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
    },
    expediee: {
      label: 'Expédiée',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-100',
    },
    livree: {
      label: 'Livrée',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    annulee: {
      label: 'Annulée',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
    // Format backend actuel (avec espaces et accents)
    'En attente': {
      label: 'En attente',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
    'Confirmée': {
      label: 'Confirmée',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    'En préparation': {
      label: 'En préparation',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
    },
    'Expédiée': {
      label: 'Expédiée',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-100',
    },
    'Livrée': {
      label: 'Livrée',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    'Annulée': {
      label: 'Annulée',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
  };
  
  return statusMap[statut] || statusMap.en_attente;
}

/**
 * Obtenir le statut de paiement formaté
 */
export function formatPaiementStatus(
  statut: 'en_attente' | 'complete' | 'echoue' | 'rembourse'
): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap = {
    en_attente: {
      label: 'En attente',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
    complete: {
      label: 'Complété',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    echoue: {
      label: 'Échoué',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
    rembourse: {
      label: 'Remboursé',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
    },
  };
  
  return statusMap[statut] || statusMap.en_attente;
}
