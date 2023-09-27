// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

const { STORAGE_FS_BASE_PATH = "files", STORAGE_FS_TMP_PATH = "tmp" } =
  process.env;

export const fileStorageEnv = {
  basePath: STORAGE_FS_BASE_PATH,
  tmpPath: STORAGE_FS_TMP_PATH,
};
