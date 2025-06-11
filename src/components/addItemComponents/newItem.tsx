import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { getFormSchema } from "./addItemSchema"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFieldArray, useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { CheckIcon, ChevronDownIcon, CircleCheckIcon, PlusCircleIcon, SquarePlus, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { useParams } from "react-router"
import { ISection } from "@/@types/interfaces/types"
import { useGetItem } from "@/hooks/useItem"
import { invoke } from "@tauri-apps/api/core"

export default function NewItem() {
  const { t } = useTranslation();
  const params = useParams();
  const [sections, setSections] = useState<ISection[]>([])
  const [fileName, setFileName] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const form = useForm<z.infer<ReturnType<typeof getFormSchema>>>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      image: undefined,
      section: undefined,
      code: undefined,
      description: undefined,
      items: undefined
    }
  })

  

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  useEffect(() => {
    invoke<ISection[]>("get_all_sections").then(setSections)
    if (params.id) {
      const id = params.id.split("=")[1];
      const selectedItem = useGetItem(id);

      if (selectedItem) {
        form.reset({
          code: selectedItem.code,
          section: selectedItem.section_id,
          description: selectedItem.description,
          items: selectedItem.infos.map(info => ({
            id: info.id,
            name: info.name ?? "",
            details: info.details
          })),
          image: undefined
        });

        setExistingImage(selectedItem.image ?? null);
      }
    }
  }, []); // roda só uma vez




  const onSubmit = (values: z.infer<ReturnType<typeof getFormSchema>>) => {
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
              const [previewUrl, setPreviewUrl] = useState<string | null>(null);

              const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFileName(file.name);
                  field.onChange(file); // RHF recebe o File
                  setPreviewUrl(URL.createObjectURL(file)); // gera preview local
                }
              };

              return (
                <FormItem>
                  <FormLabel>{t("item.item_image")}</FormLabel>
                  <FormControl>
                    <div className="flex gap-3">
                      {(previewUrl || existingImage) && (
                        <img
                          src={previewUrl || existingImage!}
                          alt="Preview da imagem"
                          className="flex h-9 w-9 object-cover rounded-md border"
                        />
                      )}
                      <Label className="flex w-full cursor-pointer">
                        <Button
                          type="button"
                          onClick={() =>
                            document.getElementById("file-input")?.click()
                          }
                          className="flex w-full pointer-events-none justify-start bg-white text-black border hover:text-white"
                        >
                          {fileName || t("item.image_button") + " ..."}
                        </Button>
                        <Input
                          type="file"
                          id="file-input"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
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
            name="description"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>{t("item.item_description")}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      placeholder={t("item.item_description_placeholder")}
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
                <FormLabel>{t("section.sections")}</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        type="button"
                        role="combobox"
                        className="flex w-full justify-between  bg-white text-black capitalize border hover:text-white"
                      >
                        {form.getValues().section || t("item.select_section") + " ..."}
                        <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" side="bottom" className="flex max-h-60 overflow-y-auto p-3 left-0">
                      <Command>
                        <CommandInput placeholder="Buscar seção..." />
                        <CommandEmpty>Nenhuma seção encontrada.</CommandEmpty>
                        <CommandGroup>
                          {sections.map((section) => (
                            <CommandItem
                              key={section.name}
                              value={section.name}
                              onSelect={() => {
                                form.setValue("section", section.name)
                                form.clearErrors("section")
                              }}
                              className="capitalize"
                            >
                              {section.name}
                              {field.value === section.name && (
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
                    <FormLabel>Nome do item</FormLabel>
                    <FormControl>
                      <Input placeholder={t("item.ex_item_name")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.details`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalhes</FormLabel>
                    <FormControl>
                      <Input placeholder={t("item.ex_item_details")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" onClick={() => remove(index)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("item.remove")}
              </Button>
            </div>
          ))}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),         // ou use uma função geradora de ID
                  name: "",
                  details: "",
                })
              }
            >
              <SquarePlus className="mr-2 h-4 w-4" />
              {t("item.add_form_item")}
            </Button>
            <Button type="submit">{params.id ? <CircleCheckIcon /> : <PlusCircleIcon />}{t(params.id ? "item.update" : "item.submit")}</Button>
          </div>
        </form>
      </Form>
    </div>
  )
};