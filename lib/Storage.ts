// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Readable } from "stream";

export interface Storage {
  putFilePath: (key: string, filePath: string) => Promise<void>;
  putStream: (key: string, stream: Readable) => Promise<void>;
  getFilePath: (key: string) => Promise<string>;
  getStream: (key: string) => Promise<Readable>;
  delete: (key: string) => Promise<void>;
  listDir: (keyPrefix: string, limit?: number) => Promise<string[]>;
  listAll: (keyPrefix: string, limit?: number) => Promise<string[]>;
}
