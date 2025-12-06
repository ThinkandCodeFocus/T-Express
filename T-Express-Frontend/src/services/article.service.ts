/**
 * Service Articles (Admin)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Article } from '@/types/api.types';

export const articleService = {
  /**
   * Récupérer la liste des articles
   */
  async getListe(page: number = 1, perPage: number = 20, categorie?: string): Promise<any> {
    return apiClient.post(
      API_CONFIG.endpoints.admin.articles.liste,
      { page, per_page: perPage, categorie },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer le détail d'un article
   */
  async getDetail(id: number): Promise<Article> {
    const response = await apiClient.post<{ article: Article }>(
      API_CONFIG.endpoints.admin.articles.detail,
      { article_id: id },
      { requiresAuth: true }
    );
    return response.article;
  },

  /**
   * Créer un article
   */
  async creer(data: Partial<Article>, image?: File): Promise<Article> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (image) {
      formData.append('image', image);
    }

    const response = await apiClient.upload<{ article: Article }>(
      API_CONFIG.endpoints.admin.articles.creer,
      formData,
      { requiresAuth: true }
    );
    return response.article;
  },

  /**
   * Modifier un article
   */
  async modifier(id: number, data: Partial<Article>, image?: File): Promise<Article> {
    const formData = new FormData();
    formData.append('article_id', id.toString());
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (image) {
      formData.append('image', image);
    }

    const response = await apiClient.upload<{ article: Article }>(
      API_CONFIG.endpoints.admin.articles.modifier,
      formData,
      { requiresAuth: true }
    );
    return response.article;
  },

  /**
   * Supprimer un article
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.articles.supprimer,
      { article_id: id },
      { requiresAuth: true }
    );
  },
};
