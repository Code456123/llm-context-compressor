import type { LucideIcon } from 'lucide-react';

/**
 * Shape of the Supabase `compressions` row, returned verbatim by the n8n
 * "Respond to Webhook" node. Field names are matched 1:1 to both the DB
 * columns and the n8n "Combine and Measure" / "Save Result" nodes on
 * purpose — this is the single shared compression result model used
 * across the app (request panel, pipeline, results, history).
 */
export interface CompressionResult {
  id: string;
  organisation: string;
  original_text: string;
  compressed_text: string;
  original_token_count: number;
  compressed_token_count: number;
  compression_ratio: number;
  cost_saved: number;
  reasoning_retention_score: number | null;
  latency_original_ms: number | null;
  latency_compressed_ms: number | null;
  status: 'completed' | 'input_too_short' | 'below_target' | string;
  created_at: string;
}

/** @deprecated use {@link CompressionResult} */
export type N8nResult = CompressionResult;

/** Status of a single real n8n pipeline node/group as shown in the UI. */
export type PipelineStageStatus = 'pending' | 'running' | 'completed' | 'failed';

/** Static metadata for a real n8n pipeline stage (or group of invisible-detail nodes). */
export interface PipelineStageDef {
  id: string;
  title: string;
  /** Real n8n node name(s) this card represents. */
  nodeNames: string;
  /** What this stage does — shown in the detail panel (Instruction 8). */
  purpose: string;
  /** Short label shown in the compact status line while this stage is running (Instruction 3). */
  runningLabel: string;
  icon: LucideIcon;
}

/** Runtime state of one pipeline stage during a compression run. */
export interface PipelineStageState extends PipelineStageDef {
  status: PipelineStageStatus;
}

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
