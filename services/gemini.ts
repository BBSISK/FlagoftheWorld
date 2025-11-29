import { GoogleGenAI, Type } from "@google/genai";
import { FlagQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash for logic and text generation
const TEXT_MODEL = "gemini-2.5-flash";
// Using gemini-2.5-flash-image for image generation
const IMAGE_MODEL = "gemini-2.5-flash-image";

const REGIONS = [
  "Africa",
  "Asia (excluding Middle East)",
  "Europe (Western)",
  "Europe (Eastern)",
  "North America / Caribbean",
  "South America",
  "Oceania / Pacific Islands",
  "Middle East"
];

export const LOADING_FACTS = [
  "The flag of Nepal is the only national flag that isn't a rectangle.",
  "There are only two national flags with the color purple: Dominica and Nicaragua.",
  "The Olympic flag's colors were chosen because every national flag contains at least one of them.",
  "Switzerland and the Vatican City are the only two square national flags.",
  "The sun on the flag of Argentina has a face.",
  "The stars on the US flag represent the 50 states.",
  "South Africa's flag was designed to symbolize unity and progress.",
  "The flag of Japan is called the 'Nisshōki', meaning 'sun-mark flag'.",
  "The Maple Leaf on Canada's flag has 11 points.",
  "Bhutan's flag features a thunder dragon named Druk.",
  "The flag of Mozambique is the only one to feature a modern assault rifle.",
  "The Philippines flag is flown with the red stripe up during times of war.",
  "Denmark has the oldest continuously used national flag in the world.",
  "Libya's flag was once just a plain green field, the only single-color flag in history."
];

export const generateFlagData = async (): Promise<FlagQuestion> => {
  // Select a random region to force variety
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

  const prompt = `
    Generate a geography quiz question suitable for a 14-year-old.
    
    Target Region: ${region}.
    
    Task:
    1. Pick a random sovereign country from the target region.
    2. Provide the correct country name.
    3. Provide the capital city of that country.
    4. Provide 3 plausible distractors (neighboring countries or countries with similar flags).
    5. Provide a short interesting fact about the country or its flag.
    6. Provide a detailed visual description of the flag for generation purposes.
  `;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          correctName: { type: Type.STRING },
          capital: { type: Type.STRING },
          distractors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          funFact: { type: Type.STRING },
          visualDescription: { type: Type.STRING },
        },
        required: ["correctName", "capital", "distractors", "funFact", "visualDescription"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate flag data");
  }

  return JSON.parse(response.text) as FlagQuestion;
};

export const generateFlagImage = async (countryName: string, description: string): Promise<string> => {
  // We use the image model to generate a visual representation
  const prompt = `A high-quality, flat, digital graphic of the official national flag of ${countryName}. ${description}. The flag should fill the frame completely. No flagpole, no waving effects, just the flat design. Accurate colors.`;

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  // Extract image from response
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated.");
};