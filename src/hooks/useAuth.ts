import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3030/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no login');
      }

      const data = await response.json();
      const newToken = data.token;
      const userId = data.user?.id;

      // Salvar token e ID do usuário no localStorage
      localStorage.setItem('authToken', newToken);
      if (userId) {
        localStorage.setItem('userId', userId);
        // Salvar também em arquivo oculto via Tauri
        try {
          await invoke('save_user_id', { userId });
        } catch (err) {
          console.warn('Aviso: Não foi possível salvar ID do usuário no arquivo oculto', err);
        }
      }
      
      setToken(newToken);
      setUser(data.user);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    // Limpar arquivo oculto via Tauri
    try {
      await invoke('clear_user_id');
    } catch (err) {
      console.warn('Aviso: Não foi possível limpar ID do usuário do arquivo oculto', err);
    }
    
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    token,
    isLoggedIn: !!token && !!user,
    isLoading,
    error,
    login,
    logout,
  };
};
