import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LicenseActivationProps {
  onActivationSuccess?: () => void;
}

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

const LicenseActivation: React.FC<LicenseActivationProps> = ({ onActivationSuccess }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

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

  useEffect(() => {
    checkActivationStatus();
  }, []);

  const checkActivationStatus = async () => {
    try {
      const activated = await invoke<boolean>('is_license_activated');
      setIsActivated(activated);
      
      if (activated) {
        await validateLicense();
        await getLicenseInfo();
      }
    } catch (error) {
      console.error('Erro ao verificar ativação:', error);
    }
  };

  const validateLicense = async () => {
    try {
      const status = await invoke<LicenseStatus>('validate_current_license');
      setLicenseStatus(status);
    } catch (error) {
      console.error('Erro na validação:', error);
      setMessage('Erro ao validar licença');
    }
  };

  const getLicenseInfo = async () => {
    try {
      const info = await invoke<LicenseInfo>('get_license_info');
      setLicenseInfo(info);
    } catch (error) {
      console.error('Erro ao obter informações da licença:', error);
    }
  };

  const activateLicense = async () => {
    if (!licenseKey.trim()) {
      setMessage('Por favor, insira uma chave de licença válida');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      await invoke<string>('activate_license', { 
        licenseKey: licenseKey.trim() 
      });
      
      // Exibir toast de sucesso
      toast.success('🎉 Produto ativado com sucesso!', {
        description: 'Sua licença foi ativada e você já pode usar o aplicativo.',
        duration: 3000,
      });

      // Aguardar um pouco para o usuário ver o toast, depois redirecionar
      setTimeout(() => {
        setIsActivated(true);
        if (onActivationSuccess) {
          onActivationSuccess();
        }
      }, 1500);
      
    } catch (error: any) {
      setMessage(extractErrorMessage(error, 'Erro na ativação'));
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const renewLicense = async () => {
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const result = await invoke<string>('renew_license');
      setMessage(result);
      setIsError(false);
      await checkActivationStatus();
    } catch (error: any) {
      setMessage(extractErrorMessage(error, 'Erro na renovação'));
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const deactivateLicense = async () => {
    if (!window.confirm('Tem certeza que deseja desativar o produto?')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const result = await invoke<string>('deactivate_license');
      setMessage(result);
      setIsError(false);
      setIsActivated(false);
      setLicenseStatus(null);
      setLicenseInfo(null);
    } catch (error: any) {
      setMessage(extractErrorMessage(error, 'Erro na desativação'));
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isActivated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Ativação do Produto</CardTitle>
            <CardDescription className="text-gray-600">
              Este produto precisa ser ativado para ser usado. Insira sua chave de licença abaixo:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="license-key" className="text-sm font-medium text-gray-700">
                Chave de Licença
              </Label>
              <Input
                id="license-key"
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                maxLength={29}
                disabled={loading}
                className="font-mono text-center tracking-widest"
              />
            </div>

            <Button 
              onClick={activateLicense}
              disabled={loading || !licenseKey.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ativando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Ativar Produto
                </>
              )}
            </Button>

            {message && (
              <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                isError 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                {isError ? (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Status da Licença</h1>
          <p className="text-gray-600">Gerencie e monitore sua licença do produto</p>
        </div>

        {licenseStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Status Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                licenseStatus.status === 'valid' 
                  ? 'bg-green-100 text-green-800' 
                  : licenseStatus.status === 'near_expiration'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {licenseStatus.status === 'valid' ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                {licenseStatus.message}
              </div>
              
              {licenseStatus.days_remaining && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800 font-medium">
                      Sua licença expira em {licenseStatus.days_remaining} dias
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {licenseInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Licença</CardTitle>
              <CardDescription>Informações completas sobre sua licença ativa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Chave de Licença</Label>
                    <p className="mt-1 font-mono text-sm bg-gray-100 px-3 py-2 rounded border">
                      {licenseInfo.key}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Produto</Label>
                    <p className="mt-1 text-sm text-gray-900">{licenseInfo.product_id}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        licenseInfo.premium 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {licenseInfo.premium ? 'Premium' : 'Basic'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data de Expiração</Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(licenseInfo.expires).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Dias Restantes</Label>
                    <p className="mt-1 text-sm text-gray-900">{licenseInfo.days_until_expiry}</p>
                  </div>
                  
                  {licenseInfo.last_activation && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Última Ativação</Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(licenseInfo.last_activation).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>Gerencie sua licença com as opções abaixo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={validateLicense}
                disabled={loading}
                variant="outline"
                className="flex-1 min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Validar Licença
                  </>
                )}
              </Button>
              
              <Button 
                onClick={renewLicense}
                disabled={loading}
                className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Renovando...
                  </>
                ) : (
                  'Renovar Licença'
                )}
              </Button>
              
              <Button 
                onClick={deactivateLicense}
                disabled={loading}
                variant="destructive"
                className="flex-1 min-w-[140px]"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Desativar
              </Button>
            </div>

            {message && (
              <div className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${
                isError 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                {isError ? (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LicenseActivation;
