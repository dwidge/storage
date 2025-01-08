import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import z, { ZodError } from "zod";
import { PutOptions } from "./types/PutOptions.js";
import { verifyHash } from "./verifyHash.js";
import { randSecret } from "./randTmpPath.js";
import { Access } from "./types/Access.js";
import { hashStream } from "./hashStream.js";
import { fromQueryString } from "./fromQueryString.js";

export const MiniFileServer = (
  baseDir: string,
  metaDir: string,
  tmpDir: string,
  hashSecret: string,
) =>
  http.createServer(async (req, res) => {
    const getTargetFilePath = (key: string, access: Access) =>
      path.join(baseDir, key);

    const getMetaFilePath = (key: string) => path.join(metaDir, `${key}.json`);

    try {
      const parsedUrl = url.parse(req.url || "", true);
      const key = z
        .string()
        .regex(/^[\w](?!.*\.\.)([\w./]*)[\w]$/)
        .parse(parsedUrl.pathname?.slice(1));
      const filepath = path.join(baseDir, key);
      const filename = path.basename(filepath);

      if (req.method === "GET") {
        const metaFilePath = getMetaFilePath(key);
        let meta;
        try {
          meta = JSON.parse(await fs.promises.readFile(metaFilePath, "utf-8"));
        } catch (err) {
          res.writeHead(404, { "Content-Type": "text/html" });
          return res.end("Metadata not found");
        }
        const access = Access.parse(meta.access);

        if (access === "private") {
          const hash = z.string().parse(parsedUrl.query.hash);
          const options = PutOptions.parse(fromQueryString(parsedUrl.query));
          const salt = z.string().parse(parsedUrl.query.salt);
          if (!verifyHash(hashSecret, { ...options, key, salt }, hash)) {
            res.writeHead(403, { "Content-Type": "text/html" });
            res.end("Forbidden");
          }
        }

        const targetFilepath = getTargetFilePath(key, access);

        const ext = path.extname(key);
        const mime =
          parsedUrl.query.mime ??
          { ".txt": "text/plain" }[ext] ??
          "application/octet-stream";

        fs.readFile(targetFilepath, (err, data) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "text/html" });
            return res.end("404 Not Found");
          }
          res.writeHead(200, { "Content-Type": mime });
          res.write(data);
          return res.end();
        });
      } else if (req.method === "PUT") {
        const options = PutOptions.parse(fromQueryString(parsedUrl.query));
        const salt = z.string().parse(parsedUrl.query.salt);
        const hash = z.string().parse(parsedUrl.query.hash);

        if (!verifyHash(hashSecret, { ...options, key, salt }, hash)) {
          res.writeHead(403, { "Content-Type": "text/html" });
          return res.end("Forbidden");
        }

        const access = options.access || "private";
        const tmpFilepath = path.join(
          tmpDir,
          `${filename}.${randSecret()}.tmp`,
        );

        await fs.promises.mkdir(tmpDir, { recursive: true });

        const fileStream = fs.createWriteStream(tmpFilepath);
        req.pipe(fileStream);

        fileStream.on("finish", async () => {
          try {
            const stats = await fs.promises.stat(tmpFilepath);
            const fileSize = stats.size;

            if (fileSize !== options.size) {
              await fs.promises.unlink(tmpFilepath);
              res.writeHead(413, { "Content-Type": "text/html" });
              return res.end("File too large/small");
            }

            const fileSha256 = await hashStream(tmpFilepath);
            if (fileSha256 !== options.sha256) {
              await fs.promises.unlink(tmpFilepath);
              res.writeHead(422, { "Content-Type": "text/html" });
              return res.end("Mismatch sha256");
            }

            const targetFilepath = getTargetFilePath(key, access);
            await fs.promises.mkdir(path.dirname(targetFilepath), {
              recursive: true,
            });

            await fs.promises.rename(tmpFilepath, targetFilepath);

            const metaFilePath = getMetaFilePath(key);
            const meta = {
              access,
              sha256: fileSha256,
            };
            await fs.promises.mkdir(path.dirname(metaFilePath), {
              recursive: true,
            });
            await fs.promises.writeFile(
              metaFilePath,
              JSON.stringify(meta, null, 2),
            );

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("File uploaded and verified");
          } catch (err) {
            console.error(err);
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("Internal Server Error");
          }
        });

        fileStream.on("error", (err) => {
          console.log("MiniFileServer4", err);
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("Internal Server Error");
        });
      } else {
        res.writeHead(405, { "Content-Type": "text/html" });
        res.end("Method Not Allowed");
      }
    } catch (e) {
      if (e instanceof ZodError) {
        res.writeHead(422, { "Content-Type": "text/html" });
        res.end(
          e.issues
            .map((v) => "[" + v.path.join(".") + "] " + v.message)
            .join("; "),
        );
      } else {
        console.error(e);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("Internal Server Error");
      }
    }
  });
