import { z } from "zod"

export const ProductImportSchema = z.object({

  Name: z.string().min(1),

  Description: z.string().min(1),

  Price: z.number().positive(),

  Stock: z.number().int().nonnegative(),

  Brand: z.string().min(1),

  Category: z.enum([
    "Cars",
    "Protectors",
  ]),

  Badge: z.string().optional(),

  Image: z.string().min(1),

})

export type ProductImport =
  z.infer<typeof ProductImportSchema>