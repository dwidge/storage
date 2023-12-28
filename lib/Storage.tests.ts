// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

// ChatGPT

import { Storage } from "./Storage.js";
import { getStringOfStream } from "./utils/getStringOfStream.js";
import makeId from "./utils/makeId.js";
import { expect } from "@jest/globals";
import fs from "fs";
import axios from "axios";
import { Readable } from "stream";

const testKeyBase = "tmp/test";
const testTmpDir = "tmp/setup";

const withTempDir = async (dir: string, f: (dir: string) => Promise<void>) => {
  await fs.promises.mkdir(dir, { recursive: true });
  return f(dir).finally(() => fs.promises.rm(dir, { recursive: true }));
};

export async function testPutGetFilePath(instance: Storage) {
  await withTempDir(testTmpDir + "/" + makeId(), async (testTmpDir) => {
    const tmp = testKeyBase + "/testPutGetFilePath" + makeId();
    try {
      await fs.promises.writeFile(`${testTmpDir}/test.txt`, "abc");
      await instance.putFilePath(`${tmp}/folder/c`, `${testTmpDir}/test.txt`);
      expect(await instance.listAll(`${tmp}/`)).toEqual(["folder/c"]);
      expect(await instance.listDir(`${tmp}/`)).toEqual(["folder"]);
      const filePath = await instance.getFilePath(`${tmp}/folder/c`);
      const content = await fs.promises.readFile(filePath);
      await fs.promises.unlink(filePath);
      expect(content.toString()).toBe("abc");
    } finally {
      await instance.delete(`${tmp}/folder/c`);
    }
  });
}

export async function testPutGetStream(instance: Storage) {
  await withTempDir(testTmpDir + "/" + makeId(), async (testTmpDir) => {
    const tmp = testKeyBase + "/testPutGetStream" + makeId();
    try {
      await fs.promises.writeFile(`${testTmpDir}/test.txt`, "abc");
      const original = await fs.promises.readFile(`${testTmpDir}/test.txt`);
      await instance.putStream(`${tmp}/folder/c`, Readable.from(original));
      expect(await instance.listAll(`${tmp}/`)).toEqual(["folder/c"]);
      expect(await instance.listDir(`${tmp}/`)).toEqual(["folder"]);
      const stream = await instance.getStream(`${tmp}/folder/c`);
      expect(await getStringOfStream(stream)).toBe("abc");
    } finally {
      await instance.delete(`${tmp}/folder/c`);
    }
  });
}

export async function testPutGetBuffer(instance: Storage) {
  await withTempDir(testTmpDir + "/" + makeId(), async (testTmpDir) => {
    const tmp = testKeyBase + "/testPutGetBuffer" + makeId();
    try {
      await fs.promises.writeFile(`${testTmpDir}/test.txt`, "abc", {
        encoding: "utf8",
      });
      const original = await fs.promises.readFile(`${testTmpDir}/test.txt`);
      await instance.putBuffer(`${tmp}/folder/c`, original);
      expect((await instance.listAll("", 10)).length).toBeGreaterThan(0);
      expect(await instance.listAll(`${tmp}/`)).toEqual(["folder/c"]);
      expect(await instance.listDir(`${tmp}/`)).toEqual(["folder"]);
      const restored = await instance.getBuffer(`${tmp}/folder/c`);
      expect(restored.toString("utf8")).toBe("abc");
    } finally {
      await instance.delete(`${tmp}/folder/c`);
    }
  });
}

export async function testPutGetUrl(instance: Storage) {
  await withTempDir(testTmpDir + "/" + makeId(), async (testTmpDir) => {
    const tmp = testKeyBase + "/testPutGetUrl" + makeId();
    try {
      await fs.promises.writeFile(`${testTmpDir}/test.txt`, "abc");

      const original = fs.createReadStream(`${testTmpDir}/test.txt`);
      await instance.putStream(`${tmp}/folder/c`, original, {
        access: "public-read",
      });
      expect((await instance.listAll("", 10)).length).toBeGreaterThan(0);
      expect(await instance.listAll(`${tmp}/`)).toEqual(["folder/c"]);
      expect(await instance.listDir(`${tmp}/`)).toEqual(["folder"]);
      const url = await instance.getUrl(`${tmp}/folder/c`);
      expect(url).toMatch("//");
      const r = await axios.get(url).catch((e) => {
        throw new Error("testPutGetUrlE1: " + e.message, { cause: e.url });
      });
      expect(r.data).toBe("abc");
    } finally {
      await instance.delete(`${tmp}/folder/c`);
    }
  });
}

export async function testDeleteObject(instance: Storage) {
  await withTempDir(testTmpDir + "/" + makeId(), async (testTmpDir) => {
    const tmp = testKeyBase + "/testDeleteObject" + makeId();
    try {
      await fs.promises.writeFile(`${testTmpDir}/test.txt`, "abc");
      await instance.putStream(
        `${tmp}/folder/c`,
        fs.createReadStream(`${testTmpDir}/test.txt`)
      );
      await instance.delete(`${tmp}/folder/c`);
      expect(await instance.listAll(`${tmp}/`)).toEqual([]);
      expect(await instance.listDir(`${tmp}/`)).toEqual([]);
      await expect(instance.getStream(`${tmp}/folder/c`)).rejects.toThrow(
        Error
      );
    } finally {
      await instance.delete(`${tmp}/folder/c`);
    }
  });
}

export async function testListObjects(instance: Storage) {
  await withTempDir(testTmpDir + "/" + makeId(), async (testTmpDir) => {
    const tmp = testKeyBase + "/testListObjects" + makeId();
    try {
      expect(await instance.listAll(`${tmp}/`)).toEqual([]);
      expect(await instance.listDir(`${tmp}/`)).toEqual([]);
    } finally {
    }
  });
}
