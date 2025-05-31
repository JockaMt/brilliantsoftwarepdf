import {z} from "zod";

export const formSchema = z.object({
  section: z.string().min(1).max(50).nonempty().toLowerCase(),
})
