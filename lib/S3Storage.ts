// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Storage } from "./Storage";
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

import { catchError } from "./utils/catchError";
import fs from "fs";
import path from "path";
import { S3StorageEnv } from "./S3Storage.env";
import { unique } from "./utils/unique";

export default class S3Storage implements Storage {
  private s3;
  private bucket: string;
  private tmpPath: string;

  constructor({
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint,
    tmpPath = "tmp",
  }: S3StorageEnv) {
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

  async putFilePath(key: string, filePath: string) {
    await this.putStream(key, fs.createReadStream(filePath));
  }

  async putStream(key: string, stream: Readable) {
    await this.s3
      .send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: stream,
        })
      )
      .catch(catchError("putStreamS3StorageE1"));
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
