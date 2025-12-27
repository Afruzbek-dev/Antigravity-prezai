
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Presentation, InputType } from "../types";
import { DOCUMENT_SYSTEM_PROMPT, YOUTUBE_SYSTEM_PROMPT } from "../constants";

export const generatePresentation = async (
  text: string,
  targetLang: Language,
  inputType: InputType,
  useThinking: boolean = false
): Promise<Presentation> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const langLabels = {
    'UZ': 'Uzbek',
    'EN': 'English',
    'RU': 'Russian'
  };

  // Determine model: Pro for complex tasks/thinking, Flash for fast tasks
  const modelName = useThinking ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
  
  // Select system prompt based on input type
  const systemInstruction = inputType === 'youtube' ? YOUTUBE_SYSTEM_PROMPT : DOCUMENT_SYSTEM_PROMPT;

  const config: any = {
    systemInstruction,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "bullets"]
          }
        }
      },
      required: ["title", "slides"]
    }
  };

  // Set thinking budget for Pro model if enabled
  if (useThinking && modelName === "gemini-3-pro-preview") {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const userPrompt = inputType === 'youtube' 
    ? `Process this YouTube transcript and create a presentation in ${langLabels[targetLang]}. Clean the content first: \n\n ${text}`
    : `Generate a professional presentation from the following document in ${langLabels[targetLang]}: \n\n ${text}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: userPrompt,
    config: config
  });

  try {
    const data = JSON.parse(response.text || '{}') as Presentation;
    return data;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("The AI response was not in the expected format. Please try again.");
  }
};
