import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MarketingPlan } from "../types";

const marketingPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    segment: { type: Type.STRING, description: "The user provided segment name" },
    platformStrategy: { type: Type.STRING, description: "Specific advice on how to succeed on the chosen platform" },
    competitorAnalysis: {
      type: Type.OBJECT,
      properties: {
        searchKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 keywords to search in Meta Ads Library" },
        bigCompetitors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names of 3-5 potential big competitors" },
        visualStyle: { type: Type.STRING, description: "Description of common visual patterns" },
        commentTriggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Phrases in comments indicating intent" }
      },
      required: ["searchKeywords", "bigCompetitors", "visualStyle", "commentTriggers"]
    },
    audienceStrategy: {
      type: Type.OBJECT,
      properties: {
        interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Targeting interests" },
        behaviors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Targeting behaviors" },
        lookalikeSource: { type: Type.STRING, description: "Source for Lookalike audience" },
        excludedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords to exclude" }
      },
      required: ["interests", "behaviors", "lookalikeSource", "excludedKeywords"]
    },
    leadMagnet: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Name of the free resource" },
        format: { type: Type.STRING, description: "Format (e.g., PDF, Video Class)" },
        description: { type: Type.STRING, description: "Content description" },
        whyItWorks: { type: Type.STRING, description: "Psychological reason" },
        creationTools: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 specific free/cheap tools to CREATE this magnet (e.g. Canva, CapCut, Google Docs)" }
      },
      required: ["title", "format", "description", "whyItWorks", "creationTools"]
    },
    creativePrompts: {
      type: Type.OBJECT,
      properties: {
        videoPrompt: { type: Type.STRING, description: "AI Video prompt" },
        imagePrompt: { type: Type.STRING, description: "AI Image prompt" },
        thumbnailText: { type: Type.STRING, description: "Overlay text" }
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
              headline: { type: Type.STRING, description: "Headline" },
              body: { type: Type.STRING, description: "Body text" }
            },
            required: ["headline", "body"]
          },
        },
        cta: { type: Type.STRING, description: "Call to Action" }
      },
      required: ["variations", "cta"]
    },
    agentFlow: {
      type: Type.OBJECT,
      properties: {
        platform: { type: Type.STRING, description: "Recommended platform" },
        trigger: { type: Type.STRING, description: "Trigger action" },
        qualificationQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Qualification questions" },
        rejectionMessage: { type: Type.STRING, description: "Rejection message" },
        successMessage: { type: Type.STRING, description: "Success message" }
      },
      required: ["platform", "trigger", "qualificationQuestions", "rejectionMessage", "successMessage"]
    },
    implementationGuide: {
      type: Type.OBJECT,
      properties: {
        platformWalkthrough: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-7 very specific steps to set up the campaign on the chosen platform (e.g., 'Click Create', 'Select Sales Objective')." },
        budgetSetup: { type: Type.STRING, description: "Specific instruction on how to set the budget (e.g., 'Set CBO off, use Daily Budget at Ad Set level')." },
        bestPractices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 tips to avoid losing money (e.g., 'Turn off Audience Network')." }
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
  objective: string
): Promise<MarketingPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      ROLE: Expert Digital Marketing Implementation Coach.
      
      TASK: Create a marketing strategy AND a step-by-step technical execution guide for a BEGINNER.
      
      INPUTS:
      - Niche: "${segment}"
      - Platform: "${platform}"
      - Location: "${region}" (${radius})
      - Budget: "${budget}"
      - Objective: "${objective}"
      - Language: "${language}"

      CRITICAL INSTRUCTION FOR "IMPLEMENTATION GUIDE":
      - The user is a LAYPERSON. Do not just say "Target audience". Say "Go to Audience section, select Location, type [Interest]".
      - Explain exactly how to configure the budget based on the input "${budget}".
      - Recommend specific TOOLS to create the Lead Magnet (e.g. Canva for PDFs, Loom for video).
      
      CRITICAL:
      - Ensure the output language matches the input language: "${language}".

      OUTPUT REQUIREMENTS:
      Return ONLY valid JSON matching the schema.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: marketingPlanSchema,
        temperature: 0.85 
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
