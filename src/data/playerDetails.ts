// ============================================
// PLAYER DETAILS REGISTRY
// Add custom bios for personalized AI narration!
// The narrator will use these bios for roasts, callbacks, and inside jokes
// ============================================

export const PLAYER_DETAILS: Record<string, string> = {
  // Registry is empty by default for mass-market release
  // Users can add custom bios during game setup using the "Add Bio" button
};

/**
 * Get player details by name (case-insensitive matching)
 * Returns empty string if no details found
 */
export function getPlayerDetails(name: string): string {
  const normalizedName = name.toLowerCase().trim();

  for (const [playerName, details] of Object.entries(PLAYER_DETAILS)) {
    if (playerName.toLowerCase() === normalizedName) {
      return details;
    }
  }

  return "";
}

/**
 * Check if a player has custom details registered
 */
export function hasPlayerDetails(name: string): boolean {
  return getPlayerDetails(name) !== "" && getPlayerDetails(name) !== "(player details)";
}
