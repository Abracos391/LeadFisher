import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MarketingPlan } from "../types";

const marketingPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    segment: { type: Type.STRING, description: "The user provided segment name" },
    platformStrategy: { type: Type.STRING, description: "Highly specific strategy based on the user's USP" },
    competitorAnalysis: {
      type: Type.OBJECT,
      properties: {
        searchKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific long-tail keywords" },
        bigCompetitors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Real competitors or big players in this specific sub-niche" },
        visualStyle: { type: Type.STRING, description: "Detailed visual direction (colors, mood, pacing)" },
        commentTriggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific questions customers ask in this niche" }
      },
      required: ["searchKeywords", "bigCompetitors", "visualStyle", "commentTriggers"]
    },
    audienceStrategy: {
      type: Type.OBJECT,
      properties: {
        interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific interests, not generic ones" },
        behaviors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Digital behaviors" },
        lookalikeSource: { type: Type.STRING, description: "Best source for LAL based on the business model" },
        excludedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Negative targeting to save money" }
      },
      required: ["interests", "behaviors", "lookalikeSource", "excludedKeywords"]
    },
    leadMagnet: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Catchy, high-value title" },
        format: { type: Type.STRING, description: "Format (e.g., Calculator, Template, Mini-course)" },
        description: { type: Type.STRING, description: "What makes this specific magnet irresistible" },
        whyItWorks: { type: Type.STRING, description: "Psychological trigger analysis" },
        creationTools: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific tools" }
      },
      required: ["title", "format", "description", "whyItWorks", "creationTools"]
    },
    creativePrompts: {
      type: Type.OBJECT,
      properties: {
        videoPrompt: { type: Type.STRING, description: "A complex, scene-by-scene AI video prompt. NO GENERIC SCENES." },
        imagePrompt: { type: Type.STRING, description: "High-detail photography prompt" },
        thumbnailText: { type: Type.STRING, description: "Clickbait-style text overlay" }
      },
      required: ["videoPrompt", "imagePrompt", "thumbnailText"]
    },
    adCopy: {
      type: Type.OBJECT,
      properties: {
        variations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING, description: "Hook-driven headline" },
              body: { type: Type.STRING, description: "Copywriting using PAS or AIDA frameworks" }
            },
            required: ["headline", "body"]
          },
        },
        cta: { type: Type.STRING, description: "Action-oriented CTA" }
      },
      required: ["variations", "cta"]
    },
    agentFlow: {
      type: Type.OBJECT,
      properties: {
        platform: { type: Type.STRING, description: "Platform" },
        trigger: { type: Type.STRING, description: "Trigger" },
        qualificationQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hard qualification questions to filter leads" },
        rejectionMessage: { type: Type.STRING, description: "Polite rejection" },
        successMessage: { type: Type.STRING, description: "Success" }
      },
      required: ["platform", "trigger", "qualificationQuestions", "rejectionMessage", "successMessage"]
    },
    implementationGuide: {
      type: Type.OBJECT,
      properties: {
        platformWalkthrough: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Technical steps" },
        budgetSetup: { type: Type.STRING, description: "Specific budget strategy" },
        bestPractices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Money-saving tips" }
      },
      required: ["platformWalkthrough", "budgetSetup", "bestPractices"]
    }
  },
  required: ["segment", "platformStrategy", "competitorAnalysis", "audienceStrategy", "leadMagnet", "creativePrompts", "adCopy", "agentFlow", "implementationGuide"]
};

export const generateMarketingPlan = async (
  segment: string, 
  language: string, 
  region: string, 
  radius: string,
  platform: string,
  budget: string,
  objective: string,
  usp: string, // Unique Selling Proposition
  painPoints: string // Specific Customer Pain
): Promise<MarketingPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      ROLE: Elite Direct Response Marketing Strategist (Dan Kennedy style).
      
      TASK: Diagnose the business needs and generate a BESPOKE, HIGH-CONVERSION marketing plan.
      
      STRICT WARNING: 
      - Do NOT output generic advice like "create high quality content".
      - Do NOT use generic video prompts like "a happy person smiling". 
      - The Video Prompt MUST be a specific, visual representation of the 'USP' or the 'Pain Point'. 
      - If the user provides a specific differentiator, the ENTIRE strategy must pivot around it.
      
      INPUT DATA (DIAGNOSIS):
      - Niche/Business: "${segment}"
      - The "Killer" Feature (USP): "${usp}"
      - Customer's Deepest Pain: "${painPoints}"
      - Platform: "${platform}"
      - Location: "${region}" (${radius})
      - Budget: "${budget}"
      - Objective: "${objective}"
      - Language: "${language}"

      GUIDELINES:
      1. **Lead Magnet**: Must solve the specific "${painPoints}" immediately.
      2. **Video Prompt**: Must describe a "Pattern Interrupt" scene. Example: Instead of "dentist smiling", describe "Close up macro shot of a decayed tooth cracking, then reversing to white". It must be visceral.
      3. **Ad Copy**: Address the pain point in the first sentence. Use the USP as the solution mechanism.
      4. **Audience**: Dig deeper than broad interests. Find intersection interests.
      
      OUTPUT REQUIREMENTS:
      Return ONLY valid JSON matching the schema.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: marketingPlanSchema,
        temperature: 0.9 // Higher temperature for more creative/less robotic answers
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as MarketingPlan;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
