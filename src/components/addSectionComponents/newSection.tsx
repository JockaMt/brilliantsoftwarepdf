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
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
import {LoaderCircleIcon, PlusCircleIcon} from "lucide-react";
import {fakeItems} from "@/assets/fakeSectionItens.ts";
import {columnsItems} from "@/components/tables/addSection/addSectionColumnDefinition.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {formSchema} from "@/components/addSectionComponents/addSectionSchema.ts";
import {IItem} from "@/@types/interfaces/types.ts";
import TableSet from "@/components/tables/tableTemplate";
import { useTranslation } from "react-i18next";
import { t } from "i18next";


async function getData(): Promise<IItem[]> {
  // Fetch data from your API here.
  return fakeItems;
}
function AppWrapper() {
  const [data, setData] = useState<IItem[]|null>(null);

  useEffect( () => {
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const doSomething = async () => {
      await wait(200);
      getData().then(setData);
    };
    doSomething().then()
    //getData().then(setData);
  }, []);

  if (!data) return <div className="flex flex-1 justify-center items-center gap-2"><LoaderCircleIcon className="animate-spin" size={15}/><span>{t("general.loading")}...</span></div>;
  return <TableSet search="description" columns={columnsItems} data={data}/>;
}
export default function NewItem () {
  const { t } = useTranslation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      section: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="section"
            render={({field}) => (
              <FormItem>
                <FormLabel>{t("section.section_name")}</FormLabel>
                <FormControl>
                  <div className="flex flex-row space-x-3">
                    <Input placeholder={t("section.placeholder_section")} {...field} />
                    <Button type="submit"><PlusCircleIcon/>{t("general.submit")}</Button>
                  </div>
                </FormControl>
                <FormDescription className="text-[0.7rem]">
                  {t("section.new_section_desc")}
                </FormDescription>
                <FormMessage/>
              </FormItem>
            )}
          />
        </form>
      </Form>
      <Separator className="my-3"/>
      {AppWrapper()}
    </div>
  )
};