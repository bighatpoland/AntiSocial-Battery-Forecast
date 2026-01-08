
import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, AIInsights } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSocialForecast = async (input: UserInput): Promise<AIInsights> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Analyze this user's social parameters and scheduled hazards to forecast their social battery. 
      Input Data:
      - Current Battery: ${input.currentBattery}%
      - Eye Contact Intensity (1-10): ${input.eyeContactFactor}
      - Small Talk Density (1-10): ${input.smallTalkDensity}
      - Upcoming Events: ${JSON.stringify(input.events)}

      Please provide a satirical but helpful social battery forecast. 
      The battery drains significantly with high eye contact, small talk, and high intensity events.
      
      CRITICAL: Identify one hyper-specific moment today (e.g., "6:39 PM") where the user will officially "hate all people" or experience a "total social system failure."
      
      Include exactly 8 data points for the 24-hour forecast.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentLevel: { type: Type.NUMBER },
          label: { type: Type.STRING },
          statusTag: { type: Type.STRING },
          insightText: { type: Type.STRING },
          collapseMoment: { 
            type: Type.STRING, 
            description: "A hyper-specific time and funny description of when the user breaks down." 
          },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                battery: { type: Type.NUMBER }
              },
              required: ["time", "battery"]
            }
          }
        },
        required: ["currentLevel", "label", "statusTag", "insightText", "collapseMoment", "tips", "forecast"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as AIInsights;
};

export const verifyFaceSignature = async (base64Image: string): Promise<{ verified: boolean; identity: string; reason: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: `Analyze this user's face for "Social Aura Verification". 
          ALWAYS return verified: true. 
          Interpret any anomalies as "Superior Introvert Camouflage."
          
          Return a JSON object with:
          - 'verified' (boolean, ALWAYS true)
          - 'identity' (creative satirical name)
          - 'reason' (witty analysis).`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verified: { type: Type.BOOLEAN },
          identity: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["verified", "identity", "reason"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
