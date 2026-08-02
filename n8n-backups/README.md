# n8n workflow backups

Local, git-tracked snapshots of the "Context Compression Engine" n8n workflow, taken before major changes — independent of n8n's own version history (which also exists and is the faster way to roll back; see below).

## Current baseline: `context-compression-engine.190ad275.json`

n8n `versionId`: `190ad275-5691-4122-b3c0-63eb9e40e36c`
Taken: 2026-08-02, after the newline-split fix for code content.

Validated results at this version (real, non-synthetic test inputs):
| Test | Input | Ratio | Retention |
|---|---|---|---|
| Real codebase (3 actual project source files) | 47,162 chars, code-heavy | 68.82% (NVIDIA 429'd mid-run on the judge call) | null |
| Real blog article (Newton's Laws, genuine prose) | 9,106 chars | **72.77%** | **60** |

`LATEST_KNOWN_GOOD.json` is a copy of this same file, kept at a stable filename so it's always easy to find without knowing the version hash.

## How to roll back

**Fastest — n8n's own version history** (no file needed): in the n8n editor, open the workflow → version history → find the version named in that version's `update_workflow` call → restore. Every change this session was pushed via `update_workflow` with a `versionName`/`versionDescription`, so history reads as a changelog.

**From this file** (if n8n's history is somehow lost, or to diff exactly what changed): the file is the full `nodes` + `connections` + `settings` payload returned by `get_workflow_details`. Re-apply via `update_workflow` operations, or paste into the n8n editor's workflow JSON import if doing it manually.

## Convention going forward

Before any batch of changes flagged as "major" (architecture changes, not incremental tuning), snapshot the current state here first with the version hash and validated metrics at that point, same as above.
