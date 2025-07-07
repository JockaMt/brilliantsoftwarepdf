import NewItem from "@/components/addItemComponents/newItem";
import { Header } from "@/components/header";
import { H1 } from "@/components/titles/h1";
import { Separator } from "@/components/ui/separator";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

export default function AddItemPage(): ReactElement {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams()
  const id = searchParams.get("id")
  return (
    <div>
      <Header back name={t(id ? "item.update_item" : "item.add_item")}/>
      <div className="flex items-center flex-col p-3">
        <H1 text={t(id ? "item.update_item" : "item.new_item")} side="center"/>
        <small className="flex flex-1 justify-center">{t("item.new_item_sub")}</small>
        <Separator className="my-5"/>
        <NewItem/>
      </div>
    </div>
  )
}