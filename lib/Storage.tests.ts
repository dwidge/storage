// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

// ChatGPT

import { Storage } from "./Storage";
import { getStringOfStream } from "./utils/getStringOfStream";
import makeId from "./utils/makeId";
import { expect } from "@jest/globals";
import fs from "fs";

const testPath = "tmp/test";

async function beforeEach(tmp: string) {
  await fs.promises.mkdir(tmp, { recursive: true });
}

async function afterEach(tmp: string) {
  await fs.promises.rm(tmp, { recursive: true });
}

export async function testPutGetFilePath(instance: Storage) {
  const tmp = testPath + "/" + makeId();
  try {
    await beforeEach(tmp);
    await fs.promises.writeFile(`${tmp}/test.txt`, "abc");

    await instance.putFilePath(`${tmp}/folder/c`, `${tmp}/test.txt`);
    expect(await instance.listAll(tmp)).toEqual(["folder/c"]);
    expect(await instance.listDir(tmp)).toEqual(["folder"]);
    const content = await fs.promises.readFile(
      await instance.getFilePath(`${tmp}/folder/c`)
    );
    expect(content.toString()).toBe("abc");
  } finally {
    await instance.delete(`${tmp}/folder/c`);

    await fs.promises.unlink(`${tmp}/test.txt`);
    await afterEach(tmp);
  }
}

export async function testPutGetStream(instance: Storage) {
  const tmp = testPath + "/" + makeId();
  try {
    await beforeEach(tmp);
    await fs.promises.writeFile(`${tmp}/test.txt`, "abc");

    const original = fs.createReadStream(`${tmp}/test.txt`);
    await instance.putStream(`${tmp}/folder/c`, original);
    expect(await instance.listAll(tmp)).toEqual(["folder/c"]);
    expect(await instance.listDir(tmp)).toEqual(["folder"]);
    const stream = await instance.getStream(`${tmp}/folder/c`);
    expect(await getStringOfStream(stream)).toBe("abc");
  } finally {
    await instance.delete(`${tmp}/folder/c`);

    await fs.promises.unlink(`${tmp}/test.txt`);
    await afterEach(tmp);
  }
}

export async function testDeleteObject(instance: Storage) {
  const tmp = testPath + "/" + makeId();
  try {
    await beforeEach(tmp);
    await fs.promises.writeFile(`${tmp}/test.txt`, "abc");
    await instance.putStream(
      `${tmp}/folder/c`,
      fs.createReadStream(`${tmp}/test.txt`)
    );
    await instance.delete(`${tmp}/folder/c`);
    expect(await instance.listAll(tmp)).toEqual([]);
    expect(await instance.listDir(tmp)).toEqual([]);
    await expect(instance.getStream(`${tmp}/folder/c`)).rejects.toThrow(Error);
    await instance.delete(`${tmp}/folder/c`);
  } finally {
    await fs.promises.unlink(`${tmp}/test.txt`);
    await afterEach(tmp);
  }
}

export async function testListObjects(instance: Storage) {
  const tmp = testPath + "/" + makeId();
  try {
    await beforeEach(tmp);
    expect(await instance.listAll(tmp)).toEqual([]);
    expect(await instance.listDir(tmp)).toEqual([]);
  } finally {
    await afterEach(tmp);
  }
}
