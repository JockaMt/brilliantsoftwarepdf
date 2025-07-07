import { DialogContent } from "@/components/ui/dialog.tsx";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";

interface SidebarPopupProps {
  title?: string;
  description?: string;
  action?: () => void;
}

const SidebarPopup = (props: SidebarPopupProps) => {
  const { title, description, action } = props;
  const { t } = useTranslation();
  return (
    <DialogContent>
      <DialogTitle>{t(title!)}</DialogTitle>
      <p>{t(description!)}</p>
      {(props.title == "edit.edit_name") && (
        <Input
          placeholder={t("edit.edit_name_placeholder")}
          className="mb-4"
        />
      )}
      {action && <Button onClick={action}>{t("general.save")}</Button>}
    </DialogContent>
  )
}

export default SidebarPopup;