// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { z } from "zod";

export const FileStorageEnv = z.object({
  basePath: z.string(),
  tmpPath: z.string(),
});
export type FileStorageEnv = z.infer<typeof FileStorageEnv>;

const { FS_BASE_PATH = "data", FS_TMP_PATH = "tmp" } = process.env;

export const fs = FileStorageEnv.parse({
  basePath: FS_BASE_PATH,
  tmpPath: FS_TMP_PATH,
});
