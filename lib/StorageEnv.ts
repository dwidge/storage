// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { fileStorageEnv } from "./FileStorageEnv.js";
import { s3StorageEnv } from "./S3StorageEnv.js";

const { STORAGE_TYPE = "fs" } = process.env;

export const storageEnv = {
  type: STORAGE_TYPE,
  fs: STORAGE_TYPE === "fs" ? fileStorageEnv : undefined,
  s3: STORAGE_TYPE === "s3" ? s3StorageEnv : undefined,
};
