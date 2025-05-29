import {Header} from "@/components/header";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {H1} from "@/components/titles/h1.tsx";
import {CirclePlus, FilesIcon, FileTerminal, FolderPlusIcon} from "lucide-react";
import SectionTables from "@/components/tables/sectionTables.tsx";
import {columns, ISectionData} from "@/components/tables/sectionColumnDefinition.tsx";
import {fakeDatabase} from "@/assets/fakeDatabase.ts";
import {useEffect, useState} from "react";


async function getData(): Promise<ISectionData[]> {
  // Fetch data from your API here.
  return fakeDatabase;
}
export default function Home () {
  function AppWrapper() {
    const [data, setData] = useState<ISectionData[]|null>(null);

    useEffect(() => {
      getData().then(setData);
    }, []);

    if (!data) return <div>Carregando...</div>;
    return <SectionTables columns={columns} data={data}/>;
  }
  return (
    <div className={"flex flex-col h-screen"}>
      <Header name={"Início"}/>
      <div className={"relative flex h-full flex-row p-3"}>
          <div className={"flex flex-1 flex-col space-y-3 h-full max-w-72"}>
            <H1 text={"Opções"} side={'center'}/>
            <Separator/>
            <Button variant={"default"} className={"p-6"}><CirclePlus/>Adicionar item</Button>
            <Button variant={"default"} className={"p-6"}><FolderPlusIcon/>Adicionar seção</Button>
            <Button variant={"default"} className={"p-6"}><FilesIcon/>Visualizar catálogos</Button>
            <Button variant={"default"} className={"p-6"}><FileTerminal/>Gerar catálogo</Button>
          </div>
          <Separator className={"mx-3"} orientation={"vertical"}/>
          <div className={"flex flex-col flex-1 space-y-3"}>
            <H1 text={"Seções"} side={'center'}/>
            <Separator/>
            {AppWrapper()}
          </div>
      </div>
    </div>
  )
}