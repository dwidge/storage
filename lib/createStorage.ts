// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Storage } from "./Storage";
import { FileStorage } from "./FileStorage";
import { S3Storage } from "./S3Storage";
import { StorageConfig } from "./StorageConfig";

export const createStorage = (config: StorageConfig): Storage =>
  ({
    s3: () => new S3Storage(config.s3),
    fs: () => new FileStorage(config.fs),
  }[config.type]());
