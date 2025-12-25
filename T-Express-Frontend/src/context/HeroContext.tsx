/**
 * Contexte pour partager les données Hero entre tous les composants
 * Évite les requêtes multiples au même endpoint avec un cache simple
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { heroService, type HeroSectionsResponse } from '@/services/hero.service';

interface HeroContextType {
  data: HeroSectionsResponse | null;
  loading: boolean;
  error: any;
  refresh: () => Promise<void>;
}

const HeroContext = createContext<HeroContextType | undefined>(undefined);

// Cache simple en mémoire (durée de vie: session)
const CACHE_KEY = 'hero_data_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: HeroSectionsResponse;
  timestamp: number;
}

export function HeroProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<HeroSectionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const loadingRef = useRef(false);

  const loadHeroData = useCallback(async () => {
    // Éviter les requêtes multiples simultanées
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      // Vérifier le cache
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const cacheEntry: CacheEntry = JSON.parse(cached);
          const now = Date.now();
          
          // Si le cache est encore valide, l'utiliser
          if (now - cacheEntry.timestamp < CACHE_DURATION) {
            setData(cacheEntry.data);
            setLoading(false);
            loadingRef.current = false;
            return;
          }
        } catch (e) {
          // Cache invalide, continuer avec la requête
        }
      }

      // Charger depuis l'API
      const response = await heroService.getListe();
      setData(response);

      // Mettre en cache
      try {
        const cacheEntry: CacheEntry = {
          data: response,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
      } catch (e) {
        // Ignorer les erreurs de cache (sessionStorage peut être désactivé)
        console.warn('Impossible de mettre en cache les données hero', e);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des données hero', err);
      setError(err);
      
      // En cas d'erreur, essayer d'utiliser le cache même s'il est expiré
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const cacheEntry: CacheEntry = JSON.parse(cached);
          setData(cacheEntry.data);
        } catch (e) {
          // Cache invalide, utiliser des données vides
          setData({
            sections: [],
            grouped: {
              carousel: [],
              side_cards: [],
              promo_banners: [],
              countdown: [],
            },
          });
        }
      } else {
        // Pas de cache, utiliser des données vides
        setData({
          sections: [],
          grouped: {
            carousel: [],
            side_cards: [],
            promo_banners: [],
            countdown: [],
          },
        });
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadHeroData();
  }, [loadHeroData]);

  return (
    <HeroContext.Provider value={{ data, loading, error, refresh: loadHeroData }}>
      {children}
    </HeroContext.Provider>
  );
}

export function useHeroContext() {
  const context = useContext(HeroContext);
  if (context === undefined) {
    throw new Error('useHeroContext must be used within a HeroProvider');
  }
  return context;
}

