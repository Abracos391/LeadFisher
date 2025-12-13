export interface CompetitorAnalysis {
  searchKeywords: string[];
  bigCompetitors: string[];
  visualStyle: string;
  commentTriggers: string[];
}

export interface AudienceStrategy {
  interests: string[];
  behaviors: string[];
  lookalikeSource: string;
  excludedKeywords: string[];
}

export interface LeadMagnet {
  title: string;
  format: string;
  description: string;
  whyItWorks: string;
}

export interface CreativePrompts {
  videoPrompt: string;
  imagePrompt: string;
  thumbnailText: string;
}

export interface AdCopyVariation {
  headline: string;
  body: string;
}

export interface AdCopy {
  variations: AdCopyVariation[]; // Now supports A/B testing
  cta: string;
}

export interface AgentFlow {
  platform: string;
  trigger: string;
  qualificationQuestions: string[];
  rejectionMessage: string;
  successMessage: string;
}

export interface MarketingPlan {
  segment: string;
  platformStrategy: string; // Specific advice for the chosen platform
  competitorAnalysis: CompetitorAnalysis;
  audienceStrategy: AudienceStrategy;
  leadMagnet: LeadMagnet;
  creativePrompts: CreativePrompts;
  adCopy: AdCopy;
  agentFlow: AgentFlow;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
