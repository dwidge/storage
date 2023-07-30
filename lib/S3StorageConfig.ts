// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { z } from "zod";
import { BucketName } from "./types/BucketName.js";

export const S3StorageConfig = z.object({
  bucket: BucketName,
  region: z.string().nonempty(),
  accessKeyId: z.string().nonempty(),
  secretAccessKey: z.string().nonempty(),
  endpoint: z.string().nonempty(),
  tmpPath: z.string().nonempty(),
});
export type S3StorageConfig = z.infer<typeof S3StorageConfig>;
