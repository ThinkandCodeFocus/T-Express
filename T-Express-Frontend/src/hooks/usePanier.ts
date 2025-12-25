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

export function usePanier() {
  // Initialiser avec un panier vide pour éviter les problèmes de null
  const [panier, setPanier] = useState<PanierContenu | null>({ lignes: [], total: 0, nombre_articles: 0 });
  const [loading, setLoading] = useState(true); // Commencer en loading

  // Charger le panier
  const loadPanier = useCallback(async () => {
    // Vérifier l'authentification avant de charger
    if (!authService.isAuthenticated()) {
      console.log('Utilisateur non authentifié, panier vide');
      setPanier({ lignes: [], total: 0, nombre_articles: 0 });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Chargement du panier...');
      const data = await panierService.getContenu();
      console.log('Panier chargé (données brutes):', JSON.stringify(data, null, 2));
      console.log('Type de données:', typeof data);
      console.log('Lignes:', data?.lignes);
      console.log('Nombre de lignes:', data?.lignes?.length);
      console.log('Total:', data?.total);
      console.log('Nombre articles:', data?.nombre_articles);
      
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
      
      console.log('Panier formaté:', panierFormate);
      setPanier(panierFormate);
    } catch (error: any) {
      // Si non authentifié, initialiser un panier vide
      if (error.status === 401) {
        console.log('Utilisateur non authentifié, panier vide');
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

  // Ajouter au panier
  const ajouterMutation = useMutation(panierService.ajouter, {
    onSuccess: (data) => {
      setPanier(data);
      toast.success('Produit ajouté au panier');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'ajout au panier');
    },
  });

  // Mettre à jour la quantité
  const mettreAJourMutation = useMutation(panierService.mettreAJour, {
    onSuccess: (data) => {
      setPanier(data);
      toast.success('Quantité mise à jour');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  // Supprimer du panier
  const supprimerMutation = useMutation(panierService.supprimer, {
    onSuccess: (data) => {
      setPanier(data);
      toast.success('Produit retiré du panier');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
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
  }, [loadPanier]);

  const ajouter = useCallback(
    (data: AjouterPanierData) => ajouterMutation.execute(data),
    [ajouterMutation]
  );

  const mettreAJour = useCallback(
    (lignePanierId: number, quantite: number) =>
      mettreAJourMutation.execute({ ligne_panier_id: lignePanierId, quantite }),
    [mettreAJourMutation]
  );

  const supprimer = useCallback(
    (lignePanierId: number) => supprimerMutation.execute(lignePanierId),
    [supprimerMutation]
  );

  return {
    panier,
    loading,
    ajouter,
    mettreAJour,
    supprimer,
    vider,
    refresh: loadPanier,
    ajoutLoading: ajouterMutation.loading,
    updateLoading: mettreAJourMutation.loading,
    deleteLoading: supprimerMutation.loading,
  };
}
