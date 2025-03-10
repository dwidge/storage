// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Storage } from "./Storage.js";
import { S3StorageConfig } from "./S3StorageConfig.js";
import { unique } from "./utils/unique.js";
import { catchError } from "./utils/catchError.js";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  ListObjectsCommand,
  BucketAlreadyExists,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getBufferOfStream } from "./utils/getBufferOfStream.js";
import { Access } from "./types/Access.js";
import { PutOptions } from "./types/PutOptions.js";
import { GetOptions } from "./types/GetOptions.js";
import assert from "assert";

export class S3Storage implements Storage {
  private s3: S3Client;
  private bucket: string;
  private tmpPath: string;

  constructor(config: S3StorageConfig) {
    const { bucket, region, accessKeyId, secretAccessKey, endpoint, tmpPath } =
      S3StorageConfig.parse(config);
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint,
      forcePathStyle: endpoint.includes("localhost"),
    });
    this.bucket = bucket;
    this.tmpPath = tmpPath;
  }

  async putFilePath(
    key: string,
    filePath: string,
    { access = "private" }: { access?: Access } = {}
  ) {
    await this.putStream(key, fs.createReadStream(filePath), { access });
  }

  async putStream(
    key: string,
    stream: Readable,
    { access = "private" }: { access?: Access } = {}
  ) {
    await this.s3
      .send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: await getBufferOfStream(stream),
          ACL: access,
        })
      )
      .catch(catchError("putStreamS3StorageE1"));
  }

  async putBuffer(
    key: string,
    buffer: Buffer,
    { access = "private" }: { access?: Access } = {}
  ) {
    await this.s3
      .send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ACL: access,
        })
      )
      .catch(catchError("putBufferS3StorageE1"));
  }

  async getFilePath(key: string) {
    assert(key, "getFilePathE5");

    const { Body } = await this.s3
      .send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      )
      .catch(catchError("getFilePathS3StorageE1"));

    if (!Body) throw new Error("getFilePathS3StorageE2");

    const filePath = path.join(this.tmpPath, key);
    const directoryPath = path.dirname(filePath);

    await fs.promises
      .mkdir(directoryPath, { recursive: true })
      .catch(catchError("getFilePathS3StorageE3: " + key + ", " + filePath));

    if (Body instanceof Readable) await writeReadableToFile(Body, filePath);
    else throw new Error("getFilePathS3StorageE4");

    return filePath;
  }

  async getStream(key: string): Promise<Readable> {
    const fileName = await this.getFilePath(key);
    const stream = fs.createReadStream(fileName);
    return stream.on("close", () => fs.promises.unlink(fileName));
  }

  async getBuffer(key: string): Promise<Buffer> {
    const fileName = await this.getFilePath(key);
    const buffer = fs.promises.readFile(fileName);
    await fs.promises.unlink(fileName);
    return buffer;
  }

  async getUrl(key: string): Promise<string> {
    const options = this.s3.config;
    const endpoint = (await options.endpoint?.()) ?? {
      hostname: `s3.${await options.region()}.amazonaws.com`,
      protocol: "https:",
      path: "/",
    };
    const bucketUrl = `${endpoint.protocol}//${endpoint.hostname}${endpoint.path}${this.bucket}`;
    return `${bucketUrl}/${key}`;
  }

  async getSignedUrl(key: string, options: GetOptions = {}): Promise<string> {
    const { expires = 3600 } = GetOptions.parse(options);
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expires });
  }

  async putSignedUrl(
    key: string,
    options: PutOptions
  ): Promise<{ url: string; headers: Record<string, string> }> {
    const {
      size,
      mime,
      expires = 3600,
      sha256,
      access = "private",
    } = PutOptions.parse(options);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentLength: size,
      ChecksumSHA256: sha256
        ? Buffer.from(sha256, "hex").toString("base64")
        : undefined,
      ChecksumAlgorithm: sha256 ? "SHA256" : undefined,
      ContentType: mime,
      ACL: access,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: expires,
      signableHeaders: new Set(["x-amz-acl", "content-type"]),
    });
    const headers = { "x-amz-acl": access, "content-type": mime };

    return { url, headers };
  }

  async delete(key: string) {
    await this.s3
      .send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      )
      .catch(catchError("deleteS3StorageE1"));
  }

  async listDir(keyPrefix: string, limit?: number) {
    const list = await this.listAll(keyPrefix, limit);
    return unique(list.map((s) => s.split("/")[0]));
  }

  async listAll(prefix: string, limit?: number) {
    const keys: string[] = [];
    for await (const key of this.listEach(prefix, limit)) {
      keys.push(key);
    }
    return keys;
  }

  async *listEach(prefix: string, limit: number = 1000) {
    let marker: string | undefined = undefined;

    while (true) {
      const listObjectsCommand: ListObjectsCommand = new ListObjectsCommand({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: limit,
        Marker: marker,
        // StartAfter: marker,
      });

      const response = await this.s3
        .send(listObjectsCommand)
        .catch(catchError("listEachS3StorageE1"));

      const contents = response.Contents ?? [];
      for (const { Key } of contents) {
        if (limit-- <= 0) return;
        yield Key?.slice(prefix.length) ?? "";
      }

      if (!response.IsTruncated) break;

      marker = response.NextMarker;
    }
  }

  async create() {
    await this.s3
      .send(
        new CreateBucketCommand({
          Bucket: this.bucket,
        })
      )
      .catch((e) => {
        if (e instanceof BucketAlreadyExists) return;
        catchError("createS3StorageE1")(e);
      });
  }

  async destroy() {
    await this.s3
      .send(new DeleteBucketCommand({ Bucket: this.bucket }))
      .catch(catchError("destroyS3StorageE1"));
  }
}

const writeReadableToFile = (
  stream: Readable,
  filePath: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    stream
      .pipe(fs.createWriteStream(filePath))
      .on("error", (err) => reject(err))
      .on("close", () => resolve(undefined));
  });
