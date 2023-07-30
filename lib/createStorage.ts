// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Storage } from "./Storage.js";
import { FileStorage } from "./FileStorage.js";
import { S3Storage } from "./S3Storage.js";
import { StorageConfig, StorageConfigInput } from "./StorageConfig.js";

export const createStorage = (config: StorageConfigInput): Storage =>
  ({
    s3: () => new S3Storage(config.s3),
    fs: () => new FileStorage(config.fs),
  }[StorageConfig.parse(config).type]());
