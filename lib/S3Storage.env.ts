// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { z } from "zod";
import { BucketName } from "./types/BucketName";

export const S3StorageEnv = z.object({
  bucket: BucketName,
  region: z.string().nonempty(),
  accessKeyId: z.string().nonempty(),
  secretAccessKey: z.string().nonempty(),
  endpoint: z.string().nonempty(),
  tmpPath: z.string().nonempty(),
});
export type S3StorageEnv = z.infer<typeof S3StorageEnv>;

const {
  S3_BUCKET = "",
  S3_REGION = "",
  S3_KEY_ID = "",
  S3_KEY_SECRET = "",
  S3_ENDPOINT = "",
  S3_TMP_PATH = "tmp",
} = process.env;

export const s3 = S3StorageEnv.parse({
  bucket: S3_BUCKET,
  region: S3_REGION,
  accessKeyId: S3_KEY_ID,
  secretAccessKey: S3_KEY_SECRET,
  endpoint: S3_ENDPOINT,
  tmpPath: S3_TMP_PATH,
});
