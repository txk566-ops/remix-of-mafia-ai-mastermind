// ============================================
// PLAYER DETAILS REGISTRY
// Add your friends here for personalized AI narration!
// Grok will use these bios for roasts, callbacks, and inside jokes
// ============================================

export const PLAYER_DETAILS: Record<string, string> = {
  // FORMAT: "PlayerName": "(player details)"
  // The name matching is case-insensitive

  // ========== ADD YOUR PLAYERS BELOW ==========

  Alex: "(whorish slut, loves black cock, has a massive crush from Chase,show off feet, obsessed with stuffed sloths especially her stuffed sloth Jimmy that has a rapehole she fucks, tiny body, yeast infection, once shoved a jalapeño up her pussy, incredibly racist especially scared of black people despite craving BBC, Italian, rumored to have fucked James Mccarthy and Pierce )",
  Tommy:
    "(nerdy autistic fat Jewish Israeli Zionist, basically gay for Chase, does literally anything he's told, once got blackout drunk fell on his face and got a nasty black eye, has a crazy overbearing mom who babies him, loves pina coladas)",
  Chase:
    "(retarded emotional simp, crush on Alex, craves intimacy so bad he cries when he kisses someone for the first time in ages, fat with a comically large big toe, surprisingly strong, loves his mom way too much, has a stuffed animal named Otto he’s attached to, also Jewish, obsessed with Alex's feet double retarded energy)",
  Christine:
    "(autistic ex-heroin addict who OD’d once, still loves stuffed Stitch from Lilo & Stitch, virgin, super Catholic, Italian)",
  Soph: "(dating Francesco, kinda oblivious, gives off dumb blonde vibes even though she’s brunette, obsessed with stuffed flamingo Riri, Italian)",
  Francesco: "(dating Soph, short temper with anger issues, Italian from Jersey, gets pissed easily)",
  "Black Alex": "(black guy in ROTC, total manwhore, rumored to have fucked black alex)",

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
