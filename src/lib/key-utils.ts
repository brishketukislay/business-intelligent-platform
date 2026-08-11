const MAX_KEY_LENGTH = 100;

export function slugifyKey(value: string): string {
  const key = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .toLowerCase()
    .slice(0, MAX_KEY_LENGTH)
    .replace(/_+$/g, "");

  return key || "item";
}

export function generateUniqueKey(
  name: string,
  existingKeys: Iterable<string>
): string {
  const used = new Set(
    Array.from(existingKeys).map((key) =>
      key.trim().toLowerCase()
    )
  );

  const base = slugifyKey(name);

  if (!used.has(base)) {
    return base;
  }

  let counter = 2;

  while (used.has(`${base}_${counter}`)) {
    counter++;
  }

  return `${base}_${counter}`;
}