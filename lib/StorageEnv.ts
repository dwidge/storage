// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { fileStorageEnv } from "./FileStorageEnv";
import { s3StorageEnv } from "./S3StorageEnv";

const { STORAGE_TYPE = "fs" } = process.env;

export const storageEnv = {
  type: STORAGE_TYPE,
  fs: fileStorageEnv,
  s3: s3StorageEnv,
};
