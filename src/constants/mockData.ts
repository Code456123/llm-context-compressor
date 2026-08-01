import { CompressionRun, PipelineStep, StatMetric, ExplanationCardData, LeaderboardEntry } from '../types';

export const SAMPLE_ORIGINAL_PROMPT = `[SYSTEM INSTRUCTION & CONTEXT DUMP - PROJECT NEXUS v4.2]
Date: 2026-07-28 14:02:11 UTC
Environment: Production (us-east-1)
Session ID: sess_998124091A-x9

You are an expert system debugger and staff software architect. Please review the following error trace and system logs, analyze the database connection pool state, and suggest immediate remediation steps.

==================================================
SECTION 1: SYSTEM BOOTSTRAP & REPEATED LOG DUMPS
==================================================
2026-07-28 14:00:01 INFO [AuthService] Initializing OAuth2 middleware with provider Auth0...
2026-07-28 14:00:01 INFO [AuthService] Initializing OAuth2 middleware with provider Auth0...
2026-07-28 14:00:01 INFO [AuthService] Initializing OAuth2 middleware with provider Auth0...
2026-07-28 14:00:02 INFO [DBPool] Creating connection pool min=5 max=50 idleTimeout=30000ms...
2026-07-28 14:00:02 INFO [DBPool] Creating connection pool min=5 max=50 idleTimeout=30000ms...
2026-07-28 14:00:02 INFO [DBPool] Creating connection pool min=5 max=50 idleTimeout=30000ms...
2026-07-28 14:00:03 INFO [CacheEngine] Redis client connected at redis-cluster.prod.internal:6379...
2026-07-28 14:00:03 INFO [CacheEngine] Redis client connected at redis-cluster.prod.internal:6379...

==================================================
SECTION 2: CRITICAL ERROR TRACE (PRESERVED)
==================================================
2026-07-28 14:01:45 ERROR [OrderProcessor] Uncaught Exception in worker thread #4:
DatabaseTimeoutException: Connection acquisition timed out after 5000ms. Pool size: 50/50, Active: 50, Waiting: 142.
    at Pool.acquireConnection (C:\\app\\node_modules\\db-pool\\lib\\pool.js:142:19)
    at async OrderService.checkout (C:\\app\\src\\services\\order.service.ts:88:24)
    at async RouteHandler.postCheckout (C:\\app\\src\\controllers\\checkout.ts:31:12)

==================================================
SECTION 3: REPEATED CONTEXT & BOILERPLATE DOCUMENTATION
==================================================
Note: Standard SOP guidelines require all developers to log with structured JSON headers. Standard SOP guidelines require all developers to log with structured JSON headers. Standard SOP guidelines require all developers to log with structured JSON headers.

Company Security Policy boilerplate text: All internal requests must carry a valid X-Correlation-ID header and JWT bearer token signed with RS256 algorithm. Unauthenticated requests will receive HTTP 401 Unauthorized status. Company Security Policy boilerplate text: All internal requests must carry a valid X-Correlation-ID header...

==================================================
SECTION 4: CODE SNIPPET UNDER TEST
==================================================
export async function checkout(cartId: string, userId: string): Promise<OrderResult> {
  const conn = await pool.acquireConnection(); // CRITICAL BUG: Missing try/finally release!
  const cart = await conn.query('SELECT * FROM carts WHERE id = ?', [cartId]);
  if (!cart) throw new Error('Cart not found');
  
  const paymentResult = await processPayment(cart.total, userId);
  if (paymentResult.success) {
    const order = await conn.query('INSERT INTO orders VALUES (...)', [cart.items]);
    return { status: 'success', orderId: order.id };
  }
  return { status: 'failed' };
}

Please fix the connection leak in the code above and explain why thread #4 timed out under load.`;

export const SAMPLE_COMPRESSED_PROMPT = `[SYSTEM INSTRUCTION - PROJECT NEXUS v4.2]
Task: Review error trace, analyze DB connection pool state, fix code leak, and explain thread #4 timeout.

CRITICAL ERROR TRACE:
2026-07-28 14:01:45 ERROR [OrderProcessor] Worker thread #4:
DatabaseTimeoutException: Connection acquisition timed out after 5000ms. Pool size: 50/50, Active: 50, Waiting: 142.
    at Pool.acquireConnection (C:\\app\\node_modules\\db-pool\\lib\\pool.js:142:19)
    at async OrderService.checkout (C:\\app\\src\\services\\order.service.ts:88:24)

TARGET CODE:
export async function checkout(cartId: string, userId: string): Promise<OrderResult> {
  const conn = await pool.acquireConnection();
  const cart = await conn.query('SELECT * FROM carts WHERE id = ?', [cartId]);
  if (!cart) throw new Error('Cart not found');
  
  const paymentResult = await processPayment(cart.total, userId);
  if (paymentResult.success) {
    const order = await conn.query('INSERT INTO orders VALUES (...)', [cart.items]);
    return { status: 'success', orderId: order.id };
  }
  return { status: 'failed' };
}

Fix the connection leak and explain why thread #4 timed out under load.`;

export const MOCK_STAT_METRICS: StatMetric[] = [
  {
    label: 'Tokens Saved',
    value: '42.8M',
    numericValue: 42800000,
    change: '+18.4%',
    isPositive: true,
    timeframe: 'vs last month'
  },
  {
    label: 'Avg. Reduction',
    value: '71.4%',
    numericValue: 71.4,
    change: '+3.2%',
    isPositive: true,
    timeframe: 'vs last month'
  },
  {
    label: 'API Cost Saved',
    value: '$14,290',
    numericValue: 14290,
    change: '+$2,450',
    isPositive: true,
    timeframe: 'vs last month'
  },
  {
    label: 'Reasoning Score',
    value: '98.6%',
    numericValue: 98.6,
    change: '+0.4%',
    isPositive: true,
    timeframe: 'benchmarked'
  }
];

export const MOCK_RECENT_RUNS: CompressionRun[] = [
  {
    id: 'cmp_9021',
    date: '2026-08-01 12:15',
    timestamp: Date.now() - 1000 * 60 * 20,
    promptName: 'Financial Earnings RAG Dump',
    originalTokens: 108000,
    compressedTokens: 31000,
    reductionPercentage: 71.3,
    reasoningRetention: 99.1,
    costSaved: 1.54,
    latencyMs: 380,
    status: 'completed',
    mode: 'balanced',
    model: 'gpt-4o'
  },
  {
    id: 'cmp_9020',
    date: '2026-08-01 11:42',
    timestamp: Date.now() - 1000 * 60 * 55,
    promptName: 'OrderProcessor Bug & Stack Trace',
    originalTokens: 48500,
    compressedTokens: 12200,
    reductionPercentage: 74.8,
    reasoningRetention: 98.4,
    costSaved: 0.72,
    latencyMs: 210,
    status: 'completed',
    mode: 'speed',
    model: 'claude-3-5-sonnet'
  },
  {
    id: 'cmp_9019',
    date: '2026-08-01 10:05',
    timestamp: Date.now() - 1000 * 60 * 150,
    promptName: 'Legal Contract Clause Analysis',
    originalTokens: 164000,
    compressedTokens: 42000,
    reductionPercentage: 74.3,
    reasoningRetention: 99.4,
    costSaved: 2.44,
    latencyMs: 510,
    status: 'completed',
    mode: 'accuracy',
    model: 'gemini-1.5-pro'
  },
  {
    id: 'cmp_9018',
    date: '2026-07-31 18:30',
    timestamp: Date.now() - 1000 * 60 * 1080,
    promptName: 'Healthcare Patient History Dump',
    originalTokens: 86000,
    compressedTokens: 25800,
    reductionPercentage: 70.0,
    reasoningRetention: 97.9,
    costSaved: 1.20,
    latencyMs: 340,
    status: 'completed',
    mode: 'balanced',
    model: 'gpt-4o'
  },
  {
    id: 'cmp_9017',
    date: '2026-07-31 16:12',
    timestamp: Date.now() - 1000 * 60 * 1200,
    promptName: 'Repo Context - Auth Middleware',
    originalTokens: 92000,
    compressedTokens: 24800,
    reductionPercentage: 73.0,
    reasoningRetention: 98.8,
    costSaved: 1.34,
    latencyMs: 290,
    status: 'completed',
    mode: 'speed',
    model: 'claude-3-5-sonnet'
  },
  {
    id: 'cmp_9016',
    date: '2026-07-31 14:05',
    timestamp: Date.now() - 1000 * 60 * 1320,
    promptName: 'Customer Support Transcript Batch',
    originalTokens: 64000,
    compressedTokens: 19200,
    reductionPercentage: 70.0,
    reasoningRetention: 96.5,
    costSaved: 0.89,
    latencyMs: 190,
    status: 'completed',
    mode: 'speed',
    model: 'gpt-4o-mini'
  }
];

export const INITIAL_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'step_1',
    title: 'AST & Token Chunking',
    description: 'Deconstructing text stream into AST nodes and token segments.',
    status: 'pending',
    progress: 0,
    durationMs: 400
  },
  {
    id: 'step_2',
    title: 'Semantic Deduplication',
    description: 'Detecting 18 identical log headers & boilerplate sentences.',
    status: 'pending',
    progress: 0,
    durationMs: 550
  },
  {
    id: 'step_3',
    title: 'Importance Score Ranking',
    description: 'Computing cross-attention entropy to rank critical stack traces & code.',
    status: 'pending',
    progress: 0,
    durationMs: 700
  },
  {
    id: 'step_4',
    title: 'Budget Selection Strategy',
    description: 'Fitting top-ranked nodes into 31,000 token target ceiling.',
    status: 'pending',
    progress: 0,
    durationMs: 450
  },
  {
    id: 'step_5',
    title: 'Prompt Reconstruction & Verifier',
    description: 'Rebuilding syntax tree & validating semantic coherence.',
    status: 'pending',
    progress: 0,
    durationMs: 500
  }
];

export const MOCK_EXPLANATION_CARDS: ExplanationCardData[] = [
  {
    id: 'exp_1',
    type: 'removed',
    title: 'Repeated Initialization Logs Removed',
    snippet: '2026-07-28 14:00:01 INFO [AuthService] Initializing OAuth2 middleware...',
    reason: 'Detected 18 duplicate occurrences with identical parameters. Compressed to 0 instances without loss of debugging context.',
    impactScore: 94
  },
  {
    id: 'exp_2',
    type: 'kept',
    title: 'DatabaseTimeout Exception Preserved',
    snippet: 'DatabaseTimeoutException: Connection acquisition timed out after 5000ms...',
    reason: 'Identified as the root error trigger with highest attention weight (0.982). Crucial for reasoning accuracy.',
    impactScore: 99
  },
  {
    id: 'exp_3',
    type: 'code',
    title: 'TypeScript Function Body Maintained',
    snippet: 'export async function checkout(cartId: string, userId: string): Promise<OrderResult>',
    reason: 'Contains target connection leak logic referenced directly by system instruction prompt.',
    impactScore: 98
  }
];

export const MOCK_ANALYTICS_HISTORY = [
  { day: 'Mon', original: 120, compressed: 36, costSaved: 1680 },
  { day: 'Tue', original: 180, compressed: 52, costSaved: 2560 },
  { day: 'Wed', original: 240, compressed: 68, costSaved: 3440 },
  { day: 'Thu', original: 290, compressed: 81, costSaved: 4180 },
  { day: 'Fri', original: 380, compressed: 104, costSaved: 5520 },
  { day: 'Sat', original: 310, compressed: 88, costSaved: 4440 },
  { day: 'Sun', original: 450, compressed: 122, costSaved: 6560 },
];

export const MOCK_MODEL_COMPARISON = [
  { model: 'GPT-4o', uncompressedCost: 2160, compressedCost: 620, savingsPercent: 71.3 },
  { model: 'Claude 3.5 Sonnet', uncompressedCost: 1950, compressedCost: 490, savingsPercent: 74.8 },
  { model: 'Gemini 1.5 Pro', uncompressedCost: 1400, compressedCost: 360, savingsPercent: 74.3 },
  { model: 'GPT-4o-mini', uncompressedCost: 280, compressedCost: 84, savingsPercent: 70.0 },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, promptName: 'Financial SEC 10-K RAG Context', category: 'Finance', reduction: '78.2%', speed: '180ms', accuracy: '99.6%' },
  { rank: 2, promptName: 'PostgreSQL Query Execution Dump', category: 'DevOps', reduction: '76.4%', speed: '210ms', accuracy: '98.9%' },
  { rank: 3, promptName: 'Kubernetes Cluster Event Logs', category: 'DevOps', reduction: '75.1%', speed: '195ms', accuracy: '98.2%' },
  { rank: 4, promptName: 'Healthcare Electronic Health Record', category: 'Healthcare', reduction: '73.8%', speed: '340ms', accuracy: '99.1%' },
  { rank: 5, promptName: 'Insurance Policy Terms & Annex', category: 'Legal', reduction: '71.5%', speed: '290ms', accuracy: '98.5%' },
];
