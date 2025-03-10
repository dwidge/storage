// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

export const catchError = (code: string) => (cause: unknown) => {
  throw new Error(code + ": " + `${cause}`, { cause });
};
