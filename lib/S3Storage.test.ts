// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { test } from "@jest/globals";
import {
  testDeleteObjectS3Storage,
  testListObjectsS3Storage,
  testPutGetFilePathS3Storage,
  testPutGetStreamS3Storage,
  testPutGetBufferS3Storage,
  testPutGetUrlS3Storage,
} from "./S3Storage.tests.js";

test("testPutGetFilePathS3Storage", testPutGetFilePathS3Storage, 15000);
test("testPutGetStreamS3Storage", testPutGetStreamS3Storage);
test("testPutGetBufferS3Storage", testPutGetBufferS3Storage);
test("testPutGetUrlS3Storage", testPutGetUrlS3Storage);
test("testListObjectsS3Storage", testListObjectsS3Storage);
test("testDeleteObjectS3Storage", testDeleteObjectS3Storage);
