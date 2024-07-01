// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { z } from "zod";

export const FileStorageConfig = z.object({
  basePath: z.string(),
  tmpPath: z.string(),
  hashSecret: z.string().min(3).optional(),
  getUrl: z.function().args(z.string()).returns(z.string()).optional(),
  putUrl: z
    .function()
    .args(z.string())
    .returns(z.string().promise())
    .optional(),
});
export type FileStorageConfig = z.infer<typeof FileStorageConfig>;
