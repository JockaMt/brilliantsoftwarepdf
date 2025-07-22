import { DialogContent } from "@/components/ui/dialog.tsx";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface SidebarPopupProps {
  title?: string;
  description?: string;
  children?: (info: string, setInfo: React.Dispatch<React.SetStateAction<string>>) => React.ReactNode;
}

const SidebarPopup = (props: SidebarPopupProps) => {
  const { title, description, children } = props;
  const [info, setInfo] = useState<string>("");
  const { t } = useTranslation();
  return (
    <DialogContent>
      <DialogTitle>{t(title!)}</DialogTitle>
      <p>{t(description!)}</p>
      {children && children(info, setInfo)}
    </DialogContent>
  )
}

export default SidebarPopup;