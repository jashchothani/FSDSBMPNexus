export function levelFromXp(xp: number): number {
  if (!xp || xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForSolve(difficulty: string): number {
  const d = String(difficulty).toUpperCase();
  if (d === 'EASY') return 50;
  if (d === 'MEDIUM') return 100;
  if (d === 'HARD') return 200;
  return 50;
}
