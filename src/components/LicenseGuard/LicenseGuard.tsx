import React, { useState } from 'react';
import { useLicense } from '../../hooks/useLicense';
import LicenseActivation from '../LicenseActivation/LicenseActivation';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LicenseGuardProps {
  children: React.ReactNode;
}

const LicenseGuard: React.FC<LicenseGuardProps> = ({ children }) => {
  const { canUseApp, loading, error, isActivated, licenseStatus, alreadyVerified, deactivateLicense } = useLicense();
  const [forceShowApp, setForceShowApp] = useState(false);

  const handleActivationSuccess = () => {
    // Forçar a exibição do aplicativo após ativação bem-sucedida
    setForceShowApp(true);
  };

  const handleDeactivate = async () => {
    const ok = confirm('Deseja desativar a licença neste dispositivo?');
    if (!ok) return;

    try {
      await deactivateLicense();
      // após desativar, forçar mostrar ativação novamente
      setForceShowApp(false);
    } catch (e) {
      console.error('Erro ao desativar licença', e);
      alert('Erro ao desativar licença. Veja o console para detalhes.');
    }
  };

  if (loading && !alreadyVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-lg text-gray-600 font-medium">Verificando licença...</p>
        </div>
      </div>
    );
  }

  // Se houver erro crítico
  if (error && !isActivated && !forceShowApp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Erro na Verificação da Licença</h2>
          <p className="text-red-600 bg-red-50 p-3 rounded border">{error}</p>
          <div className="pt-4">
            <LicenseActivation onActivationSuccess={handleActivationSuccess} />
          </div>
        </div>
      </div>
    );
  }

  // Se não pode usar o app (não ativado ou licença inválida) e não foi forçado a mostrar
  if (!canUseApp && !forceShowApp) {
    return <LicenseActivation onActivationSuccess={handleActivationSuccess} />;
  }

  // Mostrar aviso se a licença está próxima do vencimento
  const showWarning = licenseStatus?.status === 'near_expiration' && licenseStatus.days_remaining;

  return (
    <>
      {/* Botão fixo para desativar licença (apenas quando ativado) */}
      {isActivated && (
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" size="sm" onClick={handleDeactivate}>
            Desativar licença
          </Button>
        </div>
      )}
      {showWarning && (
        <div className="bg-yellow-500 text-white py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-white" />
              <span className="font-medium">
                Sua licença expira em {licenseStatus.days_remaining} dias.
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white text-yellow-600 hover:bg-yellow-50 border-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Renovar agora
            </Button>
          </div>
        </div>
      )}
      
      {/* App funcional */}
      <div className={showWarning ? 'pt-0' : ''}>
        {children}
      </div>
    </>
  );
};

export default LicenseGuard;
