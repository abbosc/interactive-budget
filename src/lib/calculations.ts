/**
 * Calculate percentage change
 */
export function calcPercent(original: number, changed: number): number {
  if (original === 0) return changed > 0 ? 100 : 0
  return ((changed - original) / original) * 100
}

/**
 * Calculate total from changes object
 */
export function calculateTotal(
  baseValue: number,
  changes: Record<string, number>
): number {
  const totalChange = Object.values(changes).reduce((sum, val) => sum + val, 0)
  return baseValue + totalChange
}

/**
 * Get slider range (±10% of default value)
 */
export function getSliderRange(defaultValue: number): [number, number] {
  return [defaultValue * 0.9, defaultValue * 1.1]
}
