import z from "zod";

export const Sha256Hex = z
  .string()
  .length(64)
  .regex(/^[A-Fa-f0-9]{64}$/);
export type Sha256Hex = z.infer<typeof Sha256Hex>;
