// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import z from "zod";

export const EnumString = (value: readonly [string, ...string[]]) =>
  z.pipeline(z.string(), z.enum(value));
