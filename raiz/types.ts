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
  creationTools: string[]; // New: Tools to make it (e.g. Canva)
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
  variations: AdCopyVariation[];
  cta: string;
}

export interface AgentFlow {
  platform: string;
  trigger: string;
  qualificationQuestions: string[];
  rejectionMessage: string;
  successMessage: string;
}

export interface ImplementationGuide {
  platformWalkthrough: string[]; // Step-by-step generic clicks
  budgetSetup: string; // How to configure the budget specifically
  bestPractices: string[]; // Rookie mistakes to avoid
}

export interface MarketingPlan {
  segment: string;
  platformStrategy: string;
  competitorAnalysis: CompetitorAnalysis;
  audienceStrategy: AudienceStrategy;
  leadMagnet: LeadMagnet;
  creativePrompts: CreativePrompts;
  adCopy: AdCopy;
  agentFlow: AgentFlow;
  implementationGuide: ImplementationGuide; // New section
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
