// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Storage } from "./Storage";
import FileStorage from "./FileStorage";
import { FileStorageEnv } from "./FileStorage.env";
import S3Storage from "./S3Storage";
import { z } from "zod";
import { S3StorageEnv } from "./S3Storage.env";

export const StorageEnv = z.object({
  type: z.enum(["fs", "s3"]),
  fs: FileStorageEnv,
  s3: S3StorageEnv,
});
export type StorageEnv = z.infer<typeof StorageEnv>;

export default function createStorage(config: StorageEnv): Storage {
  return {
    s3: () => new S3Storage(config.s3),
    fs: () => new FileStorage(config.fs),
  }[config.type]();
}
