import z from "zod";
import { Access } from "./Access.js";
import { Sha256Hex } from "./Sha256Hex.js";

export const PutOptions = z.object({
  size: z.coerce
    .number()
    .int()
    .min(0)
    .max(32 * 1024 * 1024),
  mime: z.string().default("application/octet-stream"),
  expires: z.coerce.number().int().min(1).max(604800).default(3600),
  access: Access.default("private"),
  sha256: Sha256Hex.optional(),
});
export type PutOptions = z.infer<typeof PutOptions>;
