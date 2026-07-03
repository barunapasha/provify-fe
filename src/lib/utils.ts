import { LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Convert lamports to SOL with specified decimal places.
 */
export function lamportsToSol(lamports: number, decimals = 4): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(decimals);
}

/**
 * Truncate a Solana public key for display.
 * e.g. "7px9...e7W"
 */
export function truncateAddress(
  address: string,
  start = 4,
  end = 4
): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format a date from Unix timestamp (seconds).
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
