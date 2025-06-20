import { traceAsync } from "@dwidge/trace-js";
import { promises } from "fs";

export const mkDir = traceAsync(
  "mkDirE",
  async (dir: string): Promise<string | undefined> =>
    promises.mkdir(dir, { recursive: true }),
);

export const rmDir = traceAsync(
  "rmDirE",
  async (dir: string): Promise<void> =>
    promises.rm(dir, { recursive: true, force: true }),
);

export const copyDir = traceAsync(
  "copyDirE",
  async (src: string, dest: string): Promise<void> =>
    promises.cp(src, dest, { recursive: true }),
);
