export function trimObjectStrings<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => trimObjectStrings(v)) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    const trimmed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      trimmed[key] =
        typeof value === 'string'
          ? value.trim()
          : Array.isArray(value)
            ? value.map((v) =>
                typeof v === 'string' ? v.trim() : trimObjectStrings(v),
              )
            : value;
    }
    return trimmed;
  }
  return obj;
}
