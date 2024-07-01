// putSignedUrl should return a url with the extra options as query params and a hash of them with the hashSecret.
// MiniFileServer put request should check the signed url hash using the hashSecret. if access is public-read or public-read-write, it should put files under {basePath}/{keydir}/{keyfile}, otherwise under {basePath}/{keydir}/.{keyfile}
// if get file without signed url (no hash), only serve file if not hidden, like {basePath}/{keydir}/{keyfile}
// if get file with hash, check the hash before serving private {basePath}/{keydir}/.{keyfile}

import { z } from "zod";

export const Access = z.enum(["private", "public-read", "public-read-write"]);
export type Access = z.infer<typeof Access>;

export const PutOptions = z
  .object({
    size: z.number().int().min(0),
    mime: z.string(),
    expires: z.number().int().min(1).max(604800),
    access: Access,
    sha256: z
      .string()
      .length(64)
      .regex(/^[A-Fa-f0-9]{64}$/),
  })
  .partial();
export type PutOptions = z.infer<typeof PutOptions>;

const hashSecret = "abc123";

export class FileStorage {
  async putSignedUrl(
    key: string,
    options: PutOptions = {}
  ): Promise<{ url: string; headers: Record<string, string> }> {
    const {} = PutOptions.parse(options);
    const url = "";
    const headers = {};
    return { url, headers };
  }
}

import http from "http";
import fs from "fs";
import path from "path";

export const MiniFileServer = (basePath: string) =>
  http.createServer(async (req, res) => {
    try {
      console.log("MiniFileServer1", req.url, req.method);
      const key = z
        .string()
        .regex(/^[\w/]*/)
        .parse(req.url ?? "index.htm");
      const filepath = path.join(basePath, key);
      const dirpath = path.dirname(filepath);
      console.log("MiniFileServer2", { filepath, dirpath, key });
      await fs.promises.mkdir(dirpath, { recursive: true });

      if (req.method === "GET") {
        fs.readFile(filepath, (err, data) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "text/html" });
            return res.end("404 Not Found");
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          return res.end();
        });
      } else if (req.method === "PUT") {
        const fileStream = fs.createWriteStream(filepath);
        req.pipe(fileStream);

        fileStream.on("finish", () => {
          console.log("MiniFileServer3");
          res.writeHead(201, { "Content-Type": "text/html" });
          res.end("File uploaded");
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
      console.log(e);
    }
  });
