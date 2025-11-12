export type Value = string | number | boolean | null | undefined |
  Date | Buffer | Map<unknown, unknown> | Set<unknown> |
  Array<Value> | { [key: string]: Value };

/**
 * Transforms JavaScript scalars and objects into JSON
 * compatible objects.
 */
export function serialize(value: Value): unknown {
  if (value === null) {
    return null;
  }

  const typeOfValue = typeof value;

  if (
    typeOfValue === 'string' ||
    typeOfValue === 'number' ||
    typeOfValue === 'boolean' ||
    typeOfValue === 'undefined'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return { __t: 'Date', __v: value.getTime() };
  }

  if (Buffer.isBuffer(value)) {
    return { __t: 'Buffer', __v: Array.from(value.values()) };
  }

  if (value instanceof Set) {
    return {
      __t: 'Set',
      __v: Array.from(value.values()).map((item) => serialize(item as Value)),
    };
  }

  if (value instanceof Map) {
    return {
      __t: 'Map',
      __v: Array.from(value.entries()).map(([key, val]) => [
        serialize(key as Value),
        serialize(val as Value),
      ]),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => serialize(item as Value));
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value)) {
      result[key] = serialize(val as Value);
    }

    return result;
  }

  return undefined;
}

/**
 * Transforms JSON compatible scalars and objects into JavaScript
 * scalar and objects.
 */
export function deserialize<T = unknown>(value: unknown): T {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined'
  ) {
    return value as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deserialize(item)) as T;
  }

  if (isPlainObject(value)) {
    const record = value as Record<string, unknown>;

    if (typeof record.__t === 'string') {
      const tag = record.__t;
      const payload = record.__v;

      switch (tag) {
        case 'Date':
          return new Date(payload as number) as T;
        case 'Buffer':
          return Buffer.from((payload as number[]) ?? []) as T;
        case 'Set': {
          const items = Array.isArray(payload) ? payload : [];
          return new Set(items.map((item) => deserialize(item))) as T;
        }
        case 'Map': {
          const entries = Array.isArray(payload) ? payload : [];
          return new Map(
            entries.map((entry) => {
              const [key, val] = Array.isArray(entry) ? entry : [undefined, undefined];
              return [deserialize(key), deserialize(val)];
            })
          ) as T;
        }
        default:
          break;
      }
    }

    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(record)) {
      result[key] = deserialize(val);
    }

    return result as T;
  }

  return undefined as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.constructor === Object || Object.getPrototypeOf(value) === null)
  );
}
