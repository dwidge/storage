//stackoverflow.com/a/63361543

import { Readable } from "stream";

export async function getStringOfStream(stream: Readable) {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
}
