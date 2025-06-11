import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import React from "react";
import {SidebarOpenIcon} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider className={"relative"}>
      <AppSidebar/>
      <SidebarTrigger icon={<SidebarOpenIcon style={{width: "23px", height: "23px"}}/>} className={"fixed scale-[-1] right-3 top-3 rounded-md md:hidden w-20 h-20 z-10 bg-[var(--primary)] text-white hover:text-white hover:bg-[var(--primary)]/90"}/>
      <main className={"flex flex-col w-full"}>
        {children}
      </main>
    </SidebarProvider>
  )
}