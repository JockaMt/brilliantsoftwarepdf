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
import { columnsItems } from "@/components/tables/addSection/addSectionColumnDefinition.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { formSchema } from "@/components/addSectionComponents/addSectionSchema.ts";
import { IItem } from "@/@types/interfaces/types.ts";
import TableSet from "@/components/tables/tableTemplate";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { useGetSection } from "@/hooks/useSection";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";


function AppWrapper() {
  const [data, setData] = useState<IItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { t } = useTranslation();

  const loadData = async () => {
    if (id) {setLoading(true);
    try {
      invoke<IItem[]>("list_items", { sectionId: id }).then((item) => {
        setData(item);
      });
    } catch (e) {
      console.error("Erro ao carregar item:", e);
    } finally {
      setLoading(false);
    }}
  };

  useEffect(() => {
    loadData().then(()=> setLoading(false));
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      section: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (id) {
      if (values.section !== undefined) {
        invoke("update_section", { uuid: id, name: values.section }).then(() => {
          toast.success("Seção atualizada com sucesso!");
          // Dispara evento para atualizar outros componentes
          window.dispatchEvent(new CustomEvent('data-updated'));
        }).catch((err) => {
          if (err.toString().includes("UNIQUE")) {
            toast.warning(t("section.alrealy_exists"));
          }
        })
      }
    } else {
      invoke("create_section", { name: values.section })
        .then(() => {
          // Nenhum valor esperado aqui
          toast.success("Seção criada com sucesso!");
          // Dispara evento para atualizar outros componentes
          window.dispatchEvent(new CustomEvent('data-updated'));
          navigate(-1);
        })
        .catch((err) => {
          if (err.toString().includes("UNIQUE")) {
            toast.warning(t("section.alrealy_exists"));
          }
        });
    }
  }

  useEffect(() => {
    if (id) {
      useGetSection(id).then((section) => {
        if (section) {
          form.setValue("section", section.name)
        }
      })
    }
  }, [])

  return (
    <div className="flex flex-col h-full max-w-[1280px] w-full">
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
                    <Button type="submit">{id ? <CircleCheckIcon /> : <PlusCircleIcon />}{id ? t("update.update") : t("general.submit")}</Button>
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
      <div className="flex justify-end items-center gap-3 pb-3">
        {t("section.new_item")}
        <Button onClick={()=> navigate(`/new-item?section=${id}`)}>{t("item.add_item")}</Button>
      </div>
      <AppWrapper />
    </div>
  )
};