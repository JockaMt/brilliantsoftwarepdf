import {Header} from "@/components/header";
import NewSection from "@/components/addSectionComponents/newSection.tsx";
import {H1} from "@/components/titles/h1.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";


export default function AddSectionPage (): ReactElement{
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id")
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <Header back name={t(id ? "section.update_section" : "section.new_section")}/>
      <div className="flex flex-1 items-center flex-col p-3 w-full">
        <H1 text={t(id ? "section.update_section" : "section.new_section")} side={"center"}/>
        <small className="flex flex-1 justify-center">{t(id ? "section.update_section" : "section.new_section_sub")}</small>
        <Separator className="my-5" />
        <NewSection />
      </div>
    </div>
  )
}