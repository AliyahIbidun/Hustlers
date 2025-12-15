import { GoogleGenAI, Type } from "@google/genai";
import { GameScene, GameHistoryItem, PlayerStats } from "../types";

const SYSTEM_INSTRUCTION = `
You are the Game Engine for "Hustleters", a fast-paced survival visual novel set in Lagos, Nigeria.

CRITICAL RULES FOR SPEED & QUALITY:
1. **SPELLING**: ALWAYS spell "Lagos" correctly. Never "Lgos". Proofread all text.
2. **BREVITY**: Dialogue must be SHORT and PUNCHY (Max 25 words). This makes the game faster and more intense.
3. **STYLE**: Use Nigerian Pidgin/Slang naturally but keep it readable.
4. **INTERACTIVITY**: Every choice must matter. Use Health and Energy to punish/reward players.

STATS LOGIC (BitLife Style):
- **Cash**: Money (Naira).
- **Cred**: Respect on the street.
- **Heat**: Police attention. > 90 is arrest.
- **Health**: Physical condition. 0 is Death.
- **Energy**: Stamina. 0 is Exhaustion/Passing out.

SCENARIO GENERATION:
- Create immediate, high-stakes situations.
- Offer 2-3 distinct choices with clear risks.
- If Energy is low, offer choices to rest or eat.
- If Health is low, describe the pain.
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Shared schema definition to reduce duplication
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    backgroundMood: { type: Type.STRING, enum: ['chaotic', 'calm', 'danger', 'party', 'tech'] },
    speaker: { type: Type.STRING },
    dialogue: { type: Type.STRING, description: "Max 25 words. Punchy." },
    screenShake: { type: Type.BOOLEAN },
    isGameOver: { type: Type.BOOLEAN },
    soundEffect: { type: Type.STRING, enum: ['siren', 'traffic', 'afrobeats', 'silence'] },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "Action text" },
          effect: { type: Type.STRING, description: "Narrative outcome summary" },
          statsChange: {
             type: Type.OBJECT,
             properties: {
                cash: { type: Type.INTEGER },
                streetCred: { type: Type.INTEGER },
                heat: { type: Type.INTEGER },
                health: { type: Type.INTEGER },
                energy: { type: Type.INTEGER }
             }
          }
        },
        required: ['id', 'text', 'effect']
      }
    }
  },
  required: ['id', 'backgroundMood', 'speaker', 'dialogue', 'choices']
};

export const generateInitialScene = async (): Promise<GameScene> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Start game. Intro: Femi is in a Danfo bus in Lagos. The bus is moving too fast. Driver is shouting. Short text. Correct spelling of Lagos.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as GameScene;

  } catch (error) {
    console.error("Error generating initial scene:", error);
    return {
      id: "error",
      backgroundMood: "danger",
      speaker: "System",
      dialogue: "Network error. Refresh to start again.",
      choices: [],
      screenShake: false
    };
  }
};

export const generateNextScene = async (
  history: GameHistoryItem[],
  lastChoiceEffect: string,
  currentStats: PlayerStats
): Promise<GameScene> => {
  try {
    // Only keep very recent history for speed
    const recentHistory = history.slice(-3); 
    const historyContext = recentHistory.map(item => 
        `${item.speaker}: "${item.dialogue}"`
    ).join('\n');

    const prompt = `
    PREVIOUSLY: ${historyContext}
    ACTION: Player chose: "${lastChoiceEffect}"
    STATS: Health:${currentStats.health}, Energy:${currentStats.energy}, Cash:${currentStats.cash}, Heat:${currentStats.heat}.

    GOAL: Continue story. React to Action. Keep it SHORT (max 2 sentences).
    - If Health < 20, warn player.
    - If Energy < 10, force rest choices.
    - Spell "Lagos" correctly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as GameScene;

  } catch (error) {
     console.error("Error generating next scene:", error);
     return {
      id: "error_continue",
      backgroundMood: "chaotic",
      speaker: "System",
      dialogue: "Wahala dey. I cannot load the next scene. Try refreshing.",
      choices: [],
      screenShake: false
    };
  }
};