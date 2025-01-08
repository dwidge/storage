import { after, describe, test } from "node:test";
import assert from "assert";
import fs from "fs";
import axios from "axios";
import { MiniFileServer } from "./MiniFileServer.js";
import path from "path";
import { AxiosError } from "axios";
import { randPort, randSecret, randTmpPath } from "./randTmpPath.js";
import { catchAxios } from "./catchAxios.js";

describe("MiniFileServer", () => {
  const basePath = randTmpPath();
  const hashSecret = randSecret();
  const port = randPort();
  const server = MiniFileServer(
    basePath,
    randTmpPath(),
    randTmpPath(),
    hashSecret,
  );

  server.listen(port);

  const baseUrl = `http://localhost:${port}`;

  test("GET non-existent file", async () => {
    try {
      await axios.get(`${baseUrl}/nonexistent.html`);
      assert.fail();
    } catch (error) {
      assert(error instanceof AxiosError);
      assert.strictEqual(error.response?.status, 404);
    }
  });

  test.skip("PUT new file", async () => {
    const filePath = path.join(basePath, "newfile.txt");
    const fileContent = "Hello, world!";

    const response = await axios
      .put(`${baseUrl}/newfile.txt`, fileContent, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
      .catch(catchAxios(""));

    assert.strictEqual(response.status, 201);

    const savedContent = fs.readFileSync(filePath, "utf-8");
    assert.strictEqual(savedContent, fileContent);
  });

  test.skip("GET existing file", async () => {
    const filePath = path.join(basePath, "existingfile.txt");
    const fileContent = "Existing file content";
    fs.writeFileSync(filePath, fileContent);

    const response = await axios
      .get(`${baseUrl}/existingfile.txt`)
      .catch(catchAxios(""));

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data, fileContent);
  });

  test("Unsupported method", async () => {
    try {
      await axios.post(`${baseUrl}/anyfile.txt`);
      assert.fail();
    } catch (error) {
      assert(error instanceof AxiosError);
      assert.strictEqual(error.response?.status, 405);
    }
  });

  after(async () => {
    server.close();
    fs.rmSync(basePath, { recursive: true, force: true });
  });
});
