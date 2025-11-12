/**
 * Service d'authentification
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type {
  RegisterData,
  LoginData,
  AuthResponse,
  Client,
} from '@/types/api.types';

export const authService = {
  /**
   * Inscription d'un nouveau client
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.endpoints.auth.register,
      data
    );

    // Sauvegarder le token
    if (response.token) {
      apiClient.setAuthToken(response.token);
      this.saveUserData(response.client);
    }

    return response;
  },

  /**
   * Connexion d'un client
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.endpoints.auth.login,
      data
    );

    // Sauvegarder le token
    if (response.token) {
      apiClient.setAuthToken(response.token);
      this.saveUserData(response.client);
    }

    return response;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(
        API_CONFIG.endpoints.auth.logout,
        {},
        { requiresAuth: true }
      );
    } finally {
      // Même en cas d'erreur, nettoyer les données locales
      apiClient.clearAuthToken();
      this.clearUserData();
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Récupérer les données utilisateur du localStorage
   */
  getUserData(): Client | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  /**
   * Sauvegarder les données utilisateur
   */
  saveUserData(client: Client): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_data', JSON.stringify(client));
  },

  /**
   * Effacer les données utilisateur
   */
  clearUserData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user_data');
  },
};
