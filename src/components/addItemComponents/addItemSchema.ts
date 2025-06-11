import { z } from "zod";

export const getFormSchema = (t: (key: string) => string) =>
  z.object({
    image: z.string().refine((file) => file?.length !== 0, {
      message: t("validation.image_required"),
    }),
    section: z.string().min(1, t("validation.section_required")),
    code: z.string().refine((file) => file?.length !== 0, {
      message: t("validation.code_required"),
    }),
    description: z.string().refine((file) => file?.length !== 0, {
      message: t("validation.description_required"),
    }),
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
