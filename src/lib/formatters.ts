/**
 * Format number with space for thousands and comma for decimals
 * Example: 2181500 → "2 181,5"
 */
export function formatNumber(num: number, decimals: number = 1): string {
  const rounded = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
  const parts = rounded.toString().split('.')

  // Add space as thousand separator
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  // Join with comma as decimal separator (if decimals exist)
  return parts.length > 1 ? parts.join(',') : parts[0]
}

/**
 * Format currency in millions
 * Example: 2181500000 → "2 181,5 mln"
 */
export function formatMln(value: number): string {
  return `${formatNumber(value / 1_000_000)} mln`
}

/**
 * Parse number input (handles spaces and commas)
 */
export function parseFormattedNumber(str: string): number {
  return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0
}
