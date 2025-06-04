import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { getFormSchema } from "./addItemSchema"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFieldArray, useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CheckIcon, ChevronDownIcon, PlusCircleIcon, SquarePlus, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { fakeDatabase } from "@/assets/fakeDatabase"


const SECTIONS = fakeDatabase.map((item) => item.name)


export default function NewItem() {
  const { t } = useTranslation();
  const form = useForm<z.infer<ReturnType<typeof getFormSchema>>>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      image: undefined,
      section: undefined,
      code: undefined,
      items: [{ name: "", value: "" }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  function onSubmit(values: z.infer<ReturnType<typeof getFormSchema>>) {
    console.log(values)
  }

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => {
              const [fileName, setFileName] = useState<string | null>(null)

              const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0]
                if (file) {
                  setFileName(file.name)
                  field.onChange(e) // necessário para o RHF
                }
              }
              return (
                <FormItem>
                  <FormLabel>{t("item.item_image")}</FormLabel>
                  <FormControl>
                    <Label className="flex flex-1 w-full cursor-pointer">
                      <Button
                        onClick={() => document.getElementById('my-file-input')?.click()}
                        type="button"
                        variant="outline"
                        className="flex flex-1 w-full pointer-events-none justify-start"
                      >
                        {fileName || (t("item.image_button") + "  ...")}
                      </Button>
                      <Input
                        type="file"
                        className="hidden"
                        {...field}
                        onChange={handleFileChange}
                        id="my-file-input"
                      />
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>{t("item.item_code")}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      placeholder={t("item.item_code_desc")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seção</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className="flex w-full justify-between"
                      >
                        {form.getValues().section || t("item.select_section")}
                        <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" side="bottom" className="flex max-h-60 overflow-y-auto p-3 left-0">
                      <Command>
                        <CommandInput placeholder="Buscar seção..." />
                        <CommandEmpty>Nenhuma seção encontrada.</CommandEmpty>
                        <CommandGroup>
                          {SECTIONS.map((section) => (
                            <CommandItem
                              key={section}
                              value={section}
                              onSelect={() => {
                                form.setValue("section", section)
                                form.clearErrors("section")
                              }}
                            >
                              {section}
                              {field.value === section && (
                                <CheckIcon className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormLabel>{t("item.optional_fields")}</FormLabel>
          {fields.map((item: any, index: number) => (
            <div key={item.id} className="space-y-4 border p-4 rounded-md">
              <FormField
                control={form.control}
                name={`items.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do campo</FormLabel>
                    <FormControl>
                      <Input placeholder={t("item.ex_weight")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input placeholder={t("item.ex_weight_value")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" onClick={() => remove(index)}>
                <Trash2 />{t("item.remove")}
              </Button>
            </div>
          ))}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ name: "", value: "" })}
            >
              <SquarePlus />
              {t("item.add_form_item")}
            </Button>

            <Button type="submit"><PlusCircleIcon />{t("item.submit")}</Button>
          </div>
        </form>
      </Form>
    </div>
  )
};