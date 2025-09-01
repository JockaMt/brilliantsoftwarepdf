import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Cache persistente para evitar verificações desnecessárias após refresh
const CACHE_KEY = 'license_verification_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface LicenseCache {
  timestamp: number;
  isActivated: boolean;
  licenseStatus: LicenseStatus | null;
  licenseInfo: LicenseInfo | null;
  alreadyVerified: boolean;
}

// flag por processo: validação executada apenas uma vez por execução do app
// ALTERAÇÃO: Validação de licença agora é feita APENAS na inicialização do software
// Removida a verificação automática periódica (que acontecia a cada 30 minutos)
// NOVA FUNCIONALIDADE: Cache persistente para evitar verificações após refresh da página
let moduleAlreadyVerified = false;

interface LicenseStatus {
  is_valid: boolean;
  status: string;
  message: string;
  days_remaining?: number;
}

interface LicenseInfo {
  key: string;
  machine_code: string;
  expires: string;
  product_id: string;
  premium: boolean;
  max_offline_days: number;
  last_activation?: string;
  days_until_expiry: number;
}

export const useLicense = () => {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [alreadyVerified, setAlreadyVerified] = useState<boolean>(false);

  // Funções para gerenciar cache persistente
  const saveToCache = useCallback((data: Omit<LicenseCache, 'timestamp'>) => {
    const cacheData: LicenseCache = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  }, []);

  const loadFromCache = useCallback((): LicenseCache | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: LicenseCache = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar se o cache ainda é válido
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  // Função auxiliar para extrair mensagem de erro
  const extractErrorMessage = (error: any, defaultPrefix: string): string => {
    try {
      const errorStr = error.toString();
      const jsonMatch = errorStr.match(/\{.*\}/);
      if (jsonMatch) {
        const errorJson = JSON.parse(jsonMatch[0]);
        if (errorJson.message) {
          return errorJson.message;
        }
      }
    } catch {
      // Se falhar ao parsear JSON, usar mensagem original
    }
    return `${defaultPrefix}: ${error}`;
  };

  const checkActivationStatus = useCallback(async () => {
    try {
      setLoading(true);
      const activated = await invoke<boolean>('is_license_activated');
      setIsActivated(activated);
      
      let currentLicenseStatus = null;
      let currentLicenseInfo = null;
      
      if (activated) {
        const status = await invoke<LicenseStatus>('validate_current_license');
        setLicenseStatus(status);
        currentLicenseStatus = status;
        
        const info = await invoke<LicenseInfo>('get_license_info');
        setLicenseInfo(info);
        currentLicenseInfo = info;
      }
      
      // Salvar no cache após verificação bem-sucedida
      saveToCache({
        isActivated: activated,
        licenseStatus: currentLicenseStatus,
        licenseInfo: currentLicenseInfo,
        alreadyVerified: true
      });
      
      setError('');
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro ao verificar ativação'));
    } finally {
      setLoading(false);
    }
  }, [saveToCache]);

  const validateLicense = useCallback(async () => {
    try {
      const status = await invoke<LicenseStatus>('validate_current_license');
      setLicenseStatus(status);
      return status;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro na validação'));
      throw err;
    }
  }, []);

  const getLicenseInfo = useCallback(async () => {
    try {
      const info = await invoke<LicenseInfo>('get_license_info');
      setLicenseInfo(info);
      return info;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro ao obter informações'));
      throw err;
    }
  }, []);

  const activateLicense = useCallback(async (licenseKey: string) => {
    try {
      setLoading(true);
      setError('');
      const result = await invoke<string>('activate_license', { 
        licenseKey: licenseKey.trim() 
      });
      
      await checkActivationStatus();
      clearCache(); // Limpar cache após ativação para forçar nova verificação
      return result;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro na ativação'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkActivationStatus, clearCache]);

  const renewLicense = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await invoke<string>('renew_license');
      
      await checkActivationStatus();
      clearCache(); // Limpar cache após renovação para forçar nova verificação
      return result;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro na renovação'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkActivationStatus, clearCache]);

  const deactivateLicense = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await invoke<string>('deactivate_license');
      setAlreadyVerified(false);
      setIsActivated(false);
      setLicenseStatus(null);
      setLicenseInfo(null);
      clearCache(); // Limpar cache após desativação
      return result;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro na desativação'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearCache]);

  const getMachineCode = useCallback(async () => {
    try {
      const code = await invoke<string>('get_machine_code');
      return code;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro ao obter código da máquina'));
      throw err;
    }
  }, []);

  const isValid = licenseStatus?.is_valid ?? false;
  const canUseApp = isActivated && isValid;

  useEffect(() => {
    // Primeiro, tentar carregar dados do cache
    const cachedData = loadFromCache();
    if (cachedData && cachedData.alreadyVerified) {
      // Usar dados do cache se disponíveis e válidos
      setIsActivated(cachedData.isActivated);
      setLicenseStatus(cachedData.licenseStatus);
      setLicenseInfo(cachedData.licenseInfo);
      setAlreadyVerified(true);
      setLoading(false);
      moduleAlreadyVerified = true;
      return;
    }

    // Se não há cache válido, executa verificação apenas na primeira inicialização do processo
    let cancelled = false;

    (async () => {
      if (!moduleAlreadyVerified) {
        // Mostrar loading enquanto faz a verificação inicial
        if (!cancelled) setLoading(true);
        try {
          await checkActivationStatus();
        } catch (e) {
          // Erro já tratado dentro de checkActivationStatus
        } finally {
          // Marcar que já foi verificado somente após a tentativa
          moduleAlreadyVerified = true;
          if (!cancelled) {
            setAlreadyVerified(true);
            setLoading(false);
          }
        }
      } else {
        // já verificado nesta execução
        if (!cancelled) {
          setAlreadyVerified(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkActivationStatus, loadFromCache]);

  return {
    isActivated,
    licenseStatus,
    licenseInfo,
    loading,
    error,
    isValid,
    canUseApp,
    activateLicense,
    renewLicense,
    deactivateLicense,
    validateLicense,
    getLicenseInfo,
    getMachineCode,
    checkActivationStatus,
    clearError: () => setError(''),
    alreadyVerified,
  };
};
