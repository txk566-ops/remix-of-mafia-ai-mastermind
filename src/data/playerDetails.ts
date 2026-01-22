// ============================================
// PLAYER DETAILS REGISTRY
// Add your friends here for personalized AI narration!
// Grok will use these bios for roasts, callbacks, and inside jokes
// ============================================

export const PLAYER_DETAILS: Record<string, string> = {
  // FORMAT: "PlayerName": "(player details)"
  // The name matching is case-insensitive

  // ========== ADD YOUR PLAYERS BELOW ==========

  Alex: "(whorish slut who loves black cock, has a massive crush from Chase, nice feet that she loves showing off, obsessed with stuffed sloths especially her stuffed sloth Jimmy that has a rapehole she fucks, tiny body, chronic yeast infection, once shoved a jalapeño up her pussy for fun, dumb blonde stereotype, incredibly racist especially scared of black people despite craving BBC, Italian)",
  Tommy:
    "(nerdy autistic fat Jewish Israeli Zionist, basically gay for Chase, does literally anything he's told, once got blackout drunk fell on his face and got a nasty black eye, has a crazy overbearing mom who babies him)",
  Chase:
    "(retarded emotional simp who’s obsessed with Alex, craves intimacy so bad he cries when he kisses someone for the first time in ages, fat with a comically large big toe, surprisingly strong, loves his mom way too much, has a stuffed animal named Otto he’s attached to, also Jewish, double retarded energy)",
  Christine:
    "(autistic ex-heroin addict who OD’d once, still loves stuffed Stitch from Lilo & Stitch, total virgin, super Catholic guilt, Italian)",
  Soph: "(dating Francesco, kinda oblivious, gives off dumb blonde vibes even though she’s brunette, obsessed with stuffed flamingos, Italian)",
  Francesco: "(dating Soph, short temper with anger issues, Italian from Jersey, gets pissed easily)",
  Black Alex: "(black guy in ROTC, total manwhore who fucks anything that moves)",
Kiki: "(Mexican Italian bastard, Catholic as fuck, moocher, can’t help but eat everything in sight)",
    Travis: "(gay, can’t find the directions to the gym, all talk no fight, once flew to Africa for dick)",
    Kate: "(can’t help but fuck with a frat man, drunker than your average alcoholic, no dancing just be moving, Indian)",
    Bri: "(raging liberal, was caught with a freshman in her bedroom she’s 22, seen the inside of jail cell one too many times, loves crack)"
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
