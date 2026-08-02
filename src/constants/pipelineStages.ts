import {
  Webhook,
  Scissors,
  Eraser,
  SlidersHorizontal,
  Bot,
  Calculator,
  Wand2,
  ShieldCheck,
  Gauge,
  Database,
  Send,
} from 'lucide-react';
import { PipelineStageDef } from '../types';

/**
 * The real n8n "Context Compression Engine" workflow, in execution order.
 * Every stage here corresponds to an actual node (or a small group of
 * invisible-implementation-detail nodes) in the live workflow — verified
 * against the production n8n workflow and the Supabase `compressions`
 * table schema. Do not add, remove, or reorder stages without checking
 * the workflow again; this is the single source of truth for both the
 * landing page pipeline visual and the live dashboard run.
 */
export const PIPELINE_STAGES: PipelineStageDef[] = [
  {
    id: 'webhook',
    title: 'Webhook Received',
    nodeNames: 'Webhook',
    purpose: 'Receives the compression request and starts the pipeline.',
    runningLabel: 'Calling n8n Webhook',
    icon: Webhook,
  },
  {
    id: 'chunk',
    title: 'Chunk Text',
    nodeNames: 'Chunk Text',
    purpose: 'Splits payload into optimized, sentence-safe chunks.',
    runningLabel: 'Chunking',
    icon: Scissors,
  },
  {
    id: 'strip',
    title: 'Strip Boilerplate',
    nodeNames: 'Strip Boilerplate',
    purpose: 'Removes repetitive filler and near-duplicate sentences.',
    runningLabel: 'Removing Boilerplate',
    icon: Eraser,
  },
  {
    id: 'algo',
    title: 'Algorithmic Compression',
    nodeNames: 'Algorithmic Compress',
    purpose: 'Ranks semantic importance and selects the densest content within budget.',
    runningLabel: 'Running Algorithmic Compression',
    icon: SlidersHorizontal,
  },
  {
    id: 'llm',
    title: 'LLM Refinement',
    nodeNames: 'Summarize Chunks (NVIDIA Llama) + Recover Original Text',
    purpose: 'Compresses further via NVIDIA Llama 3.1, keeping only output that is actually shorter.',
    runningLabel: 'LLM Refinement',
    icon: Bot,
  },
  {
    id: 'measure',
    title: 'Combine & Measure',
    nodeNames: 'Start Timer + Combine and Measure',
    purpose: 'Computes token counts, compression ratio, cost, and latency.',
    runningLabel: 'Measuring Compression',
    icon: Calculator,
  },
  {
    id: 'critique',
    title: 'Critique & Repair',
    nodeNames: 'Critique And Repair',
    purpose: 'Restores missing critical facts, numbers, and names.',
    runningLabel: 'Repair Validation',
    icon: Wand2,
  },
  {
    id: 'guard',
    title: 'Repair Guard',
    nodeNames: 'Apply Repair Guard',
    purpose: 'Ensures repairs stay within budget compliance before accepting them.',
    runningLabel: 'Repair Validation',
    icon: ShieldCheck,
  },
  {
    id: 'retention',
    title: 'Reasoning Retention Evaluation',
    nodeNames: 'Evaluate Retention + Parse Retention Score',
    purpose: 'Measures how much reasoning-relevant information was retained.',
    runningLabel: 'Evaluating Reasoning Retention',
    icon: Gauge,
  },
  {
    id: 'save',
    title: 'Save to Supabase',
    nodeNames: 'Save Result',
    purpose: 'Persists the final metrics to the compressions table.',
    runningLabel: 'Saving Results',
    icon: Database,
  },
  {
    id: 'respond',
    title: 'Return Response',
    nodeNames: 'Respond to Webhook',
    purpose: 'Returns the compressed payload back to the frontend.',
    runningLabel: 'Compression Complete',
    icon: Send,
  },
];
