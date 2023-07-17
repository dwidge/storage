// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

// ChatGPT

import { Storage } from "./Storage";
import { Readable } from "stream";
import { catchError } from "./utils/catchError";
import fs from "fs";
import Path from "path";
import { readdirRecursive } from "./utils/readdirRecursive";
import { deletePath } from "./utils/deletePath";
import { FileStorageConfig } from "./FileStorageConfig";

export class FileStorage implements Storage {
  private basePath: string;

  constructor(config: FileStorageConfig) {
    const { basePath } = FileStorageConfig.parse(config);
    this.basePath = basePath;
    fs.promises.mkdir(basePath, { recursive: true });
  }

  async putFilePath(key: string, filePath: string) {
    const fullPath = `${this.basePath}/${key}`;
    await fs.promises
      .mkdir(Path.dirname(fullPath), { recursive: true })
      .catch(catchError("putFilePathFileStorageE1"));
    await fs.promises
      .copyFile(filePath, fullPath)
      .catch(catchError("putFilePathFileStorageE2"));
  }

  async putStream(key: string, stream: Readable) {
    const fullPath = `${this.basePath}/${key}`;
    await fs.promises
      .mkdir(Path.dirname(fullPath), { recursive: true })
      .catch(catchError("putStreamFileStorageE1"));
    const writeStream = fs.createWriteStream(fullPath);
    stream.pipe(writeStream);
    return new Promise<void>((resolve, reject) => {
      writeStream.on("finish", () => resolve());
      writeStream.on("error", (cause: unknown) =>
        reject(new Error("putStreamFileStorageE2", { cause }))
      );
    });
  }

  async getFilePath(key: string) {
    const fullPath = `${this.basePath}/${key}`;
    await fs.promises
      .access(fullPath, fs.constants.F_OK)
      .catch(catchError("getFilePathFileStorageE1"));
    return fullPath;
  }

  async getStream(key: string): Promise<Readable> {
    const fullPath = `${this.basePath}/${key}`;
    await fs.promises
      .access(fullPath, fs.constants.R_OK)
      .catch(catchError("getStreamFileStorageE1"));
    return fs.createReadStream(fullPath);
  }

  async getUrl(_key: string, _expires: number = Infinity): Promise<string> {
    throw new Error("getUrlFileStorageE1");
  }

  async delete(key: string) {
    const fullPath = `${this.basePath}/${key}`;
    await deletePath(fullPath).catch((e) => {
      if (e.code === "ENOENT") return;
      catchError("deleteFileStorageE2");
    });
  }

  async listDir(keyPrefix: string, limit?: number) {
    const fullPath = `${this.basePath}/${keyPrefix}`;
    const files = await fs.promises.readdir(fullPath).catch(() => []);
    return files.slice(0, limit);
  }

  async listAll(keyPrefix: string, limit?: number) {
    const fullPath = `${this.basePath}/${keyPrefix}`;
    const files = await readdirRecursive(fullPath).catch(
      catchError("listAllFileStorageE1")
    );
    return files.slice(0, limit);
  }
}
