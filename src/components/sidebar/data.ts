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
  icon: LucideIcon,
  description?: string,
  action: () => void
}
export const itemsProfile = [
  {
    title: "edit.edit_name",
    url: "#",
    icon: Pencil,
    description: "edit.edit_name_description",
    action: () => {console.log("Edit Name Clicked")}
  },  {
    title: "edit.edit_image",
    url: "#",
    icon: ImageIcon,
    action: () => {console.log("Edit Image Clicked")}
  },  {
    title: "edit.edit_palette",
    url: "#",
    icon: LucidePalette,
    action: () => {console.log("Edit Palette Clicked")}
  },  {
    title: "edit.edit_phone",
    url: "#",
    icon: PhoneIcon,
    action: () => {console.log("Edit Phone Clicked")}
  }
]

export const itemsSettings = [
  {
    title: "catalog.import_catalog",
    url: "#",
    icon: FileOutputIcon,
    action: () => {console.log("Import Catalog Clicked")}
  },  {
    title: "catalog.export_catalog",
    url: "#",
    icon: FileInputIcon,
    action: () => {console.log("Export Catalog Clicked")}
  },  {
    title: "catalog.save_location",
    url: "#",
    icon: FolderIcon,
    action: () => {console.log("Save Location Clicked")}
  },  {
    title: "catalog.delete_catalog",
    url: "#",
    icon: TrashIcon,
    action: () => {console.log("Delete Catalog Clicked")}
  }
]

export const itemsHelp = [
  {
    title: "feedback.report_bug",
    url: "#",
    icon: BugIcon,
    action: () => {console.log("Report Bug Clicked")}
  },
]