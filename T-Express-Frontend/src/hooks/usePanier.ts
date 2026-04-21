/**
 * Hooks pour le panier
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { panierService } from '@/services/panier.service';
import { authService } from '@/services/auth.service';
import type { PanierContenu, AjouterPanierData } from '@/types/api.types';
import { useMutation } from './useApi';
import toast from 'react-hot-toast';

const isDev = process.env.NODE_ENV === 'development';

export function usePanier() {
  // Initialiser avec un panier vide pour éviter les problèmes de null
  const [panier, setPanier] = useState<PanierContenu | null>({ lignes: [], total: 0, nombre_articles: 0 });
  const [loading, setLoading] = useState(true); // Commencer en loading

  // Charger le panier
  const loadPanier = useCallback(async () => {
    // Vérifier l'authentification avant de charger
    if (!authService.isAuthenticated()) {
      if (isDev) {
        console.log('Utilisateur non authentifié, panier vide');
      }
      setPanier({ lignes: [], total: 0, nombre_articles: 0 });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      if (isDev) {
        console.log('Chargement du panier...');
      }
      const data = await panierService.getContenu();
      if (isDev) {
        console.log('Panier chargé (données brutes):', JSON.stringify(data, null, 2));
        console.log('Type de données:', typeof data);
        console.log('Lignes:', data?.lignes);
        console.log('Nombre de lignes:', data?.lignes?.length);
        console.log('Total:', data?.total);
        console.log('Nombre articles:', data?.nombre_articles);
      }
      
      // Vérifier que les données sont dans le bon format
      if (!data || typeof data !== 'object') {
        console.error('Données invalides reçues:', data);
        setPanier({ lignes: [], total: 0, nombre_articles: 0 });
        return;
      }
      
      // S'assurer que les lignes sont un tableau
      const lignes = Array.isArray(data.lignes) ? data.lignes : [];
      const total = typeof data.total === 'number' ? data.total : 0;
      const nombre_articles = typeof data.nombre_articles === 'number' ? data.nombre_articles : lignes.reduce((sum, l) => sum + (l.quantite || 0), 0);
      
      const panierFormate = {
        lignes,
        total,
        nombre_articles,
      };
      
      if (isDev) {
        console.log('Panier formaté:', panierFormate);
      }
      setPanier(panierFormate);
    } catch (error: any) {
      // Si non authentifié, initialiser un panier vide
      if (error.status === 401) {
        if (isDev) {
          console.log('Utilisateur non authentifié, panier vide');
        }
        setPanier({ lignes: [], total: 0, nombre_articles: 0 });
      } else if (error.status === 408 || error.status === 0) {
        // Timeout ou erreur réseau - mode hors ligne
        console.warn('⚠️ Backend non accessible. Panier initialisé vide en mode hors ligne.');
        setPanier({ lignes: [], total: 0, nombre_articles: 0 });
      } else {
        // En cas d'autre erreur, initialiser aussi un panier vide pour éviter les erreurs
        console.warn('⚠️ Erreur lors du chargement du panier. Initialisation panier vide.', error.status);
        setPanier({ lignes: [], total: 0, nombre_articles: 0 });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Callbacks stables pour les mutations
  const handleAjouterSuccess = useCallback((data: PanierContenu) => {
    if (isDev) {
      console.log('✅ Produit ajouté avec succès. Données reçues:', data);
    }
    
    // Vérifier le format des données
    if (!data || typeof data !== 'object') {
      if (isDev) {
        console.error('❌ Données invalides reçues après ajout:', data);
      }
      // Rafraîchir le panier pour obtenir les bonnes données
      loadPanier();
      return;
    }
    
    // S'assurer que les lignes sont un tableau
    const lignes = Array.isArray(data.lignes) ? data.lignes : [];
    const total = typeof data.total === 'number' ? data.total : 0;
    const nombre_articles = typeof data.nombre_articles === 'number' 
      ? data.nombre_articles 
      : lignes.reduce((sum, l) => sum + (l.quantite || 0), 0);
    
    const panierFormate = {
      lignes,
      total,
      nombre_articles,
    };
    
    if (isDev) {
      console.log('📦 Panier formaté après ajout:', panierFormate);
    }
    setPanier(panierFormate);
    toast.success('Produit ajouté au panier');
    
    // Rafraîchir le panier pour être sûr qu'il est à jour
    setTimeout(() => {
      loadPanier();
    }, 500);
  }, [loadPanier]);

  const handleAjouterError = useCallback((error: any) => {
    console.error('❌ Erreur lors de l\'ajout au panier:', error);
    toast.error(error.message || 'Erreur lors de l\'ajout au panier');
  }, []);

  const handleMettreAJourSuccess = useCallback((data: PanierContenu) => {
    setPanier(data);
    toast.success('Quantité mise à jour');
  }, []);

  const handleMettreAJourError = useCallback((error: any) => {
    toast.error(error.message || 'Erreur lors de la mise à jour');
  }, []);

  const handleSupprimerSuccess = useCallback((data: PanierContenu) => {
    setPanier(data);
    toast.success('Produit retiré du panier');
  }, []);

  const handleSupprimerError = useCallback((error: any) => {
    toast.error(error.message || 'Erreur lors de la suppression');
  }, []);

  // Ajouter au panier
  const ajouterMutation = useMutation(panierService.ajouter, {
    onSuccess: handleAjouterSuccess,
    onError: handleAjouterError,
  });

  // Mettre à jour la quantité
  const mettreAJourMutation = useMutation(panierService.mettreAJour, {
    onSuccess: handleMettreAJourSuccess,
    onError: handleMettreAJourError,
  });

  // Supprimer du panier
  const supprimerMutation = useMutation(panierService.supprimer, {
    onSuccess: handleSupprimerSuccess,
    onError: handleSupprimerError,
  });

  // Vider le panier
  const vider = useCallback(async () => {
    try {
      await panierService.vider();
      setPanier({ lignes: [], total: 0, nombre_articles: 0 });
      toast.success('Panier vidé');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du vidage du panier');
    }
  }, []);

  useEffect(() => {
    loadPanier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Charger une seule fois au montage

  // Utiliser directement les fonctions execute des mutations (elles sont stables maintenant)
  const ajouter = useCallback(
    async (data: AjouterPanierData) => {
      if (isDev) {
        console.log('🛒 Tentative d\'ajout au panier:', data);
      }
      try {
        const result = await ajouterMutation.execute(data);
        if (isDev) {
          console.log('✅ Résultat de l\'ajout:', result);
        }
        return result;
      } catch (error: any) {
        if (isDev) {
          console.error('❌ Erreur dans ajouter:', error);
        }
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // execute est stable grâce à useRef dans useApi
  );

  const mettreAJour = useCallback(
    (lignePanierId: number, quantite: number) =>
      mettreAJourMutation.execute({ ligne_panier_id: lignePanierId, quantite }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // execute est stable grâce à useRef dans useApi
  );

  const supprimer = useCallback(
    (lignePanierId: number) => supprimerMutation.execute(lignePanierId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // execute est stable grâce à useRef dans useApi
  );

  // Mémoriser refresh pour éviter les re-renders - loadPanier est stable (pas de dépendances)
  const refresh = useCallback(() => {
    return loadPanier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadPanier n'a pas de dépendances, donc il est stable

  return {
    panier,
    loading,
    ajouter,
    mettreAJour,
    supprimer,
    vider,
    refresh,
    ajoutLoading: ajouterMutation.loading,
    updateLoading: mettreAJourMutation.loading,
    deleteLoading: supprimerMutation.loading,
  };
}
