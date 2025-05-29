import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator.tsx";
import { Label } from "@radix-ui/react-label";
import { Avatar, AvatarImage} from "@/components/ui/avatar.tsx";
import { cn } from "@/lib/utils.ts";
import { itemsProfile, itemsSettings, itemsHelp } from "@/components/sidebar/data.ts";
import { sidebarGroup } from "@/components/sidebar/sidebarGroup.tsx";
import {useNavigate} from "react-router";
import {Button} from "@/components/ui/button.tsx";
import {useMediaQuery} from "usehooks-ts";
import {useEffect, useRef} from "react";

export function AppSidebar() {
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery("(min-width: 768px)")
  const side = isLargeScreen ? "left" : "right"
  const sidebarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.click();
    }
  }, []);

  return (
    <Sidebar side={side} className={"flex"} translate={"yes"} variant={"sidebar"} collapsible={"icon"}>
      <SidebarHeader className={"flex flex-row items-center"}><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild>
          <Label className={"cursor-pointer"}>
            <SidebarTrigger ref={sidebarRef} className={"absolute left-0"}/>
            <span className={"flex min-w-25 w-full justify-center"}>Menu</span>
          </Label>
        </SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
      <Separator/>
      <SidebarContent className={"overflow-hidden"}>
        {sidebarGroup({items: itemsProfile, title: "Perfil"})}
        <Separator/>
        {sidebarGroup({items: itemsSettings, title: "Configurações"})}
        <Separator/>
        {sidebarGroup({items: itemsHelp, title: "Ajuda"})}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton className={"h-15"} asChild>
            <Button variant={"ghost"} onClick={() => navigate('/profile')} className={"flex justify-between items-center space-x-2 w-full text-left"}>
              <Avatar className={cn("duration-300 [[data-side=left][data-state=collapsed]_&]:h-4 [[data-side=left][data-state=collapsed]_&]:w-4 h-10 w-10")}>
                <AvatarImage src="https://github.com/jockamt.png"/>
              </Avatar>
              <span className={"flex flex-1"}>Perfil</span>
            </Button>
          </SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}