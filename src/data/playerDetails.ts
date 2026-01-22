// ============================================
// PLAYER DETAILS REGISTRY
// Add your friends here for personalized AI narration!
// Grok will use these bios for roasts, callbacks, and inside jokes
// ============================================

export const PLAYER_DETAILS: Record<string, string> = {
  // FORMAT: "PlayerName": "(player details)"
  // The name matching is case-insensitive
  
  // ========== ADD YOUR PLAYERS BELOW ==========
  
  "Mike": "(player details)",
  "Sarah": "(player details)",
  "Dave": "(player details)",
  "Alex": "(player details)",
  "Chris": "(player details)",
  "Emma": "(player details)",
  "Jake": "(player details)",
  "Lily": "(player details)",
  "Tom": "(player details)",
  "Anna": "(player details)",
  
  // ========== ADD MORE PLAYERS AS NEEDED ==========
  // Example filled in:
  // "John": "(always late, terrible liar, obsessed with pizza, blames everyone else)",
  // "Kate": "(thinks she's a detective genius, suspicious of everyone, owns 5 cats)",
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
