// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

export const getArrayOfGenerator = async <T>(
  generator: AsyncGenerator<T, void, void>,
  limit: number = Infinity
) => {
  const array: T[] = [];
  for await (const value of generator) {
    if (array.length >= limit) break;
    array.push(value);
  }
  return array;
};
