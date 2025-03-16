export const toStringValues = (
  r: Record<string, string | number | boolean | null | undefined>,
) =>
  Object.fromEntries(
    Object.entries(r).map(([k, v]) => [k, v?.toString() ?? ""]),
  );
