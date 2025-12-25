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
    
    // Log pour debug en développement
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[API Client] Configuration:', {
        baseURL: this.baseURL,
        timeout: this.timeout,
        timeoutSeconds: this.timeout / 1000,
      });
    }
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
    // Si l'endpoint commence par /, on le concatène avec baseURL
    // Sinon, on utilise new URL qui gère les chemins relatifs
    let fullUrl: string;
    if (endpoint.startsWith('/')) {
      // Concaténer avec baseURL en préservant le pathname
      const baseUrlObj = new URL(this.baseURL);
      const basePath = baseUrlObj.pathname.endsWith('/') 
        ? baseUrlObj.pathname.slice(0, -1) 
        : baseUrlObj.pathname;
      fullUrl = `${baseUrlObj.origin}${basePath}${endpoint}`;
    } else {
      // Chemin relatif, utiliser new URL
      fullUrl = new URL(endpoint, this.baseURL).toString();
    }

    const url = new URL(fullUrl);

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

    // Log pour débogage (à retirer en production)
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Request URL:', url.toString());
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
   * Retry avec backoff exponentiel
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Ne pas retry pour les erreurs 4xx (sauf 408 timeout)
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 408) {
          throw error;
        }
        
        // Si c'est le dernier essai, throw l'erreur
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Attendre avant de réessayer (backoff exponentiel)
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Effectue une requête avec timeout et retry
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    retry: boolean = true
  ): Promise<Response> {
    const fetchFn = async (): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const startTime = Date.now();
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        // Si la réponse n'est pas OK mais n'est pas une erreur réseau, ne pas retry
        if (!response.ok && response.status >= 400 && response.status < 500 && response.status !== 408) {
          clearTimeout(timeoutId);
          return response;
        }
        
        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // Gérer les erreurs d'abandon (timeout)
        if (
          error.name === 'AbortError' || 
          error.name === 'TimeoutError' ||
          error.code === 23 || // TIMEOUT_ERR
          error.message?.includes('timeout') ||
          error.message?.includes('aborted')
        ) {
          // Vérifier si c'est vraiment un timeout ou si le backend n'est pas accessible
          const isNetworkError = error.message?.includes('Failed to fetch') || 
                                 error.message?.includes('NetworkError') ||
                                 error.message?.includes('Network request failed');
          
          if (isNetworkError) {
            throw {
              message: `Impossible de se connecter au serveur backend sur ${this.baseURL}. Vérifiez que le serveur Laravel est démarré (php artisan serve).`,
              status: 0,
              originalError: error,
            };
          }
          
          throw {
            message: `La requête a expiré après ${this.timeout}ms (${this.timeout / 1000}s). Le backend ne répond pas assez rapidement. Vérifiez que le serveur Laravel est démarré et fonctionne correctement.`,
            status: 408,
            originalError: error,
          };
        }
        
        // Vérifier si c'est une erreur réseau (backend non accessible)
        if (
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') ||
          error.message?.includes('Network request failed')
        ) {
          throw {
            message: `Impossible de se connecter au serveur backend sur ${this.baseURL}. Vérifiez que le serveur Laravel est démarré (php artisan serve).`,
            status: 0,
            originalError: error,
          };
        }
        
        throw {
          message: error.message || 'Erreur de connexion. Vérifiez votre connexion internet.',
          status: 0,
          originalError: error,
        };
      }
    };

    // Utiliser retry uniquement pour les requêtes GET et POST (pas pour DELETE/PUT)
    if (retry && (options.method === 'GET' || options.method === 'POST' || !options.method)) {
      return this.retryWithBackoff(fetchFn, 2, 1000);
    }
    
    return fetchFn();
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
