export type CompressionMode = 'speed' | 'balanced' | 'accuracy';

export interface CompressionOptions {
  semanticDeduplication: boolean;
  preserveCode: boolean;
  keepErrorLogs: boolean;
  keepNamedEntities: boolean;
  priorityKeywords: string;
}

export interface CompressionRun {
  id: string;
  date: string;
  timestamp: number;
  promptName: string;
  originalTokens: number;
  compressedTokens: number;
  reductionPercentage: number;
  reasoningRetention: number; // e.g. 98.4
  costSaved: number; // in USD
  latencyMs: number;
  status: 'completed' | 'processing' | 'failed';
  mode: CompressionMode;
  model: string;
  originalText?: string;
  compressedText?: string;
}

export type PipelineStepStatus = 'pending' | 'running' | 'completed' | 'error';

export interface PipelineStep {
  id: string;
  title: string;
  description: string;
  status: PipelineStepStatus;
  progress: number; // 0 to 100
  durationMs: number;
}

export interface StatMetric {
  label: string;
  value: string;
  numericValue: number;
  change: string;
  isPositive: boolean;
  timeframe: string;
}

export interface ExplanationCardData {
  id: string;
  type: 'removed' | 'kept' | 'code';
  title: string;
  snippet: string;
  reason: string;
  impactScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  promptName: string;
  category: string;
  reduction: string;
  speed: string;
  accuracy: string;
}
