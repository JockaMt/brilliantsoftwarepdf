import { Header } from "@/components/header";
import { H1 } from "@/components/titles/h1.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { LoaderCircleIcon, Instagram, MessageCircle, Globe, Youtube, Mail, ExternalLink } from "lucide-react";
import capitalize from "@/utils/capitalize"
import { getVersion } from "@tauri-apps/api/app";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { UserSettings } from "../@types/interfaces/settings";
import { SocialMediaEditor } from "../components/SocialMediaEditor";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";

export default function (): ReactElement {
  const { t } = useTranslation()
  const [infos, setInfos] = useState<UserSettings | null>(null);
  const [version, setVersion] = useState<string>("");
  const [isSocialEditorOpen, setIsSocialEditorOpen] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);

  // Função para gerar links das redes sociais
  const generateSocialLink = (type: string, value: string): string => {
    if (!value) return '';
    
    switch (type) {
      case 'instagram':
        const username = value.replace(/[@]/g, '').replace(/.*instagram\.com\//, '').replace(/\/$/, '');
        return `https://instagram.com/${username}`;
      case 'website':
        if (value.startsWith('http://') || value.startsWith('https://')) {
          return value;
        }
        return `https://${value}`;
      case 'youtube':
        if (value.includes('youtube.com') || value.includes('youtu.be')) {
          return value.startsWith('http') ? value : `https://${value}`;
        }
        // Se é apenas um nome de canal
        if (!value.includes('/')) {
          return `https://youtube.com/c/${value}`;
        }
        return `https://${value}`;
      case 'email':
        return `mailto:${value}`;
      case 'whatsapp':
        const phone = value.replace(/\D/g, ''); // Remove caracteres não numéricos
        return `https://wa.me/${phone}`;
      default:
        return '';
    }
  };

  // Função para abrir link externo
  const openExternalLink = async (url: string) => {
    if (url) {
      try {
        await invoke('open_external_url', { url });
      } catch (error) {
        console.error('Erro ao abrir link:', error);
        // Fallback para window.open se o comando Tauri falhar
        window.open(url, '_blank');
      }
    }
  };

  const loadUserImage = async (): Promise<string | null> => {
    try {
      const imageData: number[] | null = await invoke('get_user_image');
      
      if (imageData && imageData.length > 0) {
        // Converter array de bytes para Blob
        const uint8Array = new Uint8Array(imageData);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setUserImageUrl(url);
        return url;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar imagem do usuário:', error);
      return null;
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await invoke<UserSettings>("get_settings");
      setInfos(settings);
      
      // Carregar imagem do usuário
      const imageUrl = await loadUserImage();
      setUserImageUrl(imageUrl);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  useEffect(() => {
    getVersion().then((e) => setVersion(e));
    loadSettings();
  }, []);

  // Recarregar configurações quando a janela volta ao foco
  useEffect(() => {
    const handleFocus = () => {
      loadSettings();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (!infos) return <div className="flex flex-1 justify-center items-center gap-2"><LoaderCircleIcon className="animate-spin" size={15}/><span>{t("general.loading")}</span></div>;

  return (
    <div>
      <div className={"flex-col bg-muted h-full min-h-screen flex"}>
        <Header back name={t("general.profile")} />
        <div className={"relative flex h-full bg-white rounded-md m-3 flex-row p-3"}>
          <div className="flex flex-1 flex-col items-center space-y-5">
            <div className="my-7">
              <ImageUploader
                currentImageUrl={userImageUrl || infos.image_path || undefined}
                onImageUploaded={(imageUrl) => {
                  setUserImageUrl(imageUrl);
                  // Não recarregar todas as configurações, apenas atualizar a URL da imagem
                }}
                size="lg"
              />
            </div>
            <H1 side={'center'} text={capitalize(infos.name) || t("info.default_name")} />
            <div className="text-sm text-gray-500 text-center">
              <p>Email: {infos.email || t("general.not_informed")}</p>
              <p>Paleta: {infos.pallet || "classic"}</p>
            </div>
            <Separator className="m-3" />
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-4 w-full">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {t("info.social_media")}
                      </CardTitle>
                      <CardDescription>
                        {t("info.social_media_desc")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSocialEditorOpen(true)}
                    >
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        <span className="font-medium">Instagram:</span>
                      </div>
                      {infos.instagram_username ? (
                        <button
                          onClick={() => openExternalLink(generateSocialLink('instagram', infos.instagram_username))}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          @{infos.instagram_username}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-600">{t("general.not_informed")}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-medium">WhatsApp:</span>
                      </div>
                      {infos.phone_number ? (
                        <button
                          onClick={() => openExternalLink(generateSocialLink('whatsapp', infos.phone_number))}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {infos.phone_number}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-600">{t("general.not_informed")}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">Website:</span>
                      </div>
                      {infos.website_url ? (
                        <button
                          onClick={() => openExternalLink(generateSocialLink('website', infos.website_url))}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate ml-2 max-w-[200px]"
                          title={infos.website_url}
                        >
                          {infos.website_url}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-600">{t("general.not_informed")}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Youtube className="h-4 w-4" />
                        <span className="font-medium">YouTube:</span>
                      </div>
                      {infos.youtube_channel ? (
                        <button
                          onClick={() => openExternalLink(generateSocialLink('youtube', infos.youtube_channel))}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate ml-2 max-w-[200px]"
                          title={infos.youtube_channel}
                        >
                          {infos.youtube_channel}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-600">{t("general.not_informed")}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">Email:</span>
                      </div>
                      {infos.email ? (
                        <button
                          onClick={() => openExternalLink(generateSocialLink('email', infos.email))}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate ml-2 max-w-[200px]"
                          title={infos.email}
                        >
                          {infos.email}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-600">{t("general.not_informed")}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("settings.settings")}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.settings_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t("item.name")}:</span>
                      <span className="text-sm text-gray-600">{infos.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{t("info.path")}:</span>
                      <span className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                        {infos.save_path || t("general.system_default")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Paleta:</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {infos.pallet || "classic"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{t("general.last_update")}:</span>
                      <span className="text-xs text-gray-600">
                        {infos.updated_at ? new Date(infos.updated_at).toLocaleString('pt-BR') : t("general.not_informed")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("info.info")}
                  </CardTitle>
                  <CardDescription>
                    {t("info.info_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t("info.version")}:</span>
                      <span className="text-sm text-gray-600">{version}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t("info.dev")}:</span>
                      <span className="text-sm text-gray-600">jockamt</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t("general.user_id")}:</span>
                      <span className="text-sm text-gray-600">{infos.id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{t("general.created_at")}:</span>
                      <span className="text-xs text-gray-600">
                        {infos.created_at ? new Date(infos.created_at).toLocaleString('pt-BR') : t("general.not_informed")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Popup de edição de redes sociais */}
      <SocialMediaEditor
        isOpen={isSocialEditorOpen}
        onClose={() => setIsSocialEditorOpen(false)}
        onSave={loadSettings}
      />
    </div>
  )
};