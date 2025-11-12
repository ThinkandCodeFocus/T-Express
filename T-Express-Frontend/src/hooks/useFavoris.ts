/**
 * Hooks pour les favoris (wishlist)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { favoriService } from '@/services/favori.service';
import type { Favori } from '@/types/api.types';
import { useMutation } from './useApi';
import toast from 'react-hot-toast';

export function useFavoris() {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les favoris
  const loadFavoris = useCallback(async () => {
    try {
      setLoading(true);
      const data = await favoriService.getListe();
      setFavoris(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des favoris', error);
      if (error.status === 401) {
        setFavoris([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle favori
  const toggleMutation = useMutation(favoriService.toggle, {
    onSuccess: (data) => {
      if (data.action === 'added') {
        toast.success('Ajouté aux favoris');
      } else {
        toast.success('Retiré des favoris');
      }
      loadFavoris(); // Recharger la liste
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur');
    },
  });

  useEffect(() => {
    loadFavoris();
  }, [loadFavoris]);

  const toggle = useCallback(
    (produitId: number) => toggleMutation.execute(produitId),
    [toggleMutation]
  );

  const isFavorite = useCallback(
    (produitId: number) => {
      return favoris.some((f) => f.produit_id === produitId);
    },
    [favoris]
  );

  return {
    favoris,
    loading,
    toggle,
    isFavorite,
    refresh: loadFavoris,
    toggleLoading: toggleMutation.loading,
  };
}
