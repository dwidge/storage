// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { z } from "zod";

export const FileStorageConfig = z.object({
  basePath: z.string(),
  tmpPath: z.string(),
  getUrl: z.function().args(z.string()).returns(z.string()).optional(),
});
export type FileStorageConfig = z.infer<typeof FileStorageConfig>;
