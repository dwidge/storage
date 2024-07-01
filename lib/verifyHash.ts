import crypto from "crypto";

export const generateHash = (
  hashSecret: string,
  value: Record<string, string | number | boolean>
): string =>
  crypto
    .createHmac("sha256", hashSecret)
    .update(JSON.stringify(sortKeys(value)))
    .digest("hex");

export const verifyHash = (
  hashSecret: string,
  value: Record<string, string | number | boolean>,
  hash: string
): boolean => generateHash(hashSecret, value) === hash;

const sortKeys = (value: Record<string, string | number | boolean>) =>
  Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = value[key];
      return result;
    }, {} as Record<string, string | number | boolean>);
