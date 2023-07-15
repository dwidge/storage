// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Storage } from "./Storage";
import {
  testPutGetFilePath,
  testPutGetStream,
  testDeleteObject,
  testListObjects,
} from "./Storage.tests";
import FileStorage from "./FileStorage";
import { fs } from "./FileStorage.env";

export async function testFileStorage() {
  const instance: Storage = new FileStorage(fs);
  await testPutGetFilePath(instance);
  await testPutGetStream(instance);
  await testDeleteObject(instance);
  await testListObjects(instance);
}
