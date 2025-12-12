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
        title: { type: Type.STRING, description: "Name of the free resource/bait to capture emails/phones" },
        format: { type: Type.STRING, description: "Format (e.g., PDF, Video Class, Template, Coupon)" },
        description: { type: Type.STRING, description: "What is inside the magnet" },
        whyItWorks: { type: Type.STRING, description: "Psychological reason why the user will give their contact info for this" }
      },
      required: ["title", "format", "description", "whyItWorks"]
    },
    creativePrompts: {
      type: Type.OBJECT,
      properties: {
        videoPrompt: { type: Type.STRING, description: "Safe, high-quality prompt for AI Video generators (Veo, Sora, Runway)." },
        imagePrompt: { type: Type.STRING, description: "Safe, high-quality prompt for AI Image generators (Midjourney, Dall-E)." },
        thumbnailText: { type: Type.STRING, description: "Short, punchy text overlay for the video/image thumbnail (Compliant text)." }
      },
      required: ["videoPrompt", "imagePrompt", "thumbnailText"]
    },
    adCopy: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING, description: "Ad headline (Compliant)" },
        body: { type: Type.STRING, description: "Ad primary text (Compliant, no exaggerated claims)" },
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
      ROLE: Advanced Marketing Strategist & Ad Compliance Expert.
      
      TASK: Create a "Lead Fisher" strategy (capture Emails/WhatsApp) for the niche: "${segment}".
      
      CRITICAL CONFIGURATION:
      1. LANGUAGE: All content MUST be in "${language}". This is mandatory. Translate any English terms to "${language}" unless they are industry standard terms (like "Lead Magnet").
      2. LOCATION: Target "${region}".
      3. RADIUS/SCOPE: Strategy must be optimized for a scope of "${radius}". 
         (If radius is small/local, focus on local intent, "near me" keywords, and hyper-local creative details).
      
      SAFETY & CONTENT POLICIES (Meta/Google/TikTok):
      - NO EXAGGERATED PROMISES: Avoid "100% guaranteed", "Miracle cure", "Easy money". Use neutral, verifiable language.
      - NO DIRECT ADVICE: Avoid medical, legal, or financial advice. Use educational tone.
      - NO SENSITIVE THEMES: Avoid politics, violence, adult content, or discrimination.
      
      OUTPUT REQUIREMENTS:
      1. Competitor Analysis: Keywords to search in Ads Lib (in ${language}).
      2. Lead Magnet: A specific, high-value "Bait" (PDF, Class, Template) relevant to ${region}.
      3. Creative Prompts: 
         - Detailed prompts for AI Video/Image generation.
         - Thumbnail text that is catchy but compliant (in ${language}).
      4. Ad Copy: Persuasive text (in ${language}).
      5. Automation: Questions to qualify the lead (in ${language}).

      Return ONLY valid JSON matching the schema.
      ENSURE ALL TEXT FIELDS ARE IN ${language}.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: marketingPlanSchema,
        temperature: 0.7
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
