export const fromQueryString = (
  q: Record<string, string | string[] | undefined>,
) =>
  Object.fromEntries(
    Object.entries(q).map(([k, v]) => [
      k,
      v === "" ? undefined : v === "%00" ? null : v,
    ]),
  );
