// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Readable } from "stream";

export async function getBufferOfStream(stream: Readable) {
  const buffers = [];

  for await (const data of stream) {
    buffers.push(data);
  }

  return Buffer.concat(buffers);
}
