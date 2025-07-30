import { Header } from "@/components/header";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { H1 } from "@/components/titles/h1.tsx";
import { CirclePlus, FilesIcon, FileTerminal, FolderPlusIcon, LoaderCircleIcon } from "lucide-react";
import { columns } from "@/components/tables/home/sectionColumnDefinition.tsx";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {ISection} from "@/@types/interfaces/types.ts";
import TableSet from "@/components/tables/tableTemplate";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";


function AppWrapper() {
  const [data, setData] = useState<ISection[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const loadData = async () => {
    setLoading(true);
    try {
      const sections = await invoke<ISection[]>("list_sections");
      const transformed = sections.map(section => ({
        ...section,
        items: (section.items ?? []).map(item => ({
          ...item,
          infos: []
        }))
      }));
      setData(transformed);
    } catch (e) {
      console.error("Erro ao carregar seções:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Chamada inicial ao montar o componente
  useEffect(() => {
    loadData().then();
  }, []);

  if (loading) return (
    <div className="flex h-full w-full justify-center items-center gap-2">
      <LoaderCircleIcon className="animate-spin" size={15} />
      <span>{t("general.loading")}...</span>
    </div>
  );

  if (!data) return null;

  return (
    <TableSet
      path="section"
      search="name"
      columns={columns}
      data={data}
      reload={loadData}
    />
  );
}


export default function Home(): ReactElement {
  const [hasItem, setHasItem] = useState(false);
  const [hasSection, setHasSection] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGenerateCatalog = async () => {
    if (!hasItem) {
      toast.error(t("catalog.no_items_error"));
      return;
    }

    setIsGeneratingPDF(true);
    toast.loading(t("catalog.generating_pdf"));

    try {
      // Tentar usar o gerador Python primeiro
      const result = await invoke<string>("generate_catalog_pdf_python");
      toast.dismiss();
      
      // Extrair apenas o nome do arquivo do caminho completo
      const fileName = result.split('\\').pop() || result.split('/').pop() || result;
      
      toast.success(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.dismiss();
      toast.error(t("catalog.pdf_generation_error") + ": " + String(error));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    invoke<boolean>("has_items").then((res) => setHasItem(res));
    invoke<boolean>("has_sections").then((res) => setHasSection(res));
  }, [hasItem, hasSection]);
  
  return (
    <div className={"flex flex-col h-full"}>
      <Header name={t("general.home")} />
      <div className={"relative flex h-full flex-row p-3"}>
        <div className={"flex flex-1 flex-col space-y-3 h-full max-w-72"}>
          <H1 text={t("general.options")} side={'center'} />
          <Separator />
          <Button onClick={() => navigate("/new-item")} variant={"default"} className={"p-6"} disabled={!hasSection}><CirclePlus />{t("item.add_item")}</Button>
          <Button onClick={() => navigate("/new-section")} variant={"default"} className={"p-6"}><FolderPlusIcon />{t("section.add_section")}</Button>
          <Button variant={"default"} className={"p-6"} disabled><FilesIcon />{t("catalog.manage_catalogs")}</Button>
          <Button 
            onClick={handleGenerateCatalog} 
            variant={"default"} 
            className={"p-6"} 
            disabled={!hasItem || isGeneratingPDF}
          >
            {isGeneratingPDF ? <LoaderCircleIcon className="animate-spin" /> : <FileTerminal />}
            {isGeneratingPDF ? t("catalog.generating") : t("catalog.generate_catalog")}
          </Button>
        </div>
        <Separator className={"mx-3"} orientation={"vertical"} />
        <div className={"flex flex-col flex-1 space-y-3"}>
          <H1 text={t("section.sections")} side={'center'} />
          <Separator />
          <AppWrapper />
        </div>
      </div>
    </div>
  )
}