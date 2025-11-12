/**
 * Service Articles (Blog)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { 
  Article, 
  CategorieArticle, 
  AjouterCommentaireData,
  PaginatedResponse 
} from '@/types/api.types';

export const articleService = {
  /**
   * Liste des articles avec pagination
   */
  async getListe(params?: {
    categorie?: string;
    recherche?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Article>> {
    const response = await apiClient.post<PaginatedResponse<Article>>(
      API_CONFIG.endpoints.articles?.liste || '/api/articles/liste',
      params
    );
    return response;
  },

  /**
   * Détail d'un article par slug
   */
  async getDetail(slug: string): Promise<Article> {
    const response = await apiClient.post<{ article: Article }>(
      API_CONFIG.endpoints.articles?.detail || '/api/articles/detail',
      { slug }
    );
    return response.article;
  },

  /**
   * Articles récents
   */
  async getRecents(limit: number = 5): Promise<Article[]> {
    const response = await apiClient.post<{ articles: Article[] }>(
      API_CONFIG.endpoints.articles?.recents || '/api/articles/recents',
      { limit }
    );
    return response.articles;
  },

  /**
   * Articles populaires
   */
  async getPopulaires(limit: number = 5): Promise<Article[]> {
    const response = await apiClient.post<{ articles: Article[] }>(
      API_CONFIG.endpoints.articles?.populaires || '/api/articles/populaires',
      { limit }
    );
    return response.articles;
  },

  /**
   * Catégories d'articles
   */
  async getCategories(): Promise<CategorieArticle[]> {
    const response = await apiClient.post<{ categories: CategorieArticle[] }>(
      API_CONFIG.endpoints.articles?.categories || '/api/articles/categories'
    );
    return response.categories;
  },

  /**
   * Rechercher des articles
   */
  async rechercher(query: string, perPage: number = 10): Promise<PaginatedResponse<Article>> {
    const response = await apiClient.post<PaginatedResponse<Article>>(
      API_CONFIG.endpoints.articles?.rechercher || '/api/articles/rechercher',
      { q: query, per_page: perPage }
    );
    return response;
  },

  /**
   * Ajouter un commentaire
   */
  async ajouterCommentaire(data: AjouterCommentaireData): Promise<any> {
    const response = await apiClient.post(
      API_CONFIG.endpoints.articles?.commentaire || '/api/articles/commentaire',
      data
    );
    return response;
  },
};
