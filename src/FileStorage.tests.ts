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
import { MiniFileServer } from "./MiniFileServer.js";
import { randPort, randSecret, randTmpPath } from "./randTmpPath.js";
import path from "path";

export async function testFileStorage() {
  const metaPath = randTmpPath();
  const hashSecret = randSecret();
  const port = randPort();

  const instance: Storage = new FileStorage({
    getUrl: (key) => `http://localhost:${port}/${key}`,
    putUrl: async (key) => `http://localhost:${port}/${key}`,
    hashSecret,
    ...fileStorageEnv,
  });

  const s = MiniFileServer(
    fileStorageEnv.basePath,
    metaPath,
    fileStorageEnv.tmpPath,
    hashSecret,
  ).listen(port);
  try {
    await testPutGetFilePath(instance);
    await testPutGetStream(instance);
    await testPutGetBuffer(instance);
    await testPutGetUrl(instance);
    await testDeleteObject(instance);
    await testListObjects(instance);
  } finally {
    s.close();
  }
}
