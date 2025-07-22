import {
  BugIcon,
  FileInputIcon,
  FileOutputIcon,
  FolderIcon,
  ImageIcon, LucideIcon,
  LucidePalette,
  Pencil,
  PhoneIcon,
  TrashIcon
} from "lucide-react";
import SidebarPopup from "../SidebarPopup";
import PopupInput from "../SidebarPopup/Input";
import { Button } from "../ui/button";
import { t } from "i18next";
import { Input } from "../ui/input";


export interface Data {
  title: string;
  url: string;
  icon: LucideIcon;
  popup?: (close: () => void) => JSX.Element;
  action?: () => void;
}

export const itemsProfile: Data[] = [
  {
    title: "edit.edit_name",
    url: "#",
    icon: Pencil,
    popup: (close) => (
      <SidebarPopup
        title="edit.edit_name"
        description="edit.edit_name_description"
      >
        {(info, setInfo) => (
          <>
            <PopupInput
              value={info}
              onChange={setInfo}
              placeholder="Digite seu novo nome"
            />
            <Button onClick={() => {
              close();
              console.log("Nome salvo!")
            }}>{t("general.save")}</Button>
          </>
        )}
      </SidebarPopup>
    )
  }, {
    title: "edit.edit_image",
    url: "#",
    icon: ImageIcon,
    popup: (close) => (
      <SidebarPopup
        title="edit.edit_image"
        description="edit.edit_image_description"
      >
        {(info, setInfo) => (
          <>
            <Input type="file" id="file-input" accept="image/*" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                console.log(e.target.files[0]);
              }
            }} />
            <Button onClick={() => {
              console.log("Imagem salva!")
              close();
            }}>{t("general.save")}</Button>
          </>
        )}
      </SidebarPopup>
    )
  }, {
    title: "edit.edit_palette",
    url: "#",
    icon: LucidePalette,
    popup: (close) => (
      <SidebarPopup
        title="edit.edit_palette"
        description="edit.edit_palette_description"
      >
        {(info, setInfo) => (
          <>
            <Button onClick={() => {
              console.log("Paleta salva!");
              close();
            }}>{t("general.save")}</Button>
          </>
        )}
      </SidebarPopup>
    )
  }, {
    title: "edit.edit_phone",
    url: "#",
    icon: PhoneIcon,
    popup: (close) => (
      <SidebarPopup
        title="edit.edit_phone"
        description="edit.edit_phone_description"
      >
        {(info, setInfo) => (
          <>
            <PopupInput
              value={info}
              onChange={setInfo}
              placeholder="Digite o novo número de telefone"
            />
            <Button onClick={() => {
              console.log("Número de telefone salvo!");
              close();
            }}>{t("general.save")}</Button>
          </>
        )}
      </SidebarPopup>
    )
  }
]

export const itemsSettings: Data[] = [
  {
    title: "catalog.import_catalog",
    url: "#",
    icon: FileOutputIcon,
    action: () => {
      console.log("Importar catálogo");
    }
  }, {
    title: "catalog.export_catalog",
    url: "#",
    icon: FileInputIcon,
    action: () => {
      console.log("Exportar catálogo");
    }
  }, {
    title: "catalog.save_location",
    url: "#",
    icon: FolderIcon,
    action: () => {
      console.log("Salvar localização do catálogo");
    }
  }, {
    title: "catalog.delete_catalog",
    url: "#",
    icon: TrashIcon,
    popup: (close) => (
      <SidebarPopup
        title="catalog.delete_catalog"
        description="catalog.delete_catalog_description"
      >
        {(info, setInfo) => (
          <>
          <Button
          type="submit"
            onClick={() => {
              close();
            }}
          >{t("general.cancel")}</Button>
            <Button
              onClick={() => {
                console.log("Catálogo deletado!");
                close();
              }}
            >
              {t("general.delete")}
            </Button>
          </>
        )}
      </SidebarPopup>
    )
  }
]

export const itemsHelp: Data[] = [
  {
    title: "feedback.report_bug",
    url: "#",
    icon: BugIcon,
    popup: (close) => (
      <SidebarPopup
        title="feedback.report_bug"
        description="feedback.report_bug_description"
      >
        {(info, setInfo) => (
          <>
            <PopupInput
              value={info}
              onChange={setInfo}
              placeholder="Digite o relatório do bug"
            />
            <Button onClick={() => {
              console.log("Relatório de bug enviado!");
              close();
            }}>{t("general.save")}</Button>
          </>
        )}
      </SidebarPopup>
    )
  }
]