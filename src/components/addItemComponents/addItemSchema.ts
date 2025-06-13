import { z } from "zod";

export const getFormSchema = (t: (key: string) => string) =>
  z.object({
    image: z.instanceof(File, {
      message: t("validation.image_required"),
    }),

    section: z.string({message: t("validation.section_required")}).min(1, {message: t("validation.section_required")}),

    code: z.string({message: t("validation.code_required")}).min(1, t("validation.code_required")),

    description: z.string({message: t("validation.description_required")}).min(1, t("validation.description_required")),

    items: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().min(1, "Campo obrigatório"),
          details: z.string().min(1, "Campo obrigatório"),
        })
      )
      .optional(),
  });