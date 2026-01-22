import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlayerInput {
  name: string;
  rawDetails: string;
}

interface FormattedPlayer {
  name: string;
  details: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { players, mode, apiKey } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Grok API key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!players || players.length === 0) {
      return new Response(
        JSON.stringify({ error: "No players to format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const modeInstructions = {
      PG: "Keep it family-friendly and playful. No profanity or adult themes.",
      ADULT: "Can include mild adult humor and light roasts. Keep it fun but not too edgy.",
      UNHINGED: "Go wild with savage roasts, dark humor, and brutal honesty. Be chaotic but not hateful."
    };

    const prompt = `You are formatting player bios for a Mafia party game. Convert these raw notes into punchy, formatted bios.

RULES:
1. Output format for each player: (trait1, trait2, trait3, quirk, etc.)
2. Keep the essence of what was written but make it punchy and usable for comedy narration
3. Extract 3-5 key traits or characteristics from the raw input
4. Match this narrator mode: ${mode} - ${modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.ADULT}
5. Return ONLY valid JSON array, no markdown or explanation

PLAYERS TO FORMAT:
${(players as PlayerInput[]).map((p: PlayerInput) => `- ${p.name}: "${p.rawDetails}"`).join('\n')}

RESPOND WITH ONLY A JSON ARRAY:
[{"name": "PlayerName", "details": "(formatted traits here)"}]`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-latest",
        messages: [
          {
            role: "system",
            content: "You are a bio formatter for a Mafia party game. Output ONLY valid JSON, no markdown code blocks."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Grok API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from Grok API" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response, handling potential markdown code blocks
    let formattedPlayers: FormattedPlayer[];
    try {
      // Remove potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      formattedPlayers = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse Grok response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ players: formattedPlayers }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("format-player-bios error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});