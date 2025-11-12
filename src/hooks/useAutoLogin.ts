import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3030/api';

interface UseAutoLoginProps {
  onAutoLoginSuccess?: () => void;
  onAutoLoginFail?: () => void;
}

export const useAutoLogin = ({ onAutoLoginSuccess, onAutoLoginFail }: UseAutoLoginProps) => {
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Carregar ID do usuário do arquivo oculto
        const userId = await invoke<string | null>('load_user_id');
        
        if (!userId) {
          onAutoLoginFail?.();
          return;
        }

        // Carregar token do localStorage
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          onAutoLoginFail?.();
          return;
        }

        // Verificar se o token ainda é válido
        const response = await fetch(`${API_URL}/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          onAutoLoginSuccess?.();
        } else {
          // Token inválido
          onAutoLoginFail?.();
        }
      } catch (err) {
        console.warn('Erro ao fazer auto-login:', err);
        onAutoLoginFail?.();
      }
    };

    autoLogin();
  }, [onAutoLoginSuccess, onAutoLoginFail]);
};
