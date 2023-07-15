// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import S3 from "aws-sdk/clients/s3";
import { catchError } from "./catchError";

//stackoverflow.com/a/49888947
export async function* getMoreKeys(
  s3: S3,
  params: S3.ListObjectsV2Request
): AsyncGenerator<string, void, void> {
  const response = await s3
    .listObjectsV2(params)
    .promise()
    .catch(catchError("getMoreKeysE1"));

  for (const obj of response.Contents ?? []) {
    if (obj.Key) yield obj.Key;
  }
  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    yield* getMoreKeys(s3, params);
  }
}

export async function getMoreKeysFlat(
  s3: S3,
  params: S3.ListObjectsV2Request,
  allKeys: string[] = [],
  max: number = 1000
) {
  const response = await s3
    .listObjectsV2(params)
    .promise()
    .catch(catchError("getMoreKeysFlatE1"));

  response.Contents?.forEach((obj) => {
    if (obj.Key) allKeys.push(obj.Key);
  });
  if (allKeys.length < max && response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getMoreKeysFlat(s3, params, allKeys);
  }
  return allKeys;
}
