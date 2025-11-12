/**
 * Hooks spécifiques pour l'authentification
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { clientService } from '@/services/client.service';
import type { Client, LoginData, RegisterData } from '@/types/api.types';
import { useMutation } from './useApi';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState<Client | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis le localStorage au montage
  useEffect(() => {
    const loadUser = () => {
      const userData = authService.getUserData();
      const isAuth = authService.isAuthenticated();
      
      setUser(userData);
      setIsAuthenticated(isAuth);
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login
  const loginMutation = useMutation(authService.login, {
    onSuccess: (data) => {
      setUser(data.client);
      setIsAuthenticated(true);
      toast.success('Connexion réussie !');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur de connexion');
    },
  });

  // Register
  const registerMutation = useMutation(authService.register, {
    onSuccess: (data) => {
      setUser(data.client);
      setIsAuthenticated(true);
      toast.success('Inscription réussie !');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur d\'inscription');
    },
  });

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de déconnexion');
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const userData = await clientService.getProfil();
      setUser(userData);
      authService.saveUserData(userData);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil', error);
    }
  }, []);

  const login = useCallback((data: LoginData) => {
    return loginMutation.execute(data);
  }, [loginMutation]);

  const register = useCallback((data: RegisterData) => {
    return registerMutation.execute(data);
  }, [registerMutation]);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
    loginLoading: loginMutation.loading,
    registerLoading: registerMutation.loading,
  };
}
