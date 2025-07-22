import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Upload, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded?: (imageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  size = 'md'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading, imageUrl, clearImage } = useImageUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadImage(file);
      const newImageUrl = imageUrl || URL.createObjectURL(file);
      setPreviewUrl(newImageUrl);
      onImageUploaded?.(newImageUrl);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar imagem';
      toast.error(errorMessage);
    }
  };

  const handleRemoveImage = async () => {
    try {
      // Salvar null no banco para remover a imagem
      await invoke('save_user_image', { imageData: [] });
      setPreviewUrl(null);
      clearImage();
      onImageUploaded?.('');
      toast.success('Imagem removida com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover imagem');
    }
  };

  const displayUrl = previewUrl || imageUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={displayUrl || ''} alt="Foto do usuário" />
          <AvatarFallback className="bg-muted">
            <User className="h-1/2 w-1/2" />
          </AvatarFallback>
        </Avatar>
        
        {displayUrl && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Carregando...' : 'Escolher Foto'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!displayUrl && (
        <p className="text-xs text-muted-foreground text-center">
          JPG, PNG ou WebP. Máximo 5MB.
        </p>
      )}
    </div>
  );
};
