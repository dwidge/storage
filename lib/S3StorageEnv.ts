// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

const {
  S3_BUCKET = "",
  S3_REGION = "",
  S3_KEY_ID = "",
  S3_KEY_SECRET = "",
  S3_ENDPOINT = "",
  S3_TMP_PATH = "tmp",
} = process.env;

export const s3StorageEnv = {
  bucket: S3_BUCKET,
  region: S3_REGION,
  accessKeyId: S3_KEY_ID,
  secretAccessKey: S3_KEY_SECRET,
  endpoint: S3_ENDPOINT,
  tmpPath: S3_TMP_PATH,
};
