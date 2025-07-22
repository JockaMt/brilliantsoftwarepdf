import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<boolean> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Por favor, selecione apenas arquivos de imagem');
    }

    // Verificar tamanho do arquivo (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }

    setIsUploading(true);
    
    try {
      // Converter arquivo para array de bytes
      const arrayBuffer = await file.arrayBuffer();
      const imageData = Array.from(new Uint8Array(arrayBuffer));
      
      // Salvar no banco de dados
      await invoke('save_user_image', { imageData });
      
      // Criar URL local para preview
      const blob = new Blob([arrayBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const loadUserImage = async (): Promise<string | null> => {
    try {
      const imageData: number[] | null = await invoke('get_user_image');
      
      if (imageData && imageData.length > 0) {
        // Converter array de bytes para Blob
        const uint8Array = new Uint8Array(imageData);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' }); // Assumindo JPEG por padrão
        const url = URL.createObjectURL(blob);
        // Não setamos setImageUrl aqui para evitar efeitos colaterais
        return url;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar imagem do usuário:', error);
      return null;
    }
  };

  const clearImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  };

  return {
    uploadImage,
    loadUserImage,
    clearImage,
    isUploading,
    imageUrl,
  };
};
