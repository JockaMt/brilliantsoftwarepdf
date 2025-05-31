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
import {LoaderCircleIcon} from "lucide-react";
import {fakeSectionItens} from "@/assets/fakeSectionItens.ts";
import {columnsSection, ISection} from "@/components/tables/addSection/tables/addSectionColumnDefinition.tsx";
import AddSectionTable from "@/components/tables/addSection/tables/addSectionTable.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {formSchema} from "@/routes/addSectionComponents/addSectionSchema";

async function getData(): Promise<ISection[]> {
  // Fetch data from your API here.
  return fakeSectionItens;
}
function AppWrapper() {
  const [data, setData] = useState<ISection[]|null>(null);


  useEffect( () => {
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const doSomething = async () => {
      console.log("Esperando 2 segundos...");
      await wait(200);
      console.log("Pronto!");
      getData().then(setData);
    };
    doSomething().then()
    //getData().then(setData);
  }, []);

  if (!data) return <div className="flex h-full w-full justify-center items-center gap-2"><LoaderCircleIcon className="animate-spin" size={15}/><span>Carregando...</span></div>;
  return <AddSectionTable columns={columnsSection} data={data}/>;
}
export default function NewSection () {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({field}) => (
              <FormItem>
                <FormLabel>Nome da seção</FormLabel>
                <FormControl>
                  <div className="flex flex-row space-x-3">
                    <Input placeholder="Brincos, anéis, etc." {...field} />
                    <Button type="submit">Submit</Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Adicione aqui as seções...
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