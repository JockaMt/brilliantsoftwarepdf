import {Header} from "@/components/header";
import NewSection from "@/components/addSectionComponents/newSection.tsx";
import {H1} from "@/components/titles/h1.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";


export default function AddSectionPage (): ReactElement{
  const { t } = useTranslation()
  return (
    <div className="flex flex-col h-full">
      <Header back name={"Nova seção"}/>
      <div className="flex flex-1 flex-col p-3 w-full">
        <H1 text={t("new_section")} side={"center"}/>
        <Separator className="my-3"/>
        <NewSection />
      </div>
    </div>
  )
}