import { Header } from "@/components/header";
import { H1 } from "@/components/titles/h1.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { LoaderCircleIcon, Mail, Calendar } from "lucide-react";
import capitalize from "@/utils/capitalize"
import { getVersion } from "@tauri-apps/api/app";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { useUserProfile } from "@/hooks/useUserProfile";
import i18n from "@/i18n";

export default function (): ReactElement {
  const { t } = useTranslation()
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const [infos, setInfos] = useState<Record<string, any>>({});
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then((e) => setVersion(e))
    invoke<Record<string, any>>("get_settings")
      .then((settings) => {
        setInfos(settings);
      });
  }, [])

  if (isLoadingProfile || !profile) return (
    <div className="flex flex-1 justify-center items-center gap-2">
      <LoaderCircleIcon className="animate-spin" size={15}/>
      <span>Carregando perfil...</span>
    </div>
  );

  // Gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(profile.name || 'U');

  return (
    <div>
      <div className={"flex-col bg-muted h-full min-h-screen flex"}>
        <Header back name={t("general.profile")} />
        <div className={"relative flex h-full bg-white rounded-md m-3 flex-row p-3"}>
          <div className="flex flex-1 flex-col items-center space-y-5">
            {/* Avatar do Perfil */}
            <Avatar className="w-30 h-30 bg-primary p-[0.2rem] my-7">
              <AvatarImage className="rounded-full" src={infos.image_path} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Nome do Usuário */}
            <H1 side={'center'} text={capitalize(profile.name) || t("info.default_name")} />
            
            {/* Email */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={18} />
              <span>{profile.email}</span>
            </div>
            
            <Separator className="m-3" />
            
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-4 w-full">
              {/* Card de Informações do Usuário */}
              <Card>
                <CardHeader>
                  <CardTitle>Conta</CardTitle>
                  <CardDescription>Informações da sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="text-sm">
                      <strong>Email:</strong> {profile.email}
                    </li>
                    <li className="text-sm">
                      <strong>Nome:</strong> {profile.name}
                    </li>
                    <li className="text-sm">
                      <strong>Função:</strong> {profile.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                    </li>
                    {profile.createdAt && (
                      <li className="text-sm flex items-center gap-2">
                        <Calendar size={16} />
                        <strong>Membro desde:</strong> {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Card de Redes Sociais */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("info.social_media")}
                  </CardTitle>
                  <CardDescription>
                    {t("info.social_media_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>Instagram: @{infos.instagram_username || "—"}</li>
                    <li>Whatsapp: {infos.phone_number || "—"}</li>
                    <li>Website: {infos.website_url || "—"}</li>
                    <li>Youtube: {infos.youtube_channel || "—"}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Card de Configurações */}
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
                  <ul className="space-y-2 text-sm">
                    <li><strong>Idioma:</strong> {i18n.language === 'pt' ? 'Português' : i18n.language === 'en' ? 'English' : 'Español'}</li>
                    <li className="overflow-hidden text-nowrap"><strong>{t("info.path")}:</strong> {infos.save_path || "—"}
                    </li>
                    <li><strong>Tema:</strong> {document.documentElement.classList.contains('dark') ? 'Escuro' : 'Claro'}</li>
                    <li><strong>Versão Local:</strong> {version}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Card de Informações */}
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
                  <ul className="space-y-2 text-sm">
                    <li><strong>{t("info.version")}:</strong> {version}</li>
                    <li><strong>{t("info.dev")}:</strong> JockaMt</li>
                    <li><strong>{t("info.copy_right")}:</strong> 2025</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Card de Edição de Perfil */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("edit.edit_profile")}
                  </CardTitle>
                  <CardDescription>
                    {t("edit.edit_profile_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="text-sm">
                      <strong>{t("edit.edit_name")}:</strong>
                      <p className="text-muted-foreground text-xs mt-1">{profile.name}</p>
                    </li>
                    <li className="text-sm">
                      <strong>{t("edit.edit_image")}:</strong>
                      <p className="text-muted-foreground text-xs mt-1">{infos.image_path ? 'Definida' : 'Não definida'}</p>
                    </li>
                    <li className="text-sm">
                      <strong>{t("edit.edit_phone")}:</strong>
                      <p className="text-muted-foreground text-xs mt-1">{infos.phone_number || 'Não definido'}</p>
                    </li>
                    <li className="text-sm">
                      <strong>{t("edit.edit_palette")}:</strong>
                      <p className="text-muted-foreground text-xs mt-1">Padrão do sistema</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};