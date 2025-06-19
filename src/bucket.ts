import { traceAsync } from "@dwidge/trace-js";
import { Storage } from "./Storage";

export const putBucketFilePath = traceAsync(
  "putBucketFilePathE",
  async (
    storage: Storage,
    bucket: string,
    key: string,
    filePath: string,
  ): Promise<void> => storage.putFilePath(bucket + key, filePath),
);

export const getBucketFilePath = traceAsync(
  "getBucketFilePathE",
  async (storage: Storage, bucket: string, key: string): Promise<string> =>
    storage.getFilePath(bucket + key),
);

export const deleteBucketFilePath = traceAsync(
  "deleteBucketFilePathE",
  async (storage: Storage, bucket: string, key: string): Promise<void> =>
    storage.delete(bucket + key),
);
