import z from "zod";

export const GetOptions = z
  .object({
    expires: z.number().int().min(1).max(604800),
  })
  .partial();
export type GetOptions = z.infer<typeof GetOptions>;
