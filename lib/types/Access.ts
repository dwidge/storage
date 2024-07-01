import z from "zod";

export const Access = z.enum(["private", "public-read", "public-read-write"]);
export type Access = z.infer<typeof Access>;
