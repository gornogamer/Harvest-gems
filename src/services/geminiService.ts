import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getFarmingTips = async (cropName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 quick, interesting real-world farming tips or facts about ${cropName}. Keep them concise for a game UI.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching farming tips:", error);
    return "Could not fetch tips at this time. Keep farming!";
  }
};

export const chatWithAssistant = async (message: string, history: { role: string; parts: { text: string }[] }[]) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: "You are 'Barnaby', a friendly AI farming assistant in the game 'Gem Harvest'. You help players with farming strategies, explain game mechanics, and provide encouragement. Keep your tone rustic, helpful, and cheerful. The game involves planting crops, harvesting them for coins, and buying gems to win.",
      },
    });

    // Note: sendMessage only accepts the message string in this SDK version
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error in AI chat:", error);
    return "Sorry, I'm a bit stumped right now. Maybe try again in a bit?";
  }
};
