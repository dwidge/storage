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
  ListObjectsV2Command,
  BucketAlreadyExists,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";
import { getBufferOfStream } from "./utils/getBufferOfStream.js";

export class S3Storage implements Storage {
  private s3;
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
    { access = "private" } = {}
  ) {
    await this.putStream(key, fs.createReadStream(filePath), { access });
  }

  async putStream(key: string, stream: Readable, { access = "private" } = {}) {
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

  async putBuffer(key: string, buffer: Buffer, { access = "private" } = {}) {
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
      .catch(catchError("getFilePathS3StorageE3"));

    if (Body instanceof Readable) await writeReadableToFile(Body, filePath);
    else throw new Error("getFilePathS3StorageE4");

    return filePath;
  }

  async getStream(key: string): Promise<Readable> {
    const fileName = await this.getFilePath(key);
    return fs.createReadStream(fileName);
  }

  async getBuffer(key: string): Promise<Buffer> {
    const fileName = await this.getFilePath(key);
    return fs.promises.readFile(fileName);
  }

  async getUrl(key: string, _expires: number = Infinity): Promise<string> {
    const options = this.s3.config;
    const endpoint = (await options.endpoint?.()) ?? {
      hostname: `s3.${await options.region()}.amazonaws.com`,
      protocol: "https:",
      path: "/",
    };
    const bucketUrl = `${endpoint.protocol}//${endpoint.hostname}${endpoint.path}${this.bucket}`;
    return `${bucketUrl}/${key}`;
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

  async listAll(keyPrefix: string, limit?: number) {
    const Prefix = keyPrefix.endsWith("/") ? keyPrefix : keyPrefix + "/";
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix,
      MaxKeys: limit,
    });

    const response = await this.s3
      .send(listObjectsCommand)
      .catch(catchError("listObjectsS3StorageE1"));
    return (
      response.Contents?.map(({ Key }) => Key?.slice(Prefix.length) ?? "") ?? []
    );
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
