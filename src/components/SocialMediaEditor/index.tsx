import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { UserSettings } from "../../@types/interfaces/settings";

// Função helper para recarregar a página atual
const reloadCurrentPage = () => {
  // Usar setTimeout para dar tempo ao toast aparecer antes do reload
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

interface SocialMediaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const SocialMediaEditor = ({ isOpen, onClose, onSave }: SocialMediaEditorProps) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [formData, setFormData] = useState({
    instagram_username: "",
    website_url: "",
    youtube_channel: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar configurações quando o popup abrir
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const currentSettings = await invoke<UserSettings>("get_settings");
      setSettings(currentSettings);
      setFormData({
        instagram_username: currentSettings.instagram_username || "",
        website_url: currentSettings.website_url || "",
        youtube_channel: currentSettings.youtube_channel || "",
        email: currentSettings.email || ""
      });
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsLoading(true);
    try {
      const updatedSettings: UserSettings = {
        ...settings,
        instagram_username: formData.instagram_username.trim(),
        website_url: formData.website_url.trim(),
        youtube_channel: formData.youtube_channel.trim(),
        email: formData.email.trim()
      };

      await invoke("save_settings_command", { settings: updatedSettings });
      toast.success("Redes sociais atualizadas com sucesso!");
      onSave?.();
      onClose();
      reloadCurrentPage();
    } catch (error) {
      console.error("Erro ao salvar redes sociais:", error);
      toast.error("Erro ao salvar redes sociais");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Redes Sociais</DialogTitle>
          <DialogDescription>
            Atualize suas informações de contato e redes sociais
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram_username}
              onChange={(e) => handleInputChange("instagram_username", e.target.value)}
              placeholder="Seu username do Instagram (sem @)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website_url}
              onChange={(e) => handleInputChange("website_url", e.target.value)}
              placeholder="https://seusite.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              value={formData.youtube_channel}
              onChange={(e) => handleInputChange("youtube_channel", e.target.value)}
              placeholder="https://youtube.com/seu-canal"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {t("general.cancel")}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : t("general.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
