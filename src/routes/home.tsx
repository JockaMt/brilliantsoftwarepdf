import {Header} from "@/components/header";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {H1} from "@/components/titles/h1.tsx";
import {CirclePlus, FilesIcon, FileTerminal, FolderPlusIcon, LoaderCircleIcon} from "lucide-react";
import {columns} from "@/components/tables/home/sectionColumnDefinition.tsx";
import {fakeDatabase} from "@/assets/fakeDatabase.ts";
import {ReactElement, useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {ISectionData} from "@/@types/interfaces/types.ts";
import TableSet from "@/components/tables/tableTemplate";
import { useTranslation } from "react-i18next";

async function getData(): Promise<ISectionData[]> {
  // Fetch data from your API here.
  return fakeDatabase;
}

function AppWrapper() {
  const [data, setData] = useState<ISectionData[]|null>(null);


  
  useEffect( () => {
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const loadTable = async () => {
      await wait(200);
      getData().then(setData);
    };
    loadTable().then()
    //getData().then(setData);
  }, []);

  if (!data) return (
    <div className="flex h-full w-full justify-center items-center gap-2">
      <LoaderCircleIcon className="animate-spin" size={15}/>
      <span>Carregando...</span>
    </div>
  )
  return <TableSet search="name" columns={columns} data={data}/>;
}
export default function Home (): ReactElement {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <div className={"flex flex-col h-full"}>
      <Header name={t("home")}/>
      <div className={"relative flex h-full flex-row p-3"}>
          <div className={"flex flex-1 flex-col space-y-3 h-full max-w-72"}>
            <H1 text={t("options")} side={'center'}/>
            <Separator/>
            <Button variant={"default"} className={"p-6"}><CirclePlus/>{t("add_item")}</Button>
            <Button onClick={() => navigate("/new-section")} variant={"default"} className={"p-6"}><FolderPlusIcon/>{t("add_section")}</Button>
            <Button variant={"default"} className={"p-6"}><FilesIcon/>{t("view_catalog")}</Button>
            <Button variant={"default"} className={"p-6"}><FileTerminal/>{t("generate_catalog")}</Button>
          </div>
          <Separator className={"mx-3"} orientation={"vertical"}/>
          <div className={"flex flex-col flex-1 space-y-3"}>
            <H1 text={t("sections")} side={'center'}/>
            <Separator/>
            {AppWrapper()}
          </div>
      </div>
    </div>
  )
}