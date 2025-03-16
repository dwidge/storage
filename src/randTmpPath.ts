import fs from "fs";
import path from "path";

export const randTmpPath = () => {
  const basePath = path.join(
    __dirname,
    "tmp/MiniFileServer",
    Math.random().toFixed(5).slice(2),
  );
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
  return basePath;
};

export const randPort = () => (3050 + Math.random() * 500) | 0;

export const randSecret = () => Math.random().toFixed(10).slice(2);
