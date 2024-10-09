// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import * as fs from "fs";
import * as path from "path";

export async function deletePath(filePath: string): Promise<void> {
  // Delete the file
  await fs.promises.unlink(filePath);

  // Delete each parent directory if it becomes empty
  let currentDir = path.dirname(filePath);
  while (currentDir !== ".") {
    try {
      await fs.promises.rmdir(currentDir);
    } catch (error) {
      break;
    }

    currentDir = path.dirname(currentDir);
  }
}
