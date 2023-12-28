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

import http from "http";
import fs from "fs";
import path from "path";

const testPort = 8088;
const server = http.createServer((req, res) => {
  const filepath = path.join(fileStorageEnv.basePath, req.url ?? "");
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("404 Not Found");
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  });
});

export async function testFileStorage() {
  const instance: Storage = new FileStorage({
    getUrl: (key) => `http://localhost:${testPort}/${key}`,
    ...fileStorageEnv,
  });
  const s = server.listen(testPort);
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
