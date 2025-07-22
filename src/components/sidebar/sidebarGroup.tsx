import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Label } from "@radix-ui/react-label";
import { Data } from "@/components/sidebar/data.ts";
import { useTranslation } from "react-i18next";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { useState } from "react";

interface ISidebarGroup {
  items: Data[];
  title: string;
}

export function sidebarGroup(props: ISidebarGroup) {
  const { t } = useTranslation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(props.title)}</SidebarGroupLabel>
      <SidebarGroupContent className={"flex w-full"}>
        <SidebarMenu>
          {props.items.map((item) => {
            const [open, setOpen] = useState(false);
            const closeDialog = () => setOpen(false);

            return (item.popup ? (
              // 🔷 Item com popup (abre dialog)
              <Dialog open={open} key={item.title} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger className="flex w-full">
                        <SidebarMenuButton asChild>
                          <Label className="cursor-pointer">
                            <item.icon />
                            <span className="flex min-w-25 w-full">{t(item.title)}</span>
                          </Label>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="left">{t(item.title)}</TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                </DialogTrigger>
                {item.popup(closeDialog)}
              </Dialog>
            ) : (
              // 🔶 Item com ação direta (sem popup)
              <SidebarMenuItem key={item.title}>
                <Tooltip>
                  <TooltipTrigger className="flex w-full">
                    <SidebarMenuButton asChild>
                      <Label
                        className="cursor-pointer"
                        onClick={item.action}
                      >
                        <item.icon />
                        <span className="flex min-w-25 w-full">{t(item.title)}</span>
                      </Label>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="left">{t(item.title)}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))
          }
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}