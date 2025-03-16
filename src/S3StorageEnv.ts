// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

const {
  STORAGE_S3_BUCKET = "",
  STORAGE_S3_REGION = "",
  STORAGE_S3_KEY_ID = "",
  STORAGE_S3_KEY_SECRET = "",
  STORAGE_S3_ENDPOINT = "",
  STORAGE_S3_TMP_PATH = "tmp",
  STORAGE_S3_ENABLE_VERSIONING = "",
} = process.env;

export const s3StorageEnv = {
  bucket: STORAGE_S3_BUCKET,
  region: STORAGE_S3_REGION,
  accessKeyId: STORAGE_S3_KEY_ID,
  secretAccessKey: STORAGE_S3_KEY_SECRET,
  endpoint: STORAGE_S3_ENDPOINT,
  tmpPath: STORAGE_S3_TMP_PATH,
  enableVersioning:
    STORAGE_S3_ENABLE_VERSIONING === "true"
      ? true
      : STORAGE_S3_ENABLE_VERSIONING === "false"
        ? false
        : undefined,
};
