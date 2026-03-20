export function shuffleArray<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

export function pickRandomUnique<T extends { id: number }>(
  source: T[],
  count: number,
  used: Set<number>,
): (T | null)[] {
  const available = source.filter((q) => !used.has(q.id));
  if (available.length === 0) return Array(count).fill(null);

  const arr = [...available];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const picked = arr.slice(0, count) as (T | null)[];
  while (picked.length < count) picked.push(null);
  return picked;
}

export function normalizeOptions(options: any): string[] {
  if (Array.isArray(options)) return options.map(String);
  return String(options || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function normalizeLv(v: any): "low" | "mid" | "high" | null {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();

  if (s === "low" || s === "mid" || s === "high") return s;
  return null;
}
