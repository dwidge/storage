// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Readable } from "stream";
import { Access } from "./types/Access.js";

export interface Storage {
  putFilePath: (
    key: string,
    filePath: string,
    options?: Partial<{ access: Access }>
  ) => Promise<void>;
  putStream: (
    key: string,
    stream: Readable,
    options?: Partial<{ access: Access }>
  ) => Promise<void>;
  putBuffer: (
    key: string,
    buffer: Buffer,
    options?: Partial<{ access: Access }>
  ) => Promise<void>;
  getFilePath: (key: string) => Promise<string>;
  getStream: (key: string) => Promise<Readable>;
  getBuffer: (key: string) => Promise<Buffer>;
  getUrl(key: string, expires?: number): Promise<string>;
  delete: (key: string) => Promise<void>;
  listDir: (keyPrefix: string, limit?: number) => Promise<string[]>;
  listAll: (keyPrefix: string, limit?: number) => Promise<string[]>;
}
