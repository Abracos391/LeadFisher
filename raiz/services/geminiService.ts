import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MarketingPlan } from "../types";

const marketingPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    segment: { type: Type.STRING, description: "The user provided segment name" },
    competitorAnalysis: {
      type: Type.OBJECT,
      properties: {
        searchKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 keywords to search in Meta Ads Library" },
        bigCompetitors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names of 3-5 potential big competitors (generic descriptions if specific brands are risky)" },
        visualStyle: { type: Type.STRING, description: "Description of common visual patterns" },
        commentTriggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Phrases in comments indicating intent" }
      },
      required: ["searchKeywords", "bigCompetitors", "visualStyle", "commentTriggers"]
    },
    audienceStrategy: {
      type: Type.OBJECT,
      properties: {
        interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Targeting interests (Broad/Contextual)" },
        behaviors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Targeting behaviors" },
        lookalikeSource: { type: Type.STRING, description: "Source for Lookalike audience" },
        excludedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords to exclude" }
      },
      required: ["interests", "behaviors", "lookalikeSource", "excludedKeywords"]
    },
    leadMagnet: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Name of the free resource/bait. Must be IRRESISTIBLE." },
        format: { type: Type.STRING, description: "Format (e.g., PDF, Video Class, Template, Coupon)" },
        description: { type: Type.STRING, description: "What is inside the magnet" },
        whyItWorks: { type: Type.STRING, description: "Psychological reason why the user will give their contact info for this" }
      },
      required: ["title", "format", "description", "whyItWorks"]
    },
    creativePrompts: {
      type: Type.OBJECT,
      properties: {
        videoPrompt: { type: Type.STRING, description: "SCROLL-STOPPING AI Video prompt. Must be a 'Pattern Interrupt' or Visual Metaphor. NO GENERIC SCENES." },
        imagePrompt: { type: Type.STRING, description: "High-contrast, odd, or hyper-aesthetic AI Image prompt that acts as a click-magnet." },
        thumbnailText: { type: Type.STRING, description: "Short, punchy text overlay (Clickbait style but honest)." }
      },
      required: ["videoPrompt", "imagePrompt", "thumbnailText"]
    },
    adCopy: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING, description: "Ad headline (High Conversion Hook)" },
        body: { type: Type.STRING, description: "Ad primary text using PAS (Problem-Agitation-Solution) framework." },
        cta: { type: Type.STRING, description: "Call to Action" }
      },
      required: ["headline", "body", "cta"]
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
    }
  },
  required: ["segment", "competitorAnalysis", "audienceStrategy", "leadMagnet", "creativePrompts", "adCopy", "agentFlow"]
};

// Now accepts apiKey explicitly
export const generateMarketingPlan = async (segment: string, language: string, region: string, radius: string, apiKey: string): Promise<MarketingPlan> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid Gemini API Key.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      ROLE: World-Class Direct Response Copywriter & Viral Content Strategist.
      (Think Ogilvy meets TikTok Trends).
      
      TASK: Create a HIGH-CONVERSION "Lead Fisher" strategy to capture leads for the niche: "${segment}".
      
      CONTEXT: The user wants to run ads on Meta/TikTok. 
      The content must NOT be "lukewarm". It must be disruptive.
      
      CRITICAL CONFIGURATION:
      1. LANGUAGE: Output in "${language}".
      2. LOCATION: "${region}".
      3. RADIUS: "${radius}".

      GUIDELINES FOR "CREATIVE PROMPTS" (CRITICAL):
      - **NO GENERIC LIFESTYLE SCENES**: Do NOT describe "happy families on the couch", "businessmen shaking hands", or "people looking at phones". This is boring and ignored.
      - **USE "PATTERN INTERRUPTS"**: The video prompt must describe a scene that breaks the user's scroll pattern.
        - Examples: A strange visual metaphor, something falling/breaking, a zoomed-in macro shot, high contrast colors, visual ASMR, or a "Reverse" video.
      - **VISUAL HOOK**: The first 3 seconds must visually represent the PAIN or the SHOCKing result.
      - **STYLE**: Cinematic, Hyper-realistic, or 3D Render.

      GUIDELINES FOR "LEAD MAGNET" (THE BAIT):
      - Must be a "No-Brainer" offer. Something so good it feels stupid to say no.
      - Avoid generic "Newsletters". Use: "Cheatsheets", "Calculators", "Swipe Files", "Private Video Training".

      GUIDELINES FOR "AD COPY":
      - Use the "Hook -> Story -> Offer" framework.
      - First sentence must be a punch in the gut (emotional or curiosity).

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
