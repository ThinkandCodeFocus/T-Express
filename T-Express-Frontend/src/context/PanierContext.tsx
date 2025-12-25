/**
 * Context du panier global
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePanier } from '@/hooks/usePanier';
import type { PanierContenu, AjouterPanierData } from '@/types/api.types';

interface PanierContextType {
  panier: PanierContenu | null;
  loading: boolean;
  ajouter: (data: AjouterPanierData) => Promise<any>;
  mettreAJour: (lignePanierId: number, quantite: number) => Promise<any>;
  supprimer: (lignePanierId: number) => Promise<any>;
  vider: () => Promise<void>;
  refresh: () => Promise<void>;
  ajoutLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

const PanierContext = createContext<PanierContextType | undefined>(undefined);

export function PanierProvider({ children }: { children: ReactNode }) {
  const panier = usePanier();

  return <PanierContext.Provider value={panier}>{children}</PanierContext.Provider>;
}

export function usePanierContext() {
  const context = useContext(PanierContext);
  if (context === undefined) {
    throw new Error('usePanierContext must be used within a PanierProvider');
  }
  
  // Log pour déboguer
  console.log('usePanierContext - panier:', context.panier);
  console.log('usePanierContext - loading:', context.loading);
  
  return context;
}
