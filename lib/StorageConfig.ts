// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { FileStorageConfig } from "./FileStorageConfig";
import { S3StorageConfig } from "./S3StorageConfig";
import { z } from "zod";

export const StorageConfig = z.object({
  type: z.enum(["fs", "s3"]),
  fs: FileStorageConfig,
  s3: S3StorageConfig,
});
export type StorageConfig = z.infer<typeof StorageConfig>;
