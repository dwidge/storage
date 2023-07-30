// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Storage } from "./Storage.js";
import {
  testPutGetFilePath,
  testPutGetStream,
  testPutGetBuffer,
  testPutGetUrl,
  testDeleteObject,
  testListObjects,
} from "./Storage.tests.js";
import { FileStorage } from "./FileStorage.js";
import { fileStorageEnv } from "./FileStorageEnv.js";

export async function testFileStorage() {
  const instance: Storage = new FileStorage(fileStorageEnv);
  await testPutGetFilePath(instance);
  await testPutGetStream(instance);
  await testPutGetBuffer(instance);
  await testPutGetUrl(instance);
  await testDeleteObject(instance);
  await testListObjects(instance);
}
