import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Label } from "@radix-ui/react-label";
import { data } from "@/components/sidebar/data.ts";
import { useTranslation } from "react-i18next";
import { Dialog, DialogTrigger } from "../ui/dialog";
import SidebarPopup from "../SidebarPopup";

interface ISidebarGroup {
  items: data[],
  title: string,
}

export function sidebarGroup(props: ISidebarGroup) {
  const { t } = useTranslation()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(props.title)}</SidebarGroupLabel>
      <SidebarGroupContent className={"flex w-full"}>
        <SidebarMenu>
          {props.items.map((item) => (
            <Dialog key={t(item.title)}>
              <DialogTrigger asChild>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipContent side={"left"}>{t(item.title)}</TooltipContent>
                    <TooltipTrigger className={"flex w-full"}>
                      <SidebarMenuButton asChild>
                      <Label className={"cursor-pointer"}>
                        <item.icon />
                        <span className={"flex min-w-25 w-full"}>{t(item.title)}</span>
                      </Label>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                </Tooltip>
              </SidebarMenuItem>
              </DialogTrigger>
              {item.description && item.action && (
                <SidebarPopup title={item.title} description={item.description} action={item.action}/>
              )}
            </Dialog>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}