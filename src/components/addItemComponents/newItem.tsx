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
import { useNavigate, useParams, useSearchParams } from "react-router"
import { IInfo, ISection } from "@/@types/interfaces/types"
import { useGetItem } from "@/hooks/useItem"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"

export default function NewItem() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const params = useParams();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const section = searchParams.get("section");
  const item = useGetItem(id ?? "");
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
      infos: undefined
    }
  })

  useEffect(() => {
    invoke<ISection[]>("list_sections").then(setSections);
  }, []);

  useEffect(() => {
    if (!id || !item) return;
    invoke<IInfo>("list_infos", { itemCode: item.code })
      .then((fetchedInfo) => {
        console.log(fetchedInfo)
      })
    async function load() {
      let file: File | undefined;

      if (item!.image_path) {
        try {
          const response = await fetch(item!.image_path);
          const blob = await response.blob();
          file = new File([blob], "imagem.png", { type: blob.type });
        } catch (err) {
          console.warn("Erro ao carregar imagem:", err);
        }
      }

      try {
        const sectionInfo = await invoke<ISection>("get_section", { id: item!.section_id });
        const infos = await invoke<IInfo[]>("list_infos", { itemCode: item!.code });
        form.reset({
          code: item!.code,
          section: sectionInfo.name,
          description: item!.description,
          infos: infos.map(info => ({
            db_id: info.id,
            item_code: item!.code,
            name: info.name ?? "",
            details: info.details
          })),
          image: file
        });
        setExistingImage(item!.image_path ?? null);
        setFileName(file?.name ?? null);
      } catch (err) {
        console.error("Erro ao carregar seção:", err);
      }
    }
    load().then();
  }, [id, item]);

  useEffect(() => {
    if (!id && section) {
      invoke<ISection>("get_section", { id: section }).then((e) => {
        form.setValue("section", e.name);
      });
    }
  }, [id, section]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "infos"
  })

  const onSubmit = async (values: z.infer<ReturnType<typeof getFormSchema>>) => {
    const section: { id: string, name: string } = await invoke("get_section_by_name", { name: values.section });
    values.image.arrayBuffer().then((buffer) => {
      const byteArray = Array.from(new Uint8Array(buffer))
      invoke<string>("save_image", {
        image: byteArray,
        code: values.code
      }).then((imagePath) => {
        const loading_toast = toast.loading("item.creating_item")
        try {
          if (id) {
            invoke("update_item", { id: id, code: values.code, description: values.description, sectionId: section.id, imagePath: imagePath }).then(async () => {
              toast.dismiss(loading_toast)
              toast.success(t("item.update_successfully"))
              navigate(-1)
              await Promise.all(
                values.infos?.map((info) => {
                  const id = info.db_id;
                  console.log(id)
                  if (id) {
                    return invoke("update_info", {
                      id,
                      itemCode: info.item_code,
                      name: info.name,
                      details: info.details
                    });
                  } else {
                    return invoke("create_info", {
                      id: crypto.randomUUID(),
                      itemCode: info.item_code,
                      name: info.name,
                      details: info.details
                    });
                  }
                }) ?? []
              );

            }).catch((e) => {
              toast.warning(e)
              toast.dismiss(loading_toast)
            })
          } else {
            invoke("create_item", { code: values.code, description: values.description, sectionId: section.id, imagePath: imagePath }).then(() => {
              toast.dismiss(loading_toast)
              toast.success(t("item.created_successfully"))
              navigate(-1)
            }).catch(() => {
              toast.dismiss(loading_toast)
              toast.warning(t("item.alrealy_exists"))
            });
          }
        } catch {
          toast.warning(t("item.item_not_created"))
          toast.dismiss(loading_toast)
        }
      });
    });
  }

  const removeInfo = (index: number) => {
    const infos = form.getValues().infos;
    const db_id = infos && infos[index] ? infos[index].db_id : undefined;
    console.log("fields: ", fields)
    if (!db_id) {
      remove(index);
      toast.success("Campo removido do formulário.");
      return;
    }

    invoke("delete_info", { id: db_id })
      .then(() => {
        remove(index);
        toast.success("Campo removido com sucesso.");
      })
      .catch((e) => {
        console.error(e);
        toast.error("Erro ao remover campo.");
      });
  };

  return (
    <div className="flex flex-col h-full max-w-[1280px] w-full">
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
                    <PopoverTrigger disabled={section != null}>
                      <Button
                        disabled={section != null}
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
          {fields.map((item: any, index: number) => (
            <div key={item.id} className="space-y-4 border p-4 rounded-md">
              <FormField
                control={form.control}
                name={`infos.${index}.name`}
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
                name={`infos.${index}.details`}
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
              <Button type="button" variant="destructive" onClick={() => removeInfo(index)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("item.remove")}
              </Button>
            </div>
          ))}
          <div className="flex justify-between">
            {item?.code && <Button
              type="button"
              variant="secondary"
              onClick={() =>
                append({
                  db_id: undefined,
                  item_code: item.code,
                  name: "",
                  details: "",
                })
              }
            >
              <SquarePlus className="mr-2 h-4 w-4" />
              {t("item.add_form_item")}
            </Button>
            }
            <div className="flex gap-3">
              {id ? <Button onClick={(e) => e.preventDefault()} variant={"destructive"}><Trash2 />{t("item.delete")}</Button> : ""}
              <Button type="submit">{params.id ? <CircleCheckIcon /> : <PlusCircleIcon />}{t(params.id ? "item.update" : "item.submit")}</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
};