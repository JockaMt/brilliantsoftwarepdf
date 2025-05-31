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
    title: "edit_name",
    url: "#",
    icon: Pencil
  },  {
    title: "edit_image",
    url: "#",
    icon: ImageIcon
  },  {
    title: "edit_palette",
    url: "#",
    icon: LucidePalette
  },  {
    title: "edit_phone",
    url: "#",
    icon: PhoneIcon
  }
]

export const itemsSettings = [
  {
    title: "import_catalog",
    url: "#",
    icon: FileOutputIcon
  },  {
    title: "export_catalog",
    url: "#",
    icon: FileInputIcon
  },  {
    title: "save_location",
    url: "#",
    icon: FolderIcon
  },  {
    title: "delete_catalog",
    url: "#",
    icon: TrashIcon
  }
]

export const itemsHelp = [
  {
    title: "report_bug",
    url: "#",
    icon: BugIcon
  },
]