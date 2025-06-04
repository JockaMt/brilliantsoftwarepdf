import { z } from "zod"

export const getFormSchema = (t: (key: string) => string) => z.object({
  image: z
    .string()
    .refine((file) => file?.length !== 0, {
      message: t("validation.image_required"),
    }),
    section: z
    .string()
    .min(1, t("validation.section_required")),
  code: z
    .string()
    .refine((file) => file?.length !== 0, {
      message: t("validation.code_required"),
    }),
  items: z.array(z.object({
    name: z.string().min(1, { message: t("validation.name_required") }),
    value: z.string().min(1, { message: t("validation.value_required") }),
  })).min(1, { message: t("validation.at_least_one_item") })
})
