/**
 * Client HTTP pour les appels API
 * Gère l'authentification, les erreurs et les intercepteurs
 */

import { API_CONFIG } from '@/config/api.config';

interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  requiresAuth?: boolean;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Récupère le token d'authentification du localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Sauvegarde le token d'authentification
   */
  public setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Supprime le token d'authentification
   */
  public clearAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  /**
   * Construit les headers de la requête
   */
  private buildHeaders(requiresAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Construit l'URL avec les paramètres de query
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(`${key}[]`, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Gère les erreurs de l'API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError = {
        message: 'Une erreur est survenue',
        status: response.status,
      };

      try {
        const data = await response.json();
        errorData = {
          message: data.message || errorData.message,
          errors: data.errors,
          status: response.status,
        };
      } catch (e) {
        // Si la réponse n'est pas du JSON
      }

      // Si 401, déconnecter l'utilisateur
      if (response.status === 401) {
        this.clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      throw errorData;
    }

    // Gérer les réponses vides (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Effectue une requête avec timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          message: 'La requête a expiré. Veuillez réessayer.',
          status: 408,
        };
      }
      throw {
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        status: 0,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Requête GET
   */
  async get<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, requiresAuth = false, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(requiresAuth),
      ...fetchConfig,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requête POST
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, requiresAuth = false, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(requiresAuth),
      body: JSON.stringify(data),
      ...fetchConfig,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requête PUT
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, requiresAuth = false, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: this.buildHeaders(requiresAuth),
      body: JSON.stringify(data),
      ...fetchConfig,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requête DELETE
   */
  async delete<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, requiresAuth = false, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: this.buildHeaders(requiresAuth),
      ...fetchConfig,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Upload de fichiers
   */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, requiresAuth = false, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    // Pour l'upload, ne pas définir Content-Type (le navigateur le fera automatiquement avec boundary)
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: formData,
      ...fetchConfig,
    });

    return this.handleResponse<T>(response);
  }
}

// Instance singleton
export const apiClient = new ApiClient();

// Export du type d'erreur pour l'utiliser dans les composants
export type { ApiError };
