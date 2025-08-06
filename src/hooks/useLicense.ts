import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

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
      
      if (activated) {
        await validateLicense();
        await getLicenseInfo();
      }
      setError('');
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro ao verificar ativação'));
    } finally {
      setLoading(false);
    }
  }, []);

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
      return result;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro na ativação'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkActivationStatus]);

  const renewLicense = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await invoke<string>('renew_license');
      
      await checkActivationStatus();
      return result;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro na renovação'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkActivationStatus]);

  const deactivateLicense = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await invoke<string>('deactivate_license');
      
      setIsActivated(false);
      setLicenseStatus(null);
      setLicenseInfo(null);
      return result;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erro na desativação'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    checkActivationStatus();
    
    // Verificar licença a cada 30 minutos
    const interval = setInterval(() => {
      if (isActivated) {
        validateLicense().catch(() => {
          // Silenciar erros de verificação automática
        });
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isActivated, checkActivationStatus, validateLicense]);

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
  };
};
