/**
 * Format large numbers into readable short form
 * Examples:
 * 999 → 999
 * 1000 → 1K
 * 1500 → 1.5K
 * 10000 → 10K
 * 1000000 → 1M
 * 1234567 → 1.2M
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  
  const absNum = Math.abs(num);
  
  // Less than 1000: show exact number
  if (absNum < 1000) {
    return num.toString();
  }
  
  // 1K to 999K
  if (absNum < 1000000) {
    const thousands = num / 1000;
    // Show decimal for numbers under 10K (e.g., 1.5K)
    if (absNum < 10000) {
      return thousands.toFixed(1) + 'K';
    }
    // No decimal for 10K+ (e.g., 15K, 999K)
    return Math.floor(thousands) + 'K';
  }
  
  // 1M to 999M
  if (absNum < 1000000000) {
    const millions = num / 1000000;
    // Show one decimal place (e.g., 1.2M)
    return millions.toFixed(1) + 'M';
  }
  
  // 1B+
  const billions = num / 1000000000;
  return billions.toFixed(1) + 'B';
}

/**
 * Format numbers with commas for exact display
 * Examples:
 * 1000 → 1,000
 * 1234567 → 1,234,567
 */
export function formatNumberWithCommas(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}
