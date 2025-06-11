import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useEffect, useState } from "react";
import { CircleCheckIcon, LoaderCircleIcon, PlusCircleIcon } from "lucide-react";
import { fakeItems } from "@/assets/fakeSectionItens.ts";
import { columnsItems } from "@/components/tables/addSection/addSectionColumnDefinition.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { formSchema } from "@/components/addSectionComponents/addSectionSchema.ts";
import { IItem, ISection } from "@/@types/interfaces/types.ts";
import TableSet from "@/components/tables/tableTemplate";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useGetSection } from "@/hooks/useSection";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";


function AppWrapper() {
  const [data, setData] = useState<IItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const loadData = async () => {
    setLoading(true);
    try {
      const item = fakeItems //await invoke<IItem[]>("get_items_from_section");
      setData(item);
    } catch (e) {
      console.error("Erro ao carregar item:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      path="item"
      search="description"
      columns={columnsItems}
      data={data}
      reload={loadData}
    />
  );
}


export default function NewItem() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const rawId: string | undefined = params.id?.split("=")[1]
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      section: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (params.id) {
      if (values.section !== undefined) {
        invoke("update_section", { uuid: rawId, name: values.section }).then()
      }
    } else {
      invoke("create_section", { name: values.section })
        .then(() => {
          // Nenhum valor esperado aqui
          toast.success("Seção criada com sucesso!");
          navigate(-1);
        })
        .catch((err) => {
          console.error("Erro ao criar seção:", err);
          toast.error("Erro ao criar seção.");
        });
    }
  }

  useEffect(() => {
    if (rawId) {
      useGetSection(rawId).then((section) => {
        if (section) {
          form.setValue("section", section.name)
        }
      })
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("section.section_name")}</FormLabel>
                <FormControl>
                  <div className="flex flex-row space-x-3">
                    <Input className="capitalize" placeholder={t("section.placeholder_section")} {...field} />
                    <Button type="submit">{params.id ? <CircleCheckIcon /> : <PlusCircleIcon />}{params.id ? t("update.update") : t("general.submit")}</Button>
                  </div>
                </FormControl>
                <FormDescription className="text-[0.7rem]">
                  {t("section.new_section_desc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <Separator className="my-3" />
      <AppWrapper />
    </div>
  )
};