/**
 * Service Sections Hero
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';

export interface HeroSection {
  id: number;
  type: 'carousel' | 'side_card' | 'promo_banner' | 'countdown';
  position: string | null;
  titre: string | null;
  description: string | null;
  sous_titre: string | null;
  pourcentage_reduction: number | null;
  texte_reduction: string | null;
  prix_actuel: number | null;
  prix_ancien: number | null;
  texte_prix: string | null;
  lien_url: string | null;
  texte_bouton: string | null;
  image: string | null;
  image_fond: string | null;
  image_produit: string | null;
  couleur_fond: string | null;
  date_fin_countdown: string | null;
  ordre: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroSectionsResponse {
  sections: HeroSection[];
  grouped: {
    carousel: HeroSection[];
    side_cards: HeroSection[];
    promo_banners: HeroSection[];
    countdown: HeroSection[];
  };
}

export const heroService = {
  /**
   * Récupérer la liste des sections hero actives
   */
  async getListe(): Promise<HeroSectionsResponse> {
    const response = await apiClient.post<HeroSectionsResponse>(
      API_CONFIG.endpoints.hero.liste,
      {}
    );
    return response;
  },

  /**
   * Récupérer le détail d'une section hero
   */
  async getDetail(heroSectionId: number): Promise<HeroSection> {
    const response = await apiClient.post<{ section: HeroSection }>(
      API_CONFIG.endpoints.hero.detail,
      { hero_section_id: heroSectionId }
    );
    return response.section;
  },
};

