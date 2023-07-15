// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import {
  testPutGetFilePath,
  testPutGetStream,
  testDeleteObject,
  testListObjects,
} from "./Storage.tests";
import S3Storage from "./S3Storage";
import { s3 } from "./S3Storage.env";

export async function testPutGetFilePathS3Storage() {
  await testPutGetFilePath(new S3Storage(s3));
}

export async function testPutGetStreamS3Storage() {
  await testPutGetStream(new S3Storage(s3));
}

export async function testDeleteObjectS3Storage() {
  await testDeleteObject(new S3Storage(s3));
}

export async function testListObjectsS3Storage() {
  await testListObjects(new S3Storage(s3));
}
