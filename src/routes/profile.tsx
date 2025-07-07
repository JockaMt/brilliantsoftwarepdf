import { Header } from "@/components/header";
import { H1 } from "@/components/titles/h1.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useProfile } from "@/contexts/profileContext";
import { LoaderCircleIcon } from "lucide-react";
import capitalize from "@/utils/capitalize"
import { getVersion } from "@tauri-apps/api/app";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";

export default function (): ReactElement {
  const { t } = useTranslation()
  const [infos, setInfos] = useState<Record<string, any>>({});
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then((e) => setVersion(e))
    invoke<Record<string, any>>("get_settings")
      .then((settings) => {
        setInfos(settings);
      });
  }, [])

  if (!infos) return <div className="flex flex-1 justify-center items-center gap-2"><LoaderCircleIcon className="animate-spin" size={15}/><span>Carregando...</span></div>;

  return (
    <div>
      <div className={"flex-col bg-muted h-full min-h-screen flex"}>
        <Header back name={t("general.profile")} />
        <div className={"relative flex h-full bg-white rounded-md m-3 flex-row p-3"}>
          <div className="flex flex-1 flex-col items-center space-y-5">
            <Avatar className="w-30 h-30 bg-[var(--primary)] p-[0.2rem] my-7">
              <AvatarImage className="rounded-full" src={infos.image_path} />
              <AvatarFallback>JM</AvatarFallback>
            </Avatar>
            <H1 side={'center'} text={capitalize(infos.name) || t("info.default_name")} />
            <Separator className="m-3" />
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-4 w-full">
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
                  <ul>
                    <li>Instagram: @{infos.instagram_username || ""}</li>
                    <li>Whatsapp: {infos.phone_number || ""}</li>
                    <li>Website: {infos.website_url || ""}</li>
                    <li>Youtube: {infos.youtube_channel || ""}</li>
                  </ul>
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
                  <ul>
                    <li>{t("item.name")}: {infos.name}</li>
                    <li className="overflow-hidden text-nowrap">{t("info.path")}: {infos.save_path}
                    </li>
                    <li>{t("section.sections")}: {}</li>
                    <li>{t("item.items")}: {}</li>
                  </ul>
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
                  <ul>
                    <li>{t("info.version")}: {version}</li>
                    <li><a>{t("info.dev")}: jockamt</a></li>
                    <li>{t("info.copy_right")}: </li>
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