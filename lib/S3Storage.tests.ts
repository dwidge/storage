// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import {
  testPutGetFilePath,
  testPutGetStream,
  testPutGetUrl,
  testDeleteObject,
  testListObjects,
} from "./Storage.tests.js";
import { S3Storage } from "./S3Storage.js";
import { s3StorageEnv } from "./S3StorageEnv.js";

export async function testPutGetFilePathS3Storage() {
  await testPutGetFilePath(new S3Storage(s3StorageEnv));
}

export async function testPutGetStreamS3Storage() {
  await testPutGetStream(new S3Storage(s3StorageEnv));
}

export async function testPutGetUrlS3Storage() {
  await testPutGetUrl(new S3Storage(s3StorageEnv));
}

export async function testDeleteObjectS3Storage() {
  await testDeleteObject(new S3Storage(s3StorageEnv));
}

export async function testListObjectsS3Storage() {
  await testListObjects(new S3Storage(s3StorageEnv));
}
