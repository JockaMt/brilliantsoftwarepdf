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
    title: "edit.edit_name",
    url: "#",
    icon: Pencil
  },  {
    title: "edit.edit_image",
    url: "#",
    icon: ImageIcon
  },  {
    title: "edit.edit_palette",
    url: "#",
    icon: LucidePalette
  },  {
    title: "edit.edit_phone",
    url: "#",
    icon: PhoneIcon
  }
]

export const itemsSettings = [
  {
    title: "catalog.import_catalog",
    url: "#",
    icon: FileOutputIcon
  },  {
    title: "catalog.export_catalog",
    url: "#",
    icon: FileInputIcon
  },  {
    title: "catalog.save_location",
    url: "#",
    icon: FolderIcon
  },  {
    title: "catalog.delete_catalog",
    url: "#",
    icon: TrashIcon
  }
]

export const itemsHelp = [
  {
    title: "feedback.report_bug",
    url: "#",
    icon: BugIcon
  },
]