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

export interface data {
  title: string,
  url: string,
  icon: LucideIcon
}
export const itemsProfile = [
  {
    title: "Editar nome",
    url: "#",
    icon: Pencil
  },  {
    title: "Editar imagem",
    url: "#",
    icon: ImageIcon
  },  {
    title: "Editar palleta",
    url: "#",
    icon: LucidePalette
  },  {
    title: "Editar número",
    url: "#",
    icon: PhoneIcon
  }
]

export const itemsSettings = [
  {
    title: "Importar catálogo",
    url: "#",
    icon: FileOutputIcon
  },  {
    title: "Exportar catálogo",
    url: "#",
    icon: FileInputIcon
  },  {
    title: "Onde salvar",
    url: "#",
    icon: FolderIcon
  },  {
    title: "Deletar catálogo",
    url: "#",
    icon: TrashIcon
  }
]

export const itemsHelp = [
  {
    title: "Reportar erro",
    url: "#",
    icon: BugIcon
  },
]