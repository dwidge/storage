// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

const lex = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

const generator = (radix: number) => () =>
  lex[Math.floor(Math.random() * radix)];

const makeId = (length = 8, radix = 62) =>
  Array.from({ length }, generator(radix)).join("");

export default makeId;
