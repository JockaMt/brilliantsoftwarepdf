import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator.tsx";
import { Label } from "@radix-ui/react-label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx";
import { cn } from "@/lib/utils.ts";
import { itemsHelp, itemsProfile, itemsSettings } from "@/components/sidebar/data.tsx";
import { sidebarGroup } from "@/components/sidebar/sidebarGroup.tsx";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import { useMediaQuery } from "usehooks-ts";
import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { SidebarOpenIcon, SparklesIcon, WrenchIcon, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { UserSettings } from "../../@types/interfaces/settings";
import { useImageUpload } from "@/hooks/useImageUpload";

import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isLargeScreen = useMediaQuery("(min-width: 768px)");
  const side = isLargeScreen ? "left" : "right";
  const [version, setVersion] = useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const { loadUserImage } = useImageUpload();
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Carregar settings e imagem do usuário
    const loadUserData = async () => {
      try {
        const settings = await invoke<UserSettings>("get_settings");
        setUserSettings(settings);
        
        // Carregar imagem do usuário
        const imageUrl = await loadUserImage();
        setUserImageUrl(imageUrl);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };
    
    loadUserData();
  }, []); // Remover dependência loadUserImage

  const getUpdate = async () => {
    const e = await invoke("check_for_update"); //ToDo: remover esta linha
    if (typeof e === "string") {
      toast.custom((tr) => (
        <Card className="flex w-90 select-none">
          <CardHeader>
            <CardTitle className="flex w-full gap-3 items-center">
              <SparklesIcon />
              <h2>{t("update.update_avaliabe")}!</h2>
            </CardTitle>
            <CardDescription className="text-black/50">
              {t("update.update_avaliabe_desc")}: {e}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="flex w-full"
              onClick={() => {
                toast.dismiss(tr);
                toast.loading(t("update.downloading"));
                // Aqui você pode chamar a função para baixar e instalar
                invoke("download_and_install_update").catch((err) => {
                  console.error("Erro ao atualizar:", err);
                  // Exemplo de toast de erro:
                  toast.error(t("update.download_erro"));
                });
              }}
            >
              {t("update.update")}
            </Button>
          </CardContent>
        </Card>
      ));
      return true;
    } else {
      return false;
    }
  };

  const handleVerifyUpdate = () => {
    const toastId = toast.loading(t("update.checking_for_updates"));

    getUpdate()
      .then((e) => {
        console.log(e);
        toast.dismiss(toastId);
        if (e == false){
          toast.success(t("update.all_up_to_date"))
        }
      })
      .catch((err) => {
        console.error(err);
        toast.dismiss(toastId);
        toast.error(t("update.download_erro"));
      });
  };

  useEffect(() => {
    getVersion().then((e) => {
      setVersion(e);
    });
    getUpdate().then();
  }, []);

  return (
    <Sidebar
      side={side}
      className={"flex"}
      translate={"yes"}
      variant={"sidebar"}
      collapsible={"icon"}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Label className={"cursor-pointer relative md:indeterminate:"}>
                <SidebarTrigger
                  icon={
                    <SidebarOpenIcon
                      style={{ paddingLeft: "2px", width: "20px", height: "20px" }}
                    />
                  }
                  className={"absolute md:fixed left-0"}
                />
                <span className={"flex min-w-25 w-full justify-center"}>
                  {t("general.menu")}
                </span>
              </Label>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent className={"overflow-hidden overflow-y-auto"}>
        {sidebarGroup({ items: itemsProfile, title: t("general.profile") })}
        <Separator />
        {sidebarGroup({ items: itemsSettings, title: t("settings.settings") })}
        <Separator />
        {sidebarGroup({ items: itemsHelp, title: t("info.help") })}
        <SidebarGroup className="[[data-side=left][data-state=collapsed]_&]:hidden">
          <SidebarGroupLabel>
            <Label className={"flex min-w-25 w-full"}>{t("settings.language")}</Label>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
              <SelectTrigger className={cn("w-full h-9 text-sm border-none cursor-pointer")}>
                <span>{t(`settings.${i18n.language}`)}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">{t("settings.pt")}</SelectItem>
                <SelectItem value="en">{t("settings.en")}</SelectItem>
                <SelectItem value="es">{t("settings.es")}</SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator />
        <SidebarGroup>
          <SidebarGroupLabel>{t("info.version")}: v{version}</SidebarGroupLabel>
          <SidebarGroupContent className={"flex w-full"}>
            <SidebarMenu>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipContent side={"left"}>{t("update.check_for_updates")}</TooltipContent>
                    <TooltipTrigger className={"flex w-full"}>
                      <SidebarMenuButton onClick={handleVerifyUpdate} asChild>
                        <Label className={"cursor-pointer"}>
                          <WrenchIcon />
                          <span className={"flex min-w-25 w-full"}>{t("update.check_for_updates")}</span>
                        </Label>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                  </Tooltip>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn("overflow-hidden")}>
        <SidebarMenu>
          <SidebarGroupContent>
            <SidebarMenuItem>
              <div
                className="h-15 w-full cursor-pointer"
                onClick={() => {
                  if (location.pathname === "/profile") return;
                  navigate("/profile");
                }}
              >
                <div className="flex justify-between items-center space-x-2 w-full text-left">
                  <Avatar
                    className={cn(
                      "duration-300",
                      "[[data-side=left][data-state=collapsed]_&]:h-7",
                      "[[data-side=left][data-state=collapsed]_&]:w-7",
                      "h-10 w-10"
                    )}
                  >
                    <AvatarImage src={userImageUrl || userSettings?.image_path || undefined} />
                    <AvatarFallback className="bg-muted">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex duration-300 flex-1 w-10 [[data-side=left][data-state=collapsed]_&]:w-0 [[data-side=left][data-state=collapsed]_&]:opacity-0">
                    {t("general.profile")}
                  </span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}