// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import fs from "fs";

export async function readdirRecursive(dir: string): Promise<string[]> {
  const dirs = await fs.promises
    .readdir(dir, { withFileTypes: true })
    .catch(() => []);
  const acc: string[] = [];
  for (const file of dirs) {
    const subs: string[] = file.isDirectory()
      ? (await readdirRecursive(dir + "/" + file.name)).map(
          (s) => file.name + "/" + s
        )
      : [file.name];
    acc.splice(-1, 0, ...subs);
  }
  return acc;
}
