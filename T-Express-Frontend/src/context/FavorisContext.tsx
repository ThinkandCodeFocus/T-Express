/**
 * Context des favoris global
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useFavoris } from '@/hooks/useFavoris';
import type { Favori } from '@/types/api.types';

interface FavorisContextType {
  favoris: Favori[];
  loading: boolean;
  toggle: (produitId: number) => Promise<any>;
  isFavorite: (produitId: number) => boolean;
  refresh: () => Promise<void>;
  toggleLoading: boolean;
}

const FavorisContext = createContext<FavorisContextType | undefined>(undefined);

export function FavorisProvider({ children }: { children: ReactNode }) {
  const favoris = useFavoris();

  return <FavorisContext.Provider value={favoris}>{children}</FavorisContext.Provider>;
}

export function useFavorisContext() {
  const context = useContext(FavorisContext);
  if (context === undefined) {
    throw new Error('useFavorisContext must be used within a FavorisProvider');
  }
  return context;
}
