import { apiClient } from "@/lib/api-client";

export interface Retrait {
  id: number;
  admin_email: string;
  montant: number;
  statut: "en_attente" | "confirmé" | "refusé";
  note?: string;
  date_confirmation?: string;
  created_at: string;
}

export interface SoldeInfo {
  total_ventes: number;
  total_retraits: number;
  retraits_en_attente: number;
  solde_disponible: number;
}

export interface DashboardSuperAdmin {
  total_ventes: number;
  total_retraits_confirmes: number;
  total_retraits_en_attente: number;
  solde_compte: number;
}

export interface PaiementSuperAdmin {
  id: number;
  commande_id: number;
  montant: number;
  methode: string;
  statut: string;
  reference?: string;
  client?: {
    nom: string;
    prenom: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

// Service pour l'admin (demandes de retrait)
export const retraitService = {
  getSolde: async (): Promise<SoldeInfo> => {
    return await apiClient.post("/admin/retraits/solde", {}, { requiresAuth: true });
  },

  liste: async (): Promise<Retrait[]> => {
    return await apiClient.post("/admin/retraits/liste", {}, { requiresAuth: true });
  },

  creer: async (montant: number, note?: string): Promise<{ message: string; retrait: Retrait }> => {
    return await apiClient.post("/admin/retraits/creer", { montant, note }, { requiresAuth: true });
  },

  annuler: async (id: number): Promise<{ message: string }> => {
    return await apiClient.post("/admin/retraits/annuler", { id }, { requiresAuth: true });
  },
};

// Service pour le super admin
export const superAdminService = {
  login: async (email: string, password: string): Promise<{ message: string; user: any; token: string }> => {
    return await apiClient.post("/super-admin/login", { email, password });
  },

  dashboard: async (): Promise<DashboardSuperAdmin> => {
    return await apiClient.post("/super-admin/dashboard", {}, { requiresAuth: true });
  },

  paiements: async (): Promise<PaiementSuperAdmin[]> => {
    return await apiClient.post("/super-admin/paiements", {}, { requiresAuth: true });
  },

  retraits: async (): Promise<Retrait[]> => {
    return await apiClient.post("/super-admin/retraits", {}, { requiresAuth: true });
  },

  confirmerRetrait: async (id: number): Promise<{ message: string; retrait: Retrait }> => {
    return await apiClient.post("/super-admin/retraits/confirmer", { id }, { requiresAuth: true });
  },

  refuserRetrait: async (id: number, note?: string): Promise<{ message: string; retrait: Retrait }> => {
    return await apiClient.post("/super-admin/retraits/refuser", { id, note }, { requiresAuth: true });
  },
};
