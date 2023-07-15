// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

export const getBucketKeyOfPath = (key: string) => {
  const [root, ...subs] = key.split("/");
  return {
    Bucket: root,
    Key: subs.join("/"),
  };
};
