import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MarketingPlan } from "../types";

const marketingPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    segment: { type: Type.STRING, description: "The user provided segment name" },
    platformStrategy: { type: Type.STRING, description: "Specific advice on how to succeed on the chosen platform (e.g. TikTok vs LinkedIn)" },
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
        videoPrompt: { type: Type.STRING, description: "SCROLL-STOPPING AI Video prompt optimized for the chosen platform format (e.g. vertical for TikTok). Use Pattern Interrupts." },
        imagePrompt: { type: Type.STRING, description: "High-contrast, odd, or hyper-aesthetic AI Image prompt that acts as a click-magnet." },
        thumbnailText: { type: Type.STRING, description: "Short, punchy text overlay." }
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
              headline: { type: Type.STRING, description: "Hook headline" },
              body: { type: Type.STRING, description: "Ad body text" }
            },
            required: ["headline", "body"]
          },
          description: "3 distinct variations for A/B testing"
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
    }
  },
  required: ["segment", "platformStrategy", "competitorAnalysis", "audienceStrategy", "leadMagnet", "creativePrompts", "adCopy", "agentFlow"]
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
      ROLE: World-Class Direct Response Copywriter & Viral Content Strategist.
      
      TASK: Create a HIGH-CONVERSION "Lead Fisher" strategy.
      
      INPUTS:
      - Niche/Segment: "${segment}"
      - Target Platform: "${platform}" (CRITICAL: Adapt tone/format for this)
      - Location: "${region}" (${radius})
      - Language: "${language}"
      - Budget Level: "${budget}"
      - Main Objective: "${objective}"

      GUIDELINES FOR PLATFORM ADAPTATION:
      - If TikTok/Kwai/Reels: Content must be fast, raw, UGC-style, entertainment-first. Text should be short caption style.
      - If LinkedIn: Professional, value-driven, longer form.
      - If Facebook/Instagram Feed: Visual hook + Storytelling copy (PAS framework).
      - If YouTube: Story-based, education-focused.

      GUIDELINES FOR "CREATIVE PROMPTS":
      - **NO GENERIC LIFESTYLE SCENES**: Do NOT describe "happy families on the couch".
      - **USE "PATTERN INTERRUPTS"**: The video prompt must describe a scene that breaks the user's scroll pattern.
      - **VISUAL HOOK**: The first 3 seconds must visually represent the PAIN or the SHOCKing result.

      GUIDELINES FOR "AD COPY":
      - Generate **3 DISTINCT VARIATIONS** of Headline and Body for A/B testing.
      - Variation 1: Direct/Benefit focused.
      - Variation 2: Story/Emotional focused.
      - Variation 3: Controversial/Curiosity focused.

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
