/**
 * Hooks pour le panier
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { panierService } from '@/services/panier.service';
import type { PanierContenu, AjouterPanierData } from '@/types/api.types';
import { useMutation } from './useApi';
import toast from 'react-hot-toast';

export function usePanier() {
  const [panier, setPanier] = useState<PanierContenu | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger le panier
  const loadPanier = useCallback(async () => {
    try {
      setLoading(true);
      const data = await panierService.getContenu();
      setPanier(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement du panier', error);
      // Si non authentifié, initialiser un panier vide
      if (error.status === 401) {
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
