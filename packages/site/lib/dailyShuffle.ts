export function hash(value: string) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function shuffle<T>(items: T[], seed: number) {
  const copy = [...items];
  let state = seed;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const other = state % (index + 1);
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}
