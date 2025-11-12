export type DowntimeLogs = [Date, Date][];

export function merge(...args: DowntimeLogs[]): DowntimeLogs {
  const flattened = args.flat();

  if (flattened.length === 0) {
    return [];
  }

  const sorted = flattened
    .slice()
    .sort((a, b) => a[0].getTime() - b[0].getTime() || a[1].getTime() - b[1].getTime());

  const merged: DowntimeLogs = [];

  for (const [start, end] of sorted) {
    if (merged.length === 0) {
      merged.push([start, end]);
      continue;
    }

    const last = merged[merged.length - 1];

    if (start.getTime() > last[1].getTime()) {
      merged.push([start, end]);
      continue;
    }

    if (end.getTime() > last[1].getTime()) {
      last[1] = end;
    }
  }

  return merged;
}