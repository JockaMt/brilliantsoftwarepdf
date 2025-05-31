import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator.tsx";
import { Label } from "@radix-ui/react-label";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { cn } from "@/lib/utils.ts";
import { itemsHelp, itemsProfile, itemsSettings } from "@/components/sidebar/data.ts";
import { sidebarGroup } from "@/components/sidebar/sidebarGroup.tsx";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import { useMediaQuery } from "usehooks-ts";
import { useEffect, useRef, useState } from "react";
import { getVersion } from "@tauri-apps/api/app"
import { Globe, Globe2, SidebarOpenIcon, SparklesIcon, WrenchIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";

import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};

export function AppSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const location = useLocation();
  const isLargeScreen = useMediaQuery("(min-width: 768px)")
  const side = isLargeScreen ? "left" : "right"
  useRef<HTMLButtonElement>(null);
  const [version, setVersion] = useState<string>("")

  const getUpdate = async () => {
    const e = await invoke("check_for_update");
    if (typeof e == "string") {
      toast.custom((tr) => (
        <Card className="flex w-90 select-none">
          <CardHeader>
            <CardTitle className="flex w-full gap-3 items-center"><SparklesIcon /><h2>{t("update_avaliabe")}!</h2></CardTitle>
            <CardDescription className="text-black/50">{t("update_avaliabe_desc")}: {e}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="flex w-full" onClick={() => {
              toast.dismiss(tr);
              toast.loading("Baixando atualizações...")
              // Aqui você pode chamar a função para baixar e instalar
              invoke("download_and_install_update").catch(err => {
                console.error("Erro ao atualizar:", err);
                // Exemplo de toast de erro:
                toast.error("Falha ao atualizar");
              });
            }}>
              {t("update")}
            </Button>
          </CardContent>
        </Card>
      ));
      return true;
    } else {
      return false;
    }
  }

  const handleVerifyUpdate = () => {
    const toastId = toast.loading(t("checking_for_updates"))

    getUpdate()
      .then(() => {
        console.log()
        toast.dismiss(toastId) // remove o toast de loading
      })
      .catch((err) => {
        console.error(err)
        toast.dismiss(toastId)
        toast.error(t("error_checking_for_updates"))
      })
  }

  useEffect(() => {
    getVersion().then((e) => {
      setVersion(e)
    })
    getUpdate().then()
  }, []);

  return (
    <Sidebar side={side} className={"flex"} translate={"yes"} variant={"sidebar"} collapsible={"icon"}>
      <Toaster className="flex w-full justify-center" position={"bottom-center"} />
      <SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild>
        <Label className={"cursor-pointer"}>
          <SidebarTrigger icon={<SidebarOpenIcon style={{ paddingLeft: "2px", width: "20px", height: "20px" }} />} className={"fixed left-0"} />
          <span className={"flex min-w-25 w-full justify-center"}>Menu</span>
        </Label>
      </SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
      <Separator />
      <SidebarContent className={"overflow-hidden overflow-y-auto"}>
        {sidebarGroup({ items: itemsProfile, title: "Perfil" })}
        <Separator />
        {sidebarGroup({ items: itemsSettings, title: "Configurações" })}
        <Separator />
        {sidebarGroup({ items: itemsHelp, title: "Ajuda" })}
        <SidebarGroup className="[[data-side=left][data-state=collapsed]_&]:hidden">
          <SidebarGroupLabel><Label className={"flex min-w-25 w-full"}>{t("language")}</Label></SidebarGroupLabel>
          <SidebarGroupContent>
            <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
              <SelectTrigger className={cn("w-full h-9 text-sm border-none cursor-pointer")}>
                <span>{t(`${i18n.language}`)}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator />
        <SidebarGroup>
          <SidebarGroupLabel>
            <Label>{t("version")}: v{version}</Label>
          </SidebarGroupLabel>
          <SidebarMenu>
            <Tooltip>
              <TooltipTrigger>
                <TooltipContent side="left">{t("check_for_updates")}</TooltipContent>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => handleVerifyUpdate()} className="cursor-pointer text-black/50 hover:text-[var(--primary)]">
                    <WrenchIcon />
                    {t("check_for_updates")}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </TooltipTrigger>
            </Tooltip>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn("overflow-hidden")}>
        <SidebarMenu>
          <SidebarGroupContent>
            <SidebarMenuItem>
              <div className="h-15 w-full cursor-pointer" onClick={() => {
                if (location.pathname == "/profile") return
                navigate('/profile')
              }}>
                <div className="flex justify-between items-center space-x-2 w-full text-left">
                  <Avatar
                    className={cn(
                      "duration-300",
                      "[[data-side=left][data-state=collapsed]_&]:h-7",
                      "[[data-side=left][data-state=collapsed]_&]:w-7",
                      "h-10 w-10"
                    )}
                  >
                    <AvatarImage src="https://github.com/jockamt.png" />
                  </Avatar>
                  <span className="flex duration-300 flex-1 w-10 [[data-side=left][data-state=collapsed]_&]:w-0 [[data-side=left][data-state=collapsed]_&]:opacity-0">{t("profile")}</span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar >
  )
}