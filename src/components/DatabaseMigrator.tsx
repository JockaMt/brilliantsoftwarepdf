import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { Button } from './ui/button';

export const DatabaseMigrator = () => {
  const handleMigrate = async () => {
    try {
      const result = await invoke<string>('migrate_settings_database');
      toast.success(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na migração';
      toast.error(`Erro na migração: ${errorMessage}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <h3 className="font-semibold text-yellow-800 mb-2">Migração do Banco de Dados</h3>
      <p className="text-sm text-yellow-700 mb-3">
        Se você está vendo erros relacionados à coluna image_blob, clique no botão abaixo para migrar o banco de dados.
      </p>
      <Button onClick={handleMigrate} variant="outline" size="sm">
        Migrar Banco de Dados
      </Button>
    </div>
  );
};
