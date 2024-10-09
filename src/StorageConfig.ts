// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { FileStorageConfig } from "./FileStorageConfig.js";
import { S3StorageConfig } from "./S3StorageConfig.js";
import z from "zod";

export const StorageConfig = z.union([
  z.object({
    type: z.literal("fs"),
    fs: FileStorageConfig,
  }),
  z.object({
    type: z.literal("s3"),
    s3: S3StorageConfig,
  }),
]);
export type StorageConfigInput = z.input<typeof StorageConfig>;
export type StorageConfig = z.infer<typeof StorageConfig>;
