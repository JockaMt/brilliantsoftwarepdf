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


interface ISidebarGroup {
  items: data[],
  title: string
}

export function sidebarGroup(props: ISidebarGroup) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{props.title}</SidebarGroupLabel>
      <SidebarGroupContent className={"flex w-full"}>
        <SidebarMenu>
          {props.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Tooltip>
                <TooltipContent side={"left"}>{item.title}</TooltipContent>
                <TooltipTrigger className={"flex w-full"}>
                  <SidebarMenuButton asChild>
                    <Label className={"cursor-pointer"}>
                      <item.icon />
                      <span className={"flex min-w-25 w-full"}>{item.title}</span>
                    </Label>
                  </SidebarMenuButton>
                </TooltipTrigger>
              </Tooltip>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}