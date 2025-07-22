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
    <DialogContent className="jewelry-palette-dialog overflow-y-auto p-6">
      <DialogTitle className="text-xl font-semibold mb-4">{t(title!)}</DialogTitle>
      <p className="text-sm text-muted-foreground mb-6">{t(description!)}</p>
      <div className="space-y-4">
        {children && children(info, setInfo)}
      </div>
    </DialogContent>
  )
}

export default SidebarPopup;