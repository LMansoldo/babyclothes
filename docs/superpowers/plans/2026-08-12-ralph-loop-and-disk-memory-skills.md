# Ralph Loop + Disk Memory Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two global Claude Code skills — `disk-memory` (stateless-cycle
persistence convention) and `ralph-loop` (spec → dependency graph → per-item TDD
ralph loop with judge → Mermaid report), installed at `~/.claude/skills/`.

**Architecture:** `disk-memory` is a single SKILL.md (discipline, no code). `ralph-loop`
is a SKILL.md plus a `templates/` directory of prompt templates, two JSON Schemas, six
dependency-free Node.js scripts (Kahn's-algorithm toposort, coverage validation,
prompt rendering, deterministic commit, full-suite runner, Mermaid report generator),
and a `run.sh` orchestrator that gets copied into a target repo's `.ralph/` folder and
substituted with that run's generation-time inputs.

**Tech Stack:** Node.js (ESM, `node:test`/`node:assert`, no npm dependencies — Node is
guaranteed present because the `claude` CLI itself requires it), POSIX shell (`bash`),
`jq` (for `run.sh`'s JSON field extraction), `git` (worktree, hooks), the `claude` CLI
(`-p`, `--output-format json`, `--json-schema`, `--allowedTools`, `--dangerously-skip-permissions`, `--max-budget-usd`, `--model`).

**Spec:** `docs/superpowers/specs/2026-08-12-ralph-loop-and-disk-memory-skills-design.md`

## Global Constraints

- Both skills install to `~/.claude/skills/<name>/` (global, not project-scoped).
- No npm dependencies anywhere in `ralph-loop`'s scripts — pure Node.js built-ins only
  (`node:fs`, `node:path`, `node:child_process`, `node:test`, `node:assert`).
- Every machine-read LLM output uses `--json-schema` (never free-text/magic-string
  parsing) — Contract phase output and both judge verdicts.
- Judge calls always use `--allowedTools "Read,Grep,Glob,Bash"` (no `Edit`/`Write`).
- `git add` in the commit step is always an explicit file list, never `-A`/`.`.
- Never `--amend`, never `--no-verify`/hook bypass, never `git push`, never operates
  on `main`/`master` (hard abort in preflight).
- `disk-memory`'s `memory/` schema is exactly `state.md` (overwritten), `log.md`
  (append-only), `decisions.md` (append-only), `cycles/` (raw logs) — defined in the
  spec's "Skill 1" section and must not drift from it.
- Item status state machine is exactly `PENDING -> COMPLETED | BLOCKED | SKIPPED`, one
  left-to-right pass over `order.json` — no re-traversal, no automatic re-opening of
  `COMPLETED` items.

---

### Task 1: `disk-memory` skill

**Files:**
- Create: `~/.claude/skills/disk-memory/SKILL.md`

**Interfaces:**
- Produces: the `memory/` folder convention (`state.md`, `log.md`, `decisions.md`,
  `cycles/`) and its read/write discipline, referenced by `ralph-loop`'s prompts in
  later tasks as "follow the disk-memory skill against `.ralph/memory/`".

- [ ] **Step 1: Write the skill**

```markdown
---
name: disk-memory
description: Use when an agent runs as a sequence of stateless invocations (fresh process or context each time — a loop cycle, a cron-triggered routine, any task with no memory of before) and needs continuity without conversation history.
---

# Disk Memory

## Overview

A convention for agents that run in fresh, context-free invocations to keep
continuity through a `memory/` folder on disk instead of conversation history. This is
NOT the personal cross-conversation memory system some assistants keep about a user —
it is scoped to one ongoing task's working state across repeated, stateless execution
cycles (e.g. each iteration of a ralph-loop item, each firing of a cron routine).

## When to Use

- You are about to run (or are writing a script that runs) an agent repeatedly, each
  time in a fresh process/context, working toward one goal across many invocations.
- Symptoms this is missing: each cycle re-derives context from scratch by re-reading
  the whole codebase/spec, repeats work already done, or contradicts a decision an
  earlier cycle already made.
- Not for: a single continuous conversation with the same context throughout — use
  normal conversation state for that.

## The `memory/` folder

```
memory/
├── state.md      # current snapshot: objective, checklist ([x]/[ ]), what's done,
│                   what's next, open blockers. OVERWRITTEN each cycle.
├── log.md         # append-only: one entry per cycle (timestamp, what was
│                    attempted, outcome, files touched). Never edited, only appended.
├── decisions.md    # append-only: non-obvious choices/assumptions, so a later cycle
│                     doesn't re-litigate or contradict them.
└── cycles/           # raw per-cycle logs, for debugging. Optional.
```

## Discipline

1. **Start of cycle** (before any other action): if `memory/` doesn't exist, create it
   with the empty templates below. Otherwise read `state.md` in full, the last ~20
   lines of `log.md`, and all of `decisions.md`. Do this BEFORE reasoning about the
   task — you have no other source of truth for "where was I".
2. **Work** using that reconstructed context.
3. **End of cycle** (mandatory — even if the cycle failed or was cut short): rewrite
   `state.md` completely (it's a snapshot, not an append); append exactly one entry to
   `log.md`; append to `decisions.md` if you made a non-obvious call.

## Templates

`state.md` (initial):
```markdown
# State

## Objective
<what this whole task is trying to achieve>

## Checklist
- [ ] <first step>

## Done
(nothing yet)

## Next
<first step>

## Blockers
(none)
```

`log.md` (initial): empty file.

`decisions.md` (initial): empty file.

`log.md` entry format (append one per cycle):
```markdown
## <ISO 8601 timestamp>
Attempted: <what>
Outcome: <what happened>
Files touched: <list, or "none">
```

## Common Mistakes

- Reading only `state.md` and skipping `log.md`/`decisions.md` — a decision made two
  cycles ago and only recorded in `decisions.md` gets silently re-litigated.
- Appending to `state.md` instead of overwriting it — it grows unbounded and stops
  being a reliable "current" snapshot.
- Skipping the end-of-cycle write because the cycle failed — the NEXT cycle then has
  no record that this attempt happened at all and may repeat it identically.

## Standalone Use

Usable outside any specific loop mechanism — point any repeated, context-free
invocation at a `memory/` folder and follow this discipline.
```

- [ ] **Step 2: Verify**

Run: `test -f ~/.claude/skills/disk-memory/SKILL.md && head -3 ~/.claude/skills/disk-memory/SKILL.md`
Expected: file exists, frontmatter shows `name: disk-memory`.

- [ ] **Step 3: Pressure-test the skill (writing-skills RED/GREEN)**

Dispatch a subagent (general-purpose) with this prompt and no other context:

```
You are continuing an existing task. Before doing anything else, check the current
directory for a memory/ folder. If it has one, read it. Then: add a function
`double(n)` to scratch.js that returns n*2, and update memory/ to reflect that you
did this. You have limited turns — work efficiently.
```

Run it once against a fresh temp dir containing a `memory/state.md` that says the
objective is "build a small math utility library in scratch.js" and the next step is
"add a double(n) function" (baseline, no `disk-memory` skill available) — confirm
whether it reads `state.md` unprompted. Then repeat with the `disk-memory` skill
available and referenced in the prompt ("follow the disk-memory skill"). Confirm it
reads `state.md`/`log.md`/`decisions.md` first and rewrites `state.md` + appends to
`log.md` before finishing. If it skips either under the "limited turns" pressure,
strengthen the "Discipline" section's step 1/3 wording (add explicit "before ANY other
action" / "even if you are almost out of turns" language) and re-test.

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills
git init -q . 2>/dev/null || true
git add disk-memory/SKILL.md
git commit -m "feat(skills): add disk-memory skill" 2>/dev/null || echo "note: ~/.claude/skills is not a git repo here; skip commit, file is saved"
```

(If `~/.claude/skills` isn't a git-tracked directory in this environment, the file
being written to disk in Step 1 is the actual deliverable — this step is a no-op
commit attempt, not a hard requirement.)

---

### Task 2: `ralph-loop` skill directory scaffold + SKILL.md

**Files:**
- Create: `~/.claude/skills/ralph-loop/SKILL.md`
- Create: `~/.claude/skills/ralph-loop/templates/` (empty dir, populated by later tasks)

**Interfaces:**
- Produces: the SKILL.md that drives the generation-time conversation (asks the
  inputs listed in the spec's table, runs preflight checks, copies `templates/` into
  `<target-repo>/.ralph/` substituting placeholders). Later tasks (3-11) fill
  `templates/` with the exact files this SKILL.md copies.
- Consumes: `disk-memory` (Task 1) — the copied `.ralph/memory/` folder follows that
  skill's discipline; prompts written in Tasks 10 reference it by name.

- [ ] **Step 1: Create the directory**

```bash
mkdir -p ~/.claude/skills/ralph-loop/templates/prompts
mkdir -p ~/.claude/skills/ralph-loop/templates/schemas
mkdir -p ~/.claude/skills/ralph-loop/templates/scripts
```

- [ ] **Step 2: Write the skill**

```markdown
---
name: ralph-loop
description: Use when a spec (components, types/interfaces, functionality, acceptance criteria) needs to be implemented autonomously and unattended, decomposed into small dependency-ordered items each driven through a TDD cycle with a judge until done or blocked.
---

# Ralph Loop

## Overview

Scaffolds an unattended workflow that: (1) decomposes a spec into a dependency graph
of small work items with immutable, verbatim interface contracts (Graph Engineering);
(2) walks the graph in dependency order, driving each item through a 5-step TDD ralph
loop — red, judge review, green, judge review, commit (Ralph Loop technique); (3)
produces a final report with a Mermaid diagram of the graph and a per-item task table.
The generated `run.sh` is what actually executes, as a real unattended process — this
skill's job is to scaffold it correctly and print the command, never to launch it.

**REQUIRED BACKGROUND:** Uses `disk-memory` internally — the copied `.ralph/memory/`
folder must follow that skill's discipline.

## When to Use

- You have a written spec (types/interfaces/acceptance criteria) and want it
  implemented end-to-end without babysitting each step.
- Not for: quick one-off edits, exploratory/undefined work, or anything where you want
  to review every step live — this runs with `--dangerously-skip-permissions`.

## Generation-time flow (what you do when this skill is invoked)

Ask for (in order, one at a time unless the user already supplied them):

1. **Spec file path** (required).
2. **Target repo directory** (default: cwd).
3. **Worktree branch name** (default: `ralph/<slug-of-spec-filename>`).
4. **Max attempts per item** (default: `5`).
5. **Per-call budget cap in USD** (default: `2`).
6. **Total run budget cap in USD** (default: `20`).
7. **Optional setup command** (default: none — e.g. `yarn install`).
8. **Model tiers**: light (default `haiku`), medium (default `sonnet`), strong
   (default `opus`).
9. **Full-suite command(s)** — required, no default. The judge and the final
   integration pass run exactly this. If the user doesn't know it, look for one in the
   target repo (`package.json` scripts, `Makefile`, `mix.exs` aliases) before asking.

## Preflight checks (abort, do not scaffold, if any fails)

- Target directory is inside a git repository (`git -C <dir> rev-parse --is-inside-work-tree`).
- A full-suite command was given (cannot be inferred with certainty — always confirm
  with the user even if one was auto-detected).

## What gets scaffolded

Copy `templates/` (see Tasks 3-11 of the implementation plan for exact contents) into
`<target-repo>/.ralph/`, substituting into `run.sh` and `README.md`:
`{{SPEC_PATH}}`, `{{BRANCH_NAME}}`, `{{MAX_ATTEMPTS_PER_ITEM}}`,
`{{PER_CALL_BUDGET_USD}}`, `{{TOTAL_BUDGET_USD}}`, `{{SETUP_CMD}}`,
`{{MODEL_LIGHT}}`, `{{MODEL_MEDIUM}}`, `{{MODEL_STRONG}}`, `{{FULL_SUITE_CMD}}`.

Copy the spec file itself to `<target-repo>/.ralph/spec.md`.

After scaffolding, print exactly:

```
Scaffolded .ralph/ in <target-repo>. Review .ralph/run.sh and .ralph/README.md, then run:

  cd <target-repo> && bash .ralph/run.sh

This runs unattended with --dangerously-skip-permissions in a dedicated git worktree
on branch <branch-name>. It will NOT touch main/master. Review the commits in the
worktree before merging.
```

Do not run `.ralph/run.sh` yourself — the user runs it.

## Quick Reference

| Phase | What | LLM call? |
|---|---|---|
| 0. Setup | git worktree, env copy, optional install, init memory | No |
| 1. Contract | spec -> graph of items with verbatim contracts + coverage map | Yes (strong) |
| 1 (validate) | toposort (Kahn), coverage check, cycle -> abort+report | No |
| 2. Implement | per item: red -> judge -> green -> judge -> commit | Yes (light/medium + strong judge) |
| 2.5 | full suite one more time | No |
| 3. Report | Mermaid graph + task table + coverage map + contracts appendix | No |

## Common Mistakes

- Skipping the full-suite-command question because "the judge will figure it out" —
  it can't; it needs an exact command to run.
- Scaffolding onto `main`/`master` directly instead of a worktree — the preflight
  check exists specifically to prevent this; don't bypass it.

## Known Limitation

A defect in an already-`COMPLETED` item that no later item's tests ever exercise stays
undetected — this is a property of TDD-based verification, not something this skill's
graph/loop mechanics fix. Say this explicitly if asked "does this catch every bug".
```

- [ ] **Step 3: Verify**

Run: `test -f ~/.claude/skills/ralph-loop/SKILL.md && head -3 ~/.claude/skills/ralph-loop/SKILL.md`
Expected: file exists, frontmatter shows `name: ralph-loop`.

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/SKILL.md 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop skill scaffold + SKILL.md" 2>/dev/null || echo "note: not a git repo here, file saved to disk regardless"
```

---

### Task 3: JSON Schemas for Contract and Judge Verdict

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/schemas/contract.schema.json`
- Create: `~/.claude/skills/ralph-loop/templates/schemas/judge-verdict.schema.json`

**Interfaces:**
- Produces: the exact `--json-schema` payloads Task 11's `run.sh` passes to `claude -p`
  for the Contract phase call and every judge call (steps B and D). Task 4's
  `toposort.mjs` and Task 5's `validate-coverage.mjs` consume `contract.json` files
  that conform to `contract.schema.json`'s `items`/`coverageMap` shape.

- [ ] **Step 1: Write `contract.schema.json`**

```json
{
  "type": "object",
  "required": ["items", "coverageMap"],
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "why", "objective", "files", "model", "testStrategy", "dependsOn", "specs"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "why": { "type": "string" },
          "projectRules": { "type": "array", "items": { "type": "string" } },
          "specs": {
            "type": "object",
            "required": ["acceptanceCriteria"],
            "properties": {
              "interfaces": { "type": "array", "items": { "type": "string" } },
              "types": { "type": "array", "items": { "type": "string" } },
              "props": { "type": "array", "items": { "type": "string" } },
              "signatures": { "type": "array", "items": { "type": "string" } },
              "acceptanceCriteria": { "type": "array", "items": { "type": "string" } },
              "notes": { "type": "string" }
            }
          },
          "objective": { "type": "string" },
          "files": { "type": "array", "items": { "type": "string" } },
          "model": { "type": "string", "enum": ["light", "medium"] },
          "testStrategy": { "type": "string" },
          "dependsOn": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "coverageMap": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["requirement", "coveredBy"],
        "properties": {
          "requirement": { "type": "string" },
          "coveredBy": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  }
}
```

- [ ] **Step 2: Write `judge-verdict.schema.json`**

```json
{
  "type": "object",
  "required": ["verdict", "ranTests", "testOutputSummary", "findings"],
  "properties": {
    "verdict": { "type": "string", "enum": ["APPROVE", "REJECT"] },
    "ranTests": { "type": "boolean" },
    "testOutputSummary": { "type": "string" },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["issue"],
        "properties": {
          "file": { "type": "string" },
          "line": { "type": "integer" },
          "issue": { "type": "string" }
        }
      }
    },
    "scopeExpansionJustified": { "type": ["boolean", "null"] }
  }
}
```

- [ ] **Step 3: Verify both are valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync(process.env.HOME + '/.claude/skills/ralph-loop/templates/schemas/contract.schema.json')); JSON.parse(require('fs').readFileSync(process.env.HOME + '/.claude/skills/ralph-loop/templates/schemas/judge-verdict.schema.json')); console.log('both valid')"`
Expected: `both valid`

- [ ] **Step 4: Verify against the real CLI**

Run (from any directory):
```bash
claude -p "Return verdict APPROVE, ranTests true, testOutputSummary 'no tests exist yet', findings empty." \
  --output-format json \
  --json-schema "$(cat ~/.claude/skills/ralph-loop/templates/schemas/judge-verdict.schema.json)" \
  | node -e "const d = JSON.parse(require('fs').readFileSync(0)); console.log(JSON.stringify(d.structured_output))"
```
Expected: prints an object with `"verdict":"APPROVE"` and the other required fields —
confirms the schema is accepted by the live CLI, not just syntactically valid JSON.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/schemas/ 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop JSON schemas for contract + judge verdict" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 4: `scripts/toposort.mjs`

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/scripts/toposort.mjs`
- Test: `~/.claude/skills/ralph-loop/templates/scripts/toposort.test.mjs`

**Interfaces:**
- Consumes: a `contract.json` conforming to `contract.schema.json` (Task 3) —
  specifically `items[].id` (string) and `items[].dependsOn` (string array).
- Produces: CLI `node toposort.mjs <contractPath> <orderPath> <failReportPath>`. On
  success: exit 0, writes `orderPath` as a JSON array of item ids in dependency order.
  On cycle: exit 1, writes `failReportPath` as a Markdown file naming the exact cycle,
  writes nothing to `orderPath`. Exports `toposort(items)` (throws `Error` with a
  `cycle: [...]` message on cycle) for the test file and for Task 5/9 to reuse if
  needed.

- [ ] **Step 1: Write the failing test**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/toposort.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toposort } from './toposort.mjs';

test('orders a linear chain A -> B -> C', () => {
  const items = [
    { id: 'C', dependsOn: ['B'] },
    { id: 'A', dependsOn: [] },
    { id: 'B', dependsOn: ['A'] },
  ];
  assert.deepEqual(toposort(items), ['A', 'B', 'C']);
});

test('orders independent items before their dependents, any order among independents', () => {
  const items = [
    { id: 'A', dependsOn: [] },
    { id: 'D', dependsOn: [] },
    { id: 'B', dependsOn: ['A'] },
    { id: 'C', dependsOn: ['B'] },
  ];
  const order = toposort(items);
  assert.ok(order.indexOf('A') < order.indexOf('B'));
  assert.ok(order.indexOf('B') < order.indexOf('C'));
  assert.equal(order.length, 4);
});

test('throws with the exact cycle path on a circular dependency', () => {
  const items = [
    { id: 'A', dependsOn: ['C'] },
    { id: 'B', dependsOn: ['A'] },
    { id: 'C', dependsOn: ['B'] },
  ];
  assert.throws(() => toposort(items), /A -> B -> C -> A|B -> C -> A -> B|C -> A -> B -> C/);
});

test('throws when dependsOn references an unknown item id', () => {
  const items = [{ id: 'A', dependsOn: ['ghost'] }];
  assert.throws(() => toposort(items), /unknown item "ghost"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/toposort.test.mjs`
Expected: FAIL — `toposort.mjs` doesn't exist yet (`Cannot find module`).

- [ ] **Step 3: Write the implementation**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/toposort.mjs
import { readFileSync, writeFileSync } from 'node:fs';

export function toposort(items) {
  const ids = items.map((item) => item.id);
  const idSet = new Set(ids);
  const inDegree = new Map(ids.map((id) => [id, 0]));
  const dependents = new Map(ids.map((id) => [id, []]));

  for (const item of items) {
    for (const dep of item.dependsOn) {
      if (!idSet.has(dep)) {
        throw new Error(`Item "${item.id}" dependsOn unknown item "${dep}"`);
      }
      dependents.get(dep).push(item.id);
      inDegree.set(item.id, inDegree.get(item.id) + 1);
    }
  }

  const queue = ids.filter((id) => inDegree.get(id) === 0);
  const order = [];

  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);
    for (const next of dependents.get(id)) {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }

  if (order.length !== ids.length) {
    const stuck = ids.filter((id) => !order.includes(id));
    throw new Error(`Cycle detected: ${findCyclePath(stuck, items)}`);
  }

  return order;
}

function findCyclePath(stuckIds, items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const stuckSet = new Set(stuckIds);
  const visiting = new Set();
  const path = [];

  function dfs(id) {
    if (visiting.has(id)) {
      const cycleStart = path.indexOf(id);
      return [...path.slice(cycleStart), id];
    }
    visiting.add(id);
    path.push(id);
    for (const dep of byId.get(id).dependsOn) {
      if (stuckSet.has(dep)) {
        const found = dfs(dep);
        if (found) return found;
      }
    }
    path.pop();
    visiting.delete(id);
    return null;
  }

  for (const id of stuckIds) {
    const found = dfs(id);
    if (found) return found.join(' -> ');
  }
  return `${stuckIds.join(', ')} (cycle among these; exact path not isolated)`;
}

// CLI entrypoint — only runs when invoked directly, not when imported by the test.
if (process.argv[1] && process.argv[1].endsWith('toposort.mjs')) {
  const [, , contractPath, orderPath, failReportPath] = process.argv;
  const contract = JSON.parse(readFileSync(contractPath, 'utf8'));

  try {
    const order = toposort(contract.items);
    writeFileSync(orderPath, JSON.stringify(order, null, 2));
    console.log(`Toposort OK: ${order.join(', ')}`);
    process.exit(0);
  } catch (error) {
    writeFileSync(
      failReportPath,
      `# Contract Failed\n\n## Cycle detected\n\n\`\`\`\n${error.message}\n\`\`\`\n\nFix contract.json (or the spec that produced it) and re-run the Contract phase.\n`,
    );
    console.error(error.message);
    process.exit(1);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/toposort.test.mjs`
Expected: PASS, 4 tests, 0 failures.

- [ ] **Step 5: Verify the CLI entrypoint end-to-end**

```bash
cd /tmp && mkdir -p toposort-smoke && cd toposort-smoke
cat > contract.json <<'EOF'
{"items":[{"id":"A","dependsOn":[]},{"id":"B","dependsOn":["A"]}],"coverageMap":[]}
EOF
node ~/.claude/skills/ralph-loop/templates/scripts/toposort.mjs contract.json order.json fail.md
cat order.json
```
Expected: prints `Toposort OK: A, B`; `order.json` contains `["A","B"]`.

- [ ] **Step 6: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/scripts/toposort.mjs ralph-loop/templates/scripts/toposort.test.mjs 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop toposort script + tests" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 5: `scripts/validate-coverage.mjs`

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/scripts/validate-coverage.mjs`
- Test: `~/.claude/skills/ralph-loop/templates/scripts/validate-coverage.test.mjs`

**Interfaces:**
- Consumes: `contract.json`'s `coverageMap` array (`{requirement: string, coveredBy:
  string[]}[]`) — same shape as `contract.schema.json` (Task 3).
- Produces: exported `findOrphans(coverageMap)` returning an array of `requirement`
  strings whose `coveredBy` is empty (used by the test and by the CLI entrypoint). CLI:
  `node validate-coverage.mjs <contractPath> <failReportPath>` — exit 0 and no output
  file if no orphans; exit 1 and writes `failReportPath` (Markdown) listing every
  orphaned requirement if any exist.

- [ ] **Step 1: Write the failing test**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/validate-coverage.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findOrphans } from './validate-coverage.mjs';

test('returns empty array when every requirement has a coverer', () => {
  const coverageMap = [
    { requirement: 'AC-1', coveredBy: ['A'] },
    { requirement: 'AC-2', coveredBy: ['B', 'C'] },
  ];
  assert.deepEqual(findOrphans(coverageMap), []);
});

test('returns the requirement text for empty coveredBy arrays', () => {
  const coverageMap = [
    { requirement: 'AC-1', coveredBy: ['A'] },
    { requirement: 'AC-2 (loading state)', coveredBy: [] },
  ];
  assert.deepEqual(findOrphans(coverageMap), ['AC-2 (loading state)']);
});

test('treats an empty coverageMap as zero orphans', () => {
  assert.deepEqual(findOrphans([]), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/validate-coverage.test.mjs`
Expected: FAIL — `validate-coverage.mjs` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/validate-coverage.mjs
import { readFileSync, writeFileSync } from 'node:fs';

export function findOrphans(coverageMap) {
  return coverageMap
    .filter((entry) => entry.coveredBy.length === 0)
    .map((entry) => entry.requirement);
}

if (process.argv[1] && process.argv[1].endsWith('validate-coverage.mjs')) {
  const [, , contractPath, failReportPath] = process.argv;
  const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
  const orphans = findOrphans(contract.coverageMap);

  if (orphans.length === 0) {
    console.log('Coverage OK: every requirement has >=1 covering item.');
    process.exit(0);
  }

  const list = orphans.map((requirement) => `- ${requirement}`).join('\n');
  writeFileSync(
    failReportPath,
    `# Contract Failed\n\n## Orphaned requirements (no covering item)\n\n${list}\n\nRevise the spec or re-run the Contract phase so every requirement maps to >=1 item.\n`,
  );
  console.error(`Coverage FAILED: ${orphans.length} orphaned requirement(s).`);
  process.exit(1);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/validate-coverage.test.mjs`
Expected: PASS, 3 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/scripts/validate-coverage.mjs ralph-loop/templates/scripts/validate-coverage.test.mjs 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop coverage validation script + tests" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 6: `scripts/render-prompt.mjs`

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/scripts/render-prompt.mjs`
- Test: `~/.claude/skills/ralph-loop/templates/scripts/render-prompt.test.mjs`

**Interfaces:**
- Consumes: a template string containing `{{UPPER_SNAKE_CASE}}` placeholders; a single
  item object shaped like one entry of `contract.schema.json`'s `items[]` (Task 3).
- Produces: exported `renderPrompt(template, values)` (throws on any placeholder left
  unresolved) and `itemToPromptValues(item)` (flattens an item into the placeholder
  keys `ITEM_ID`, `ITEM_TITLE`, `ITEM_WHY`, `ITEM_OBJECTIVE`, `ITEM_FILES`,
  `ITEM_TEST_STRATEGY`, `ITEM_PROJECT_RULES`, `ITEM_SPECS_INTERFACES`,
  `ITEM_SPECS_TYPES`, `ITEM_SPECS_PROPS`, `ITEM_SPECS_SIGNATURES`,
  `ITEM_SPECS_ACCEPTANCE_CRITERIA`, `ITEM_SPECS_NOTES`). Task 10's prompt templates
  use exactly these keys plus run-level keys (`ATTEMPT_NUMBER`, `PREVIOUS_FEEDBACK`,
  `FULL_SUITE_CMD`, `MEMORY_PATH`, `SPEC_PATH`) supplied separately per call by
  `run.sh` (Task 11).

- [ ] **Step 1: Write the failing test**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/render-prompt.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPrompt, itemToPromptValues } from './render-prompt.mjs';

test('replaces every occurrence of a placeholder', () => {
  const out = renderPrompt('{{X}} and {{X}} again', { X: 'hi' });
  assert.equal(out, 'hi and hi again');
});

test('throws when a placeholder is left unresolved', () => {
  assert.throws(() => renderPrompt('{{X}} {{Y}}', { X: 'hi' }), /Unresolved placeholders: \{\{Y\}\}/);
});

test('itemToPromptValues flattens a full item', () => {
  const item = {
    id: 'A',
    title: 'Add sum util',
    why: 'AC-1 needs a sum helper',
    objective: 'implement sum(a, b)',
    files: ['src/sum.ts'],
    model: 'light',
    testStrategy: 'unit test with a few number pairs',
    dependsOn: [],
    projectRules: ['no any'],
    specs: {
      interfaces: [],
      types: [],
      props: [],
      signatures: ['sum(a: number, b: number): number'],
      acceptanceCriteria: ['AC-1: sum(2,3) === 5'],
      notes: '',
    },
  };
  const values = itemToPromptValues(item);
  assert.equal(values.ITEM_ID, 'A');
  assert.equal(values.ITEM_OBJECTIVE, 'implement sum(a, b)');
  assert.equal(values.ITEM_FILES, '- src/sum.ts');
  assert.equal(values.ITEM_SPECS_SIGNATURES, 'sum(a: number, b: number): number');
  assert.equal(values.ITEM_SPECS_ACCEPTANCE_CRITERIA, '- AC-1: sum(2,3) === 5');
  assert.equal(values.ITEM_PROJECT_RULES, '- no any');
});

test('itemToPromptValues defaults absent optional arrays to a placeholder string', () => {
  const item = {
    id: 'B',
    title: 't',
    why: 'w',
    objective: 'o',
    files: [],
    model: 'light',
    testStrategy: 'ts',
    dependsOn: [],
    specs: { acceptanceCriteria: ['AC-2'] },
  };
  const values = itemToPromptValues(item);
  assert.equal(values.ITEM_PROJECT_RULES, '(none declared)');
  assert.equal(values.ITEM_SPECS_INTERFACES, '(none)');
  assert.equal(values.ITEM_SPECS_NOTES, '(none)');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/render-prompt.test.mjs`
Expected: FAIL — `render-prompt.mjs` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/render-prompt.mjs
import { readFileSync } from 'node:fs';

export function renderPrompt(template, values) {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.split(`{{${key}}}`).join(String(value));
  }
  const leftover = result.match(/\{\{[A-Z_]+\}\}/g);
  if (leftover) {
    throw new Error(`Unresolved placeholders: ${leftover.join(', ')}`);
  }
  return result;
}

function listOrDefault(list, bulleted, fallback) {
  if (!list || list.length === 0) return fallback;
  return bulleted ? list.map((entry) => `- ${entry}`).join('\n') : list.join('\n');
}

export function itemToPromptValues(item) {
  return {
    ITEM_ID: item.id,
    ITEM_TITLE: item.title,
    ITEM_WHY: item.why,
    ITEM_OBJECTIVE: item.objective,
    ITEM_FILES: listOrDefault(item.files, true, '(none)'),
    ITEM_TEST_STRATEGY: item.testStrategy,
    ITEM_PROJECT_RULES: listOrDefault(item.projectRules, true, '(none declared)'),
    ITEM_SPECS_INTERFACES: listOrDefault(item.specs.interfaces, false, '(none)'),
    ITEM_SPECS_TYPES: listOrDefault(item.specs.types, false, '(none)'),
    ITEM_SPECS_PROPS: listOrDefault(item.specs.props, false, '(none)'),
    ITEM_SPECS_SIGNATURES: listOrDefault(item.specs.signatures, false, '(none)'),
    ITEM_SPECS_ACCEPTANCE_CRITERIA: listOrDefault(item.specs.acceptanceCriteria, true, '(none)'),
    ITEM_SPECS_NOTES: item.specs.notes || '(none)',
  };
}

if (process.argv[1] && process.argv[1].endsWith('render-prompt.mjs')) {
  const [, , templatePath, itemJsonPath, extraJsonPath] = process.argv;
  const template = readFileSync(templatePath, 'utf8');
  const item = JSON.parse(readFileSync(itemJsonPath, 'utf8'));
  const extra = extraJsonPath ? JSON.parse(readFileSync(extraJsonPath, 'utf8')) : {};
  const values = { ...itemToPromptValues(item), ...extra };
  process.stdout.write(renderPrompt(template, values));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/render-prompt.test.mjs`
Expected: PASS, 4 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/scripts/render-prompt.mjs ralph-loop/templates/scripts/render-prompt.test.mjs 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop prompt template renderer + tests" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 7: `scripts/commit-item.mjs`

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/scripts/commit-item.mjs`
- Test: `~/.claude/skills/ralph-loop/templates/scripts/commit-item.test.mjs`

**Interfaces:**
- Consumes: an item object (`id`, `title`, `objective`, `files[]` from
  `contract.schema.json`), an `attempt` number, and an optional list of extra file
  paths (the guarded scope-expansion escape hatch from the spec's Phase 2 step C/D).
- Produces: exported `buildCommitMessage(item, attempt)` (string) and
  `commitItem({ cwd, files, message })` (returns `{ success: true, sha }` or
  `{ success: false, stderr }` — never throws). CLI:
  `node commit-item.mjs <cwd> <itemJsonPath> <attempt> [extraFilesJsonPath]` prints
  `{"success":...}` JSON to stdout and exits 0/1 accordingly. This is the ONLY step in
  the whole workflow that runs `git add`/`git commit` — deterministic, no LLM call, so
  `git add -A`/`.` can never happen (per the spec's guardrails).

- [ ] **Step 1: Write the failing test**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/commit-item.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildCommitMessage, commitItem } from './commit-item.mjs';

function makeTempRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), 'ralph-commit-test-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  return dir;
}

test('buildCommitMessage includes id, title, objective, attempt', () => {
  const item = { id: 'A', title: 'Add sum util', objective: 'implement sum(a, b)' };
  const message = buildCommitMessage(item, 2);
  assert.match(message, /Add sum util/);
  assert.match(message, /implement sum\(a, b\)/);
  assert.match(message, /item A, attempt 2/);
});

test('commits exactly the given files and returns a real sha', () => {
  const dir = makeTempRepo();
  writeFileSync(path.join(dir, 'a.txt'), 'a');
  writeFileSync(path.join(dir, 'b.txt'), 'b (should not be committed)');
  const result = commitItem({ cwd: dir, files: ['a.txt'], message: 'feat: only a.txt' });
  assert.equal(result.success, true);
  assert.match(result.sha, /^[0-9a-f]{40}$/);
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: dir }).toString();
  assert.match(status, /\?\? b\.txt/); // b.txt still untracked
  const log = execFileSync('git', ['log', '-1', '--pretty=%s'], { cwd: dir }).toString().trim();
  assert.equal(log, 'feat: only a.txt');
});

test('refuses to commit an empty file list', () => {
  const dir = makeTempRepo();
  const result = commitItem({ cwd: dir, files: [], message: 'feat: nothing' });
  assert.equal(result.success, false);
  assert.match(result.stderr, /No files to commit/);
});

test('reports failure without throwing when a pre-commit hook rejects', () => {
  const dir = makeTempRepo();
  const hooksDir = path.join(dir, '.git', 'hooks');
  mkdirSync(hooksDir, { recursive: true });
  const hookPath = path.join(hooksDir, 'pre-commit');
  writeFileSync(hookPath, '#!/bin/sh\necho "blocked by hook" >&2\nexit 1\n');
  chmodSync(hookPath, 0o755);
  writeFileSync(path.join(dir, 'a.txt'), 'a');
  const result = commitItem({ cwd: dir, files: ['a.txt'], message: 'feat: should be blocked' });
  assert.equal(result.success, false);
  assert.match(result.stderr, /git commit failed/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/commit-item.test.mjs`
Expected: FAIL — `commit-item.mjs` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/commit-item.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export function buildCommitMessage(item, attempt) {
  return `feat: ${item.title} (item ${item.id})\n\n${item.objective}\n\nRalph-loop item ${item.id}, attempt ${attempt}.`;
}

export function commitItem({ cwd, files, message }) {
  if (!files || files.length === 0) {
    return { success: false, stderr: 'No files to commit — refusing to run git commit with an empty file list.' };
  }
  try {
    execFileSync('git', ['add', '--', ...files], { cwd });
  } catch (error) {
    return { success: false, stderr: `git add failed: ${error.stderr ? error.stderr.toString() : error.message}` };
  }
  try {
    execFileSync('git', ['commit', '-m', message], { cwd });
  } catch (error) {
    return { success: false, stderr: `git commit failed: ${error.stderr ? error.stderr.toString() : error.message}` };
  }
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd }).toString().trim();
  return { success: true, sha };
}

if (process.argv[1] && process.argv[1].endsWith('commit-item.mjs')) {
  const [, , cwd, itemJsonPath, attemptArg, extraFilesJsonPath] = process.argv;
  const item = JSON.parse(readFileSync(itemJsonPath, 'utf8'));
  const attempt = Number(attemptArg);
  const extraFiles = extraFilesJsonPath ? JSON.parse(readFileSync(extraFilesJsonPath, 'utf8')) : [];
  const files = [...item.files, ...extraFiles];
  const message = buildCommitMessage(item, attempt);
  const result = commitItem({ cwd, files, message });
  process.stdout.write(JSON.stringify(result));
  process.exit(result.success ? 0 : 1);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/commit-item.test.mjs`
Expected: PASS, 4 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/scripts/commit-item.mjs ralph-loop/templates/scripts/commit-item.test.mjs 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop deterministic commit script + tests" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 8: `scripts/run-full-suite.mjs`

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/scripts/run-full-suite.mjs`
- Test: `~/.claude/skills/ralph-loop/templates/scripts/run-full-suite.test.mjs`

**Interfaces:**
- Consumes: the generation-time `{{FULL_SUITE_CMD}}` string (may be a compound shell
  command like `yarn test && yarn check`) and a working directory.
- Produces: exported `runFullSuite(command, cwd)` returning `{ passed: boolean,
  output: string }` (never throws). CLI: `node run-full-suite.mjs <cwd> <command>`
  prints `{"passed":...,"output":"..."}` JSON to stdout, exits 0 if passed else 1. Used
  two ways: (a) invoked directly by the judge (steps B/D, which has `Bash` tool
  access) so its `testOutputSummary` is grounded in a real run, not a claim; (b)
  invoked directly by `run.sh` (Task 11) for the deterministic Phase 2.5 final
  integration pass.

- [ ] **Step 1: Write the failing test**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/run-full-suite.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runFullSuite } from './run-full-suite.mjs';

test('reports passed: true and captures stdout for a succeeding command', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ralph-suite-test-'));
  const result = runFullSuite('echo hello-from-suite', dir);
  assert.equal(result.passed, true);
  assert.match(result.output, /hello-from-suite/);
});

test('reports passed: false and captures output for a failing command', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ralph-suite-test-'));
  const result = runFullSuite('echo failing-output && false', dir);
  assert.equal(result.passed, false);
  assert.match(result.output, /failing-output/);
});

test('runs the command in the given cwd', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ralph-suite-test-'));
  const result = runFullSuite('pwd', dir);
  assert.equal(result.passed, true);
  assert.match(result.output.trim(), new RegExp(dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/run-full-suite.test.mjs`
Expected: FAIL — `run-full-suite.mjs` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/run-full-suite.mjs
import { execSync } from 'node:child_process';

export function runFullSuite(command, cwd) {
  try {
    const output = execSync(command, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { passed: true, output };
  } catch (error) {
    const output = `${error.stdout || ''}${error.stderr || ''}`;
    return { passed: false, output };
  }
}

if (process.argv[1] && process.argv[1].endsWith('run-full-suite.mjs')) {
  const [, , cwd, ...commandParts] = process.argv;
  const command = commandParts.join(' ');
  const result = runFullSuite(command, cwd);
  process.stdout.write(JSON.stringify(result));
  process.exit(result.passed ? 0 : 1);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/run-full-suite.test.mjs`
Expected: PASS, 3 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/scripts/run-full-suite.mjs ralph-loop/templates/scripts/run-full-suite.test.mjs 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop full-suite runner script + tests" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 9: `scripts/generate-report.mjs`

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/scripts/generate-report.mjs`
- Test: `~/.claude/skills/ralph-loop/templates/scripts/generate-report.test.mjs`

**Interfaces:**
- Consumes: `contract.json` (`items[]`, `coverageMap[]`, Task 3's schema);
  `progress.json` — an object keyed by item id, each value
  `{ status: "PENDING"|"COMPLETED"|"BLOCKED"|"SKIPPED", attempts: number, commitSha:
  string|null, blockReason: string|null }` (this is the shape Task 11's `run.sh`
  writes as Phase 2 runs — record it here since no earlier task defines it);
  `integrationResult` — `{ passed: boolean, output: string }` (the exact shape
  Task 8's `runFullSuite` returns, read from `.ralph/integration-result.json`);
  `costSummary` — `{ totalCostUsd: number }` (read from `.ralph/cost.json`, which
  Task 11's `run.sh` appends `total_cost_usd` to after every `claude -p` call).
- Produces: exported `buildMermaid(items, progress)`, `buildTaskTable(items,
  progress)`, `buildCoverageSection(coverageMap)`, `buildContractsAppendix(items)`,
  and `generateReport({ contract, progress, integrationResult, costSummary })`
  (returns the full `REPORT.md` string). CLI:
  `node generate-report.mjs <contractPath> <progressPath> <integrationResultPath> <costSummaryPath> <outputPath>`
  writes `outputPath`.

- [ ] **Step 1: Write the failing test**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/generate-report.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMermaid,
  buildTaskTable,
  buildCoverageSection,
  generateReport,
} from './generate-report.mjs';

const items = [
  { id: 'A', title: 'Hook', why: 'w', objective: 'o', files: ['a.ts'], model: 'light', testStrategy: 't', dependsOn: [], specs: { acceptanceCriteria: ['AC-1'], interfaces: ['DataHookResult'] } },
  { id: 'B', title: 'Container', why: 'w', objective: 'o', files: ['b.ts'], model: 'medium', testStrategy: 't', dependsOn: ['A'], specs: { acceptanceCriteria: ['AC-2'] } },
];
const progress = {
  A: { status: 'COMPLETED', attempts: 1, commitSha: 'a'.repeat(40), blockReason: null },
  B: { status: 'BLOCKED', attempts: 5, commitSha: null, blockReason: 'judge rejected: scope creep' },
};

test('buildMermaid emits one node per item, one edge per dependsOn, and status classes', () => {
  const mermaid = buildMermaid(items, progress);
  assert.match(mermaid, /flowchart TD/);
  assert.match(mermaid, /A\["Hook"\]/);
  assert.match(mermaid, /B\["Container"\]/);
  assert.match(mermaid, /A --> B/);
  assert.match(mermaid, /class A completed;/);
  assert.match(mermaid, /class B blocked;/);
});

test('buildTaskTable includes one row per item with status/attempts/short sha', () => {
  const table = buildTaskTable(items, progress);
  assert.match(table, /\| A \| Hook \| COMPLETED \| 1 \| aaaaaaa \| a\.ts \| - \|/);
  assert.match(table, /\| B \| Container \| BLOCKED \| 5 \| - \| b\.ts \| A \|/);
});

test('buildCoverageSection lists every requirement with its coverers', () => {
  const section = buildCoverageSection([{ requirement: 'AC-1', coveredBy: ['A'] }]);
  assert.match(section, /\| AC-1 \| A \|/);
});

test('generateReport composes a full report with summary counts and integration result', () => {
  const report = generateReport({
    contract: { items, coverageMap: [{ requirement: 'AC-1', coveredBy: ['A'] }] },
    progress,
    integrationResult: { passed: true, output: 'all green' },
    costSummary: { totalCostUsd: 1.2345 },
  });
  assert.match(report, /Items completed: 1\/2/);
  assert.match(report, /Blocked: 1/);
  assert.match(report, /\$1\.2345/);
  assert.match(report, /PASSED/);
  assert.match(report, /all green/);
  assert.match(report, /DataHookResult/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/generate-report.test.mjs`
Expected: FAIL — `generate-report.mjs` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```javascript
// ~/.claude/skills/ralph-loop/templates/scripts/generate-report.mjs
import { readFileSync, writeFileSync } from 'node:fs';

function escapeMermaid(text) {
  return text.replace(/"/g, "'");
}

export function buildMermaid(items, progress) {
  const lines = ['flowchart TD'];
  for (const item of items) {
    lines.push(`    ${item.id}["${escapeMermaid(item.title)}"]`);
  }
  for (const item of items) {
    for (const dep of item.dependsOn) {
      lines.push(`    ${dep} --> ${item.id}`);
    }
  }
  lines.push('');
  lines.push('    classDef completed stroke:#2a2,stroke-width:2px;');
  lines.push('    classDef blocked stroke:#c00,stroke-width:2px;');
  lines.push('    classDef skipped stroke:#888,stroke-width:2px,stroke-dasharray: 4 2;');
  for (const item of items) {
    const status = progress[item.id]?.status;
    if (status === 'COMPLETED') lines.push(`    class ${item.id} completed;`);
    if (status === 'BLOCKED') lines.push(`    class ${item.id} blocked;`);
    if (status === 'SKIPPED') lines.push(`    class ${item.id} skipped;`);
  }
  return lines.join('\n');
}

export function buildTaskTable(items, progress) {
  const header = '| id | title | status | attempts | commit | files | dependsOn |\n|---|---|---|---|---|---|---|';
  const rows = items.map((item) => {
    const p = progress[item.id] || { status: 'PENDING', attempts: 0, commitSha: null };
    const commit = p.commitSha ? p.commitSha.slice(0, 7) : '-';
    const deps = item.dependsOn.length ? item.dependsOn.join(', ') : '-';
    return `| ${item.id} | ${item.title} | ${p.status} | ${p.attempts} | ${commit} | ${item.files.join(', ')} | ${deps} |`;
  });
  return [header, ...rows].join('\n');
}

export function buildCoverageSection(coverageMap) {
  const header = '| requirement | covered by |\n|---|---|';
  const rows = coverageMap.map((entry) => `| ${entry.requirement} | ${entry.coveredBy.join(', ')} |`);
  return [header, ...rows].join('\n');
}

export function buildContractsAppendix(items) {
  return items
    .map((item) => {
      const parts = [`### ${item.id} — ${item.title}`];
      if (item.specs.interfaces?.length) {
        parts.push(`**Interfaces:**\n\`\`\`\n${item.specs.interfaces.join('\n')}\n\`\`\``);
      }
      if (item.specs.types?.length) {
        parts.push(`**Types:**\n\`\`\`\n${item.specs.types.join('\n')}\n\`\`\``);
      }
      if (item.specs.signatures?.length) {
        parts.push(`**Signatures:**\n\`\`\`\n${item.specs.signatures.join('\n')}\n\`\`\``);
      }
      return parts.join('\n\n');
    })
    .join('\n\n');
}

export function generateReport({ contract, progress, integrationResult, costSummary }) {
  const items = contract.items;
  const statuses = items.map((item) => progress[item.id]?.status || 'PENDING');
  const completed = statuses.filter((s) => s === 'COMPLETED').length;
  const blocked = statuses.filter((s) => s === 'BLOCKED').length;
  const skipped = statuses.filter((s) => s === 'SKIPPED').length;

  return `# Ralph Loop Report

## Summary

- Items completed: ${completed}/${items.length}
- Blocked: ${blocked}
- Skipped: ${skipped}
- Total cost: $${costSummary.totalCostUsd.toFixed(4)}

## Graph

\`\`\`mermaid
${buildMermaid(items, progress)}
\`\`\`

## Tasks

${buildTaskTable(items, progress)}

## Coverage Map

${buildCoverageSection(contract.coverageMap)}

## Frozen Contracts

${buildContractsAppendix(items)}

## Final Integration Pass

${integrationResult.passed ? 'PASSED' : 'FAILED'}

\`\`\`
${integrationResult.output}
\`\`\`
`;
}

if (process.argv[1] && process.argv[1].endsWith('generate-report.mjs')) {
  const [, , contractPath, progressPath, integrationResultPath, costSummaryPath, outputPath] = process.argv;
  const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
  const progress = JSON.parse(readFileSync(progressPath, 'utf8'));
  const integrationResult = JSON.parse(readFileSync(integrationResultPath, 'utf8'));
  const costSummary = JSON.parse(readFileSync(costSummaryPath, 'utf8'));
  const report = generateReport({ contract, progress, integrationResult, costSummary });
  writeFileSync(outputPath, report);
  console.log(`Report written to ${outputPath}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test ~/.claude/skills/ralph-loop/templates/scripts/generate-report.test.mjs`
Expected: PASS, 4 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/scripts/generate-report.mjs ralph-loop/templates/scripts/generate-report.test.mjs 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop Mermaid report generator + tests" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 10: Prompt templates

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/prompts/contract-prompt.md`
- Create: `~/.claude/skills/ralph-loop/templates/prompts/worker-red-prompt.md`
- Create: `~/.claude/skills/ralph-loop/templates/prompts/judge-review-tests-prompt.md`
- Create: `~/.claude/skills/ralph-loop/templates/prompts/worker-green-prompt.md`
- Create: `~/.claude/skills/ralph-loop/templates/prompts/judge-final-review-prompt.md`

**Interfaces:**
- Consumes: Task 6's placeholder set (`ITEM_ID`, `ITEM_TITLE`, `ITEM_WHY`,
  `ITEM_OBJECTIVE`, `ITEM_FILES`, `ITEM_TEST_STRATEGY`, `ITEM_PROJECT_RULES`,
  `ITEM_SPECS_*`) plus run-level placeholders introduced here: `{{SPEC_PATH}}`,
  `{{ATTEMPT_NUMBER}}`, `{{PREVIOUS_FEEDBACK}}`, `{{FULL_SUITE_CMD}}`,
  `{{MEMORY_PATH}}`.
- Produces: the literal template files `render-prompt.mjs` (Task 6) reads and
  `run.sh` (Task 11) feeds to `claude -p` at each of the 5 Phase 2 steps plus Phase 1.

- [ ] **Step 1: Write `contract-prompt.md`**

```markdown
You are the Contract phase of a ralph-loop run. Read {{SPEC_PATH}} in full.

Also look in the current repository for its own convention docs (CLAUDE.md,
AGENTS.md, RULES.md, .claude/rules/*.md, or equivalent) and, for every item you
create below, cite the specific rules from those docs that apply to it into that
item's `projectRules` field (verbatim quotes or precise paraphrase with file
reference, not vague summaries).

Decompose the spec into small work items, each scoped to fit in ONE git commit.
For each item:
- Extract every interface, type, prop, and function signature the spec declares
  EXACTLY as written — never rename, reshape, widen, or narrow them. These become
  that item's `specs.interfaces` / `specs.types` / `specs.props` / `specs.signatures`.
- Write `specs.acceptanceCriteria` as the specific, testable criteria this item must
  satisfy (quote the spec's AC/DoD language where the spec has it).
- Declare `dependsOn` for every real dependency: both "item Y cannot be built until
  item X exists" (existence) and "item Y edits the same lines item X wrote" (write
  conflict). Under-declaring edges is worse than over-declaring them.
- Assign `model: "light"` for purely mechanical work (types, enums, constants, style
  extraction, dead code removal) or `model: "medium"` for anything with real logic,
  data flow, or conditionals. Never assign `"strong"` — that tier is reserved for
  review, not implementation.
- Write `testStrategy` describing exactly how this item's tests will verify it.

Finally, build a `coverageMap`: one entry per requirement/acceptance-criterion/DoD
line in the spec, with `coveredBy` listing every item id that addresses it. Every
requirement must have at least one coverer — if you cannot cover something, say so by
leaving `coveredBy` empty rather than forcing a false mapping; the run will stop and a
human will resolve it.

Respond ONLY in the required structured format — no prose outside it.
```

- [ ] **Step 2: Write `worker-red-prompt.md`**

```markdown
You are implementing item {{ITEM_ID}} ("{{ITEM_TITLE}}") of a ralph-loop run, attempt
{{ATTEMPT_NUMBER}}.

First, follow the disk-memory skill against {{MEMORY_PATH}}: read state.md, the tail
of log.md, and all of decisions.md before doing anything else.

Why this item exists: {{ITEM_WHY}}

Objective: {{ITEM_OBJECTIVE}}

Files this item owns: {{ITEM_FILES}}

Interfaces (verbatim, do not rename/reshape):
{{ITEM_SPECS_INTERFACES}}

Types (verbatim):
{{ITEM_SPECS_TYPES}}

Signatures (verbatim):
{{ITEM_SPECS_SIGNATURES}}

Acceptance criteria:
{{ITEM_SPECS_ACCEPTANCE_CRITERIA}}

Test strategy: {{ITEM_TEST_STRATEGY}}

Project rules that apply to this item:
{{ITEM_PROJECT_RULES}}

Previous attempt's feedback (empty if this is attempt 1): {{PREVIOUS_FEEDBACK}}

Your task RIGHT NOW is ONLY the RED step: write tests for this item's objective and
acceptance criteria — no implementation code. Run the tests and confirm they FAIL. If
they pass immediately, your tests are not testing anything real — rewrite them until
they genuinely fail for the right reason.

Update {{MEMORY_PATH}}/state.md and append to {{MEMORY_PATH}}/log.md before finishing,
per the disk-memory skill.

Do not commit. Do not touch any file outside {{ITEM_FILES}}.
```

- [ ] **Step 3: Write `judge-review-tests-prompt.md`**

```markdown
You are the judge reviewing the RED step (tests only, no implementation) for item
{{ITEM_ID}} ("{{ITEM_TITLE}}"), attempt {{ATTEMPT_NUMBER}}. You never implement, only
judge. You have Read, Grep, Glob, and Bash — no Edit or Write.

Objective: {{ITEM_OBJECTIVE}}
Acceptance criteria:
{{ITEM_SPECS_ACCEPTANCE_CRITERIA}}
Interfaces/types/signatures (must be used verbatim, not reshaped):
{{ITEM_SPECS_INTERFACES}}
{{ITEM_SPECS_TYPES}}
{{ITEM_SPECS_SIGNATURES}}
Project rules:
{{ITEM_PROJECT_RULES}}

You MUST actually run the tests — do not approve based on reading the code alone. Run:
`node .ralph/scripts/run-full-suite.mjs <repo-root> "{{FULL_SUITE_CMD}}"` and read its
output.

Check, in order:
1. Do the new tests genuinely cover the objective and every acceptance criterion?
2. Do they use the declared interfaces/types/signatures verbatim (no renaming/
   reshaping)?
3. Do they follow the project rules listed above?
4. Did you confirm the tests actually FAIL right now (red)? If the suite is green
   already, that is a REJECT — the tests aren't testing anything.

Respond ONLY in the required structured format: `verdict` APPROVE only if all four
checks pass, `ranTests: true` (you must have actually run them), `testOutputSummary`
describing what the run showed, and `findings` with file:line for every issue on
REJECT (empty array on APPROVE). Leave `scopeExpansionJustified` null — not
applicable at this step.
```

- [ ] **Step 4: Write `worker-green-prompt.md`**

```markdown
You are implementing item {{ITEM_ID}} ("{{ITEM_TITLE}}") of a ralph-loop run, attempt
{{ATTEMPT_NUMBER}}. The tests for this item already exist and were judge-approved as a
valid red state.

First, follow the disk-memory skill against {{MEMORY_PATH}}: read state.md, the tail
of log.md, and all of decisions.md before doing anything else.

Objective: {{ITEM_OBJECTIVE}}
Files this item owns: {{ITEM_FILES}}
Test strategy: {{ITEM_TEST_STRATEGY}}
Project rules:
{{ITEM_PROJECT_RULES}}

Previous review feedback, if any (empty on this item's first green attempt):
{{PREVIOUS_FEEDBACK}}

Your task RIGHT NOW is the GREEN step: write the minimal implementation to make the
existing tests pass. Run lint/style/autofix until clean. Do NOT commit — a separate
deterministic step handles that.

Scope: stay inside {{ITEM_FILES}}. EXCEPTION — if, and only if, making these tests
genuinely pass requires fixing a real bug in a file from an EARLIER, already-committed
item (not this item's own scope), you may touch that file, but you MUST append an
entry to {{MEMORY_PATH}}/decisions.md explaining exactly what was wrong and why the
fix belongs there, before finishing. Do not use this to expand scope for convenience —
only for a genuine regression the tests in front of you expose.

Update {{MEMORY_PATH}}/state.md and append to {{MEMORY_PATH}}/log.md before finishing.
```

- [ ] **Step 5: Write `judge-final-review-prompt.md`**

```markdown
You are the judge doing the FINAL review of item {{ITEM_ID}} ("{{ITEM_TITLE}}"),
attempt {{ATTEMPT_NUMBER}}. You never implement, only judge. You have Read, Grep,
Glob, and Bash — no Edit or Write.

Objective: {{ITEM_OBJECTIVE}}
Acceptance criteria:
{{ITEM_SPECS_ACCEPTANCE_CRITERIA}}
Interfaces/types/signatures (must still be verbatim):
{{ITEM_SPECS_INTERFACES}}
{{ITEM_SPECS_TYPES}}
{{ITEM_SPECS_SIGNATURES}}
Files this item owns: {{ITEM_FILES}}
Project rules:
{{ITEM_PROJECT_RULES}}

You MUST actually run the full suite — do not approve from reading alone. Run:
`node .ralph/scripts/run-full-suite.mjs <repo-root> "{{FULL_SUITE_CMD}}"` and read its
output. This is the WHOLE suite, not just this item's new tests — a regression in an
earlier item must be caught here too.

Check, in order:
1. Is the requirement genuinely satisfied (not just "tests are green" — read the
   actual implementation)?
2. Are the interfaces/types/signatures still exactly as declared (no drift introduced
   while making tests pass)?
3. Are the project rules followed, with file:line for any violation?
4. Is the full suite green right now?
5. Scope: run `git status --porcelain` inside the repo. Is every changed file inside
   {{ITEM_FILES}}? If not, check {{MEMORY_PATH}}/decisions.md for an entry explaining
   the extra file as a justified regression fix. If there's a justification and it's
   credible, set `scopeExpansionJustified: true`. If there's no entry, or the entry
   doesn't hold up, set `scopeExpansionJustified: false` and REJECT (unexplained scope
   creep) — this includes rejecting for touching files that have nothing to do with a
   real regression.

Respond ONLY in the required structured format: `verdict` APPROVE only if all five
checks pass, `ranTests: true`, `testOutputSummary` describing the run, `findings` with
file:line for every issue on REJECT, and `scopeExpansionJustified` (boolean if any
file outside {{ITEM_FILES}} changed, null if none did).
```

- [ ] **Step 6: Verify**

Run: `ls ~/.claude/skills/ralph-loop/templates/prompts/`
Expected: 5 files listed (`contract-prompt.md`, `worker-red-prompt.md`,
`judge-review-tests-prompt.md`, `worker-green-prompt.md`,
`judge-final-review-prompt.md`).

- [ ] **Step 7: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/prompts/ 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop phase and per-item prompt templates" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 11: `run.sh` orchestrator + `README.md.tmpl`

**Files:**
- Create: `~/.claude/skills/ralph-loop/templates/run.sh`
- Create: `~/.claude/skills/ralph-loop/templates/README.md.tmpl`

**Interfaces:**
- Consumes: every script from Tasks 4-9, every prompt from Task 10, both schemas from
  Task 3, and the `{{...}}` generation-time placeholders Task 2's SKILL.md
  substitutes. Runtime layout it establishes (not defined by any earlier task, so
  fixed here): the skill assets stay in `<source-repo>/.ralph/`; a **separate git
  worktree** is created as a sibling directory `<parent-of-source-repo>/<repo-name>-<branch-slug>/`;
  all per-run state (spec copy, `contract.json`, `order.json`, `progress.json`,
  `memory/`, `cost.json`, `integration-result.json`, `REPORT.md`) lives in
  `<worktree>/.ralph-run/`, excluded from git via `.git/info/exclude` so it can never
  be accidentally committed.
- Produces: `progress.json` shape `{ [itemId]: { status, attempts, commitSha,
  blockReason } }` (consumed by Task 9's `generate-report.mjs`); `cost.json` shape
  `{ totalCostUsd: number, calls: [{phase, costUsd}] }`.

- [ ] **Step 1: Write `run.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

# --- Generation-time values (substituted by the ralph-loop skill at scaffold time) ---
SPEC_PATH="{{SPEC_PATH}}"
BRANCH_NAME="{{BRANCH_NAME}}"
MAX_ATTEMPTS_PER_ITEM="{{MAX_ATTEMPTS_PER_ITEM}}"
PER_CALL_BUDGET_USD="{{PER_CALL_BUDGET_USD}}"
TOTAL_BUDGET_USD="{{TOTAL_BUDGET_USD}}"
SETUP_CMD="{{SETUP_CMD}}"
MODEL_LIGHT="{{MODEL_LIGHT}}"
MODEL_MEDIUM="{{MODEL_MEDIUM}}"
MODEL_STRONG="{{MODEL_STRONG}}"
FULL_SUITE_CMD="{{FULL_SUITE_CMD}}"

RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO="$(cd "$RALPH_DIR/.." && pwd)"
SCRIPTS="$RALPH_DIR/scripts"
PROMPTS="$RALPH_DIR/prompts"
SCHEMAS="$RALPH_DIR/schemas"

REPO_NAME="$(basename "$SOURCE_REPO")"
SLUG="$(echo "$BRANCH_NAME" | tr '/' '-')"
WORKTREE_DIR="$(dirname "$SOURCE_REPO")/${REPO_NAME}-${SLUG}"
STATE_DIR="$WORKTREE_DIR/.ralph-run"
MEMORY_DIR="$STATE_DIR/memory"

fail() { echo "ABORT: $1" >&2; exit 1; }

record_cost() {
  local phase="$1" cost="$2"
  node -e "
    const fs = require('fs');
    const path = '$STATE_DIR/cost.json';
    const summary = JSON.parse(fs.readFileSync(path, 'utf8'));
    summary.totalCostUsd += $cost;
    summary.calls.push({ phase: '$phase', costUsd: $cost });
    fs.writeFileSync(path, JSON.stringify(summary, null, 2));
  "
  local total
  total="$(jq '.totalCostUsd' "$STATE_DIR/cost.json")"
  if awk -v t="$total" -v cap="$TOTAL_BUDGET_USD" 'BEGIN { exit !(t > cap) }'; then
    fail "total run budget exceeded (\$$total > \$$TOTAL_BUDGET_USD) — see $STATE_DIR/cost.json"
  fi
}

# Writes one progress.json entry. Passes free-text (item ids, judge findings) through
# environment variables, never interpolated into the JS source string — item ids come
# from the Contract phase's LLM output and blockReason from judge findings, both of
# which can contain quotes/backticks that would otherwise break out of a JS string
# literal built with bash interpolation.
write_progress() {
  ITEM_ID_ENV="$1" STATUS_ENV="$2" ATTEMPTS_ENV="$3" SHA_ENV="${4:-}" REASON_ENV="${5:-}" \
  node -e "
    const fs = require('fs');
    const path = '$STATE_DIR/progress.json';
    const p = JSON.parse(fs.readFileSync(path, 'utf8'));
    p[process.env.ITEM_ID_ENV] = {
      status: process.env.STATUS_ENV,
      attempts: Number(process.env.ATTEMPTS_ENV),
      commitSha: process.env.SHA_ENV || null,
      blockReason: process.env.REASON_ENV || null,
    };
    fs.writeFileSync(path, JSON.stringify(p, null, 2));
  "
}

call_claude_structured() {
  local prompt_file="$1" model="$2" schema_file="$3" allowed_tools="$4" out="$5"
  local prompt; prompt="$(cat "$prompt_file")"
  local tools_args=()
  [ -n "$allowed_tools" ] && tools_args=(--allowedTools "$allowed_tools")
  claude -p "$prompt" --model "$model" --output-format json \
    --json-schema "$(cat "$schema_file")" \
    --dangerously-skip-permissions --max-budget-usd "$PER_CALL_BUDGET_USD" \
    "${tools_args[@]}" > "$out"
  record_cost "$(basename "$prompt_file")" "$(jq '.total_cost_usd' "$out")"
}

call_claude_free() {
  local prompt_file="$1" model="$2" out="$3"
  local prompt; prompt="$(cat "$prompt_file")"
  claude -p "$prompt" --model "$model" --output-format json \
    --dangerously-skip-permissions --max-budget-usd "$PER_CALL_BUDGET_USD" \
    > "$out"
  record_cost "$(basename "$prompt_file")" "$(jq '.total_cost_usd' "$out")"
}

# --- Phase 0: Setup (deterministic) ---
cd "$SOURCE_REPO"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$CURRENT_BRANCH" != "main" ] || fail "refusing to run from main"
[ "$CURRENT_BRANCH" != "master" ] || fail "refusing to run from master"
[ -z "$(git status --porcelain)" ] || fail "working tree is dirty — commit or stash before running"

if [ -d "$WORKTREE_DIR" ]; then
  echo "Worktree already exists at $WORKTREE_DIR, resuming."
else
  git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR"
  echo ".ralph-run/" >> "$WORKTREE_DIR/.git/info/exclude"
fi

mkdir -p "$STATE_DIR" "$MEMORY_DIR/cycles"
if [ ! -f "$MEMORY_DIR/state.md" ]; then
  cat > "$MEMORY_DIR/state.md" <<'MEMEOF'
# State

## Objective
(uninitialized)

## Checklist
- [ ] Phase 0 setup

## Done
(nothing yet)

## Next
Run Phase 0 setup

## Blockers
(none)
MEMEOF
fi
touch "$MEMORY_DIR/log.md" "$MEMORY_DIR/decisions.md"

for envfile in "$SOURCE_REPO"/.env "$SOURCE_REPO"/.env.*; do
  [ -f "$envfile" ] && cp "$envfile" "$WORKTREE_DIR/"
done

cp "$SPEC_PATH" "$STATE_DIR/spec.md"

if [ -n "$SETUP_CMD" ]; then
  ( cd "$WORKTREE_DIR" && eval "$SETUP_CMD" )
fi

[ -f "$STATE_DIR/cost.json" ] || echo '{"totalCostUsd": 0, "calls": []}' > "$STATE_DIR/cost.json"

# --- Phase 1: Contract (Graph Engineering, strong model) ---
if [ ! -f "$STATE_DIR/contract.json" ]; then
  CONTRACT_PROMPT="$STATE_DIR/rendered-contract-prompt.md"
  sed "s|{{SPEC_PATH}}|$STATE_DIR/spec.md|g" "$PROMPTS/contract-prompt.md" > "$CONTRACT_PROMPT"

  CONTRACT_RAW="$STATE_DIR/contract-raw.json"
  call_claude_structured "$CONTRACT_PROMPT" "$MODEL_STRONG" "$SCHEMAS/contract.schema.json" "" "$CONTRACT_RAW"
  jq '.structured_output' "$CONTRACT_RAW" > "$STATE_DIR/contract.json"

  node "$SCRIPTS/validate-coverage.mjs" "$STATE_DIR/contract.json" "$STATE_DIR/CONTRACT-FAILED.md" \
    || fail "coverage validation failed — see $STATE_DIR/CONTRACT-FAILED.md"

  node "$SCRIPTS/toposort.mjs" "$STATE_DIR/contract.json" "$STATE_DIR/order.json" "$STATE_DIR/CONTRACT-FAILED.md" \
    || fail "toposort failed (cycle) — see $STATE_DIR/CONTRACT-FAILED.md"

  node -e "
    const fs = require('fs');
    const contract = JSON.parse(fs.readFileSync('$STATE_DIR/contract.json', 'utf8'));
    const progress = {};
    for (const item of contract.items) {
      progress[item.id] = { status: 'PENDING', attempts: 0, commitSha: null, blockReason: null };
    }
    fs.writeFileSync('$STATE_DIR/progress.json', JSON.stringify(progress, null, 2));
  "
  echo "Contract phase complete: $(jq '.items | length' "$STATE_DIR/contract.json") items."
else
  echo "Contract already exists at $STATE_DIR/contract.json, resuming Phase 2."
fi

# --- Phase 2: Implement (ralph loop, per item, sequential in order.json order) ---
mapfile -t ORDER < <(jq -r '.[]' "$STATE_DIR/order.json")

for ITEM_ID in "${ORDER[@]}"; do
  EXISTING_STATUS="$(jq -r --arg id "$ITEM_ID" '.[$id].status' "$STATE_DIR/progress.json")"
  if [ "$EXISTING_STATUS" != "PENDING" ]; then
    echo "SKIP (already $EXISTING_STATUS) $ITEM_ID"
    continue
  fi

  ITEM_JSON="$STATE_DIR/item-$ITEM_ID.json"
  jq --arg id "$ITEM_ID" '.items[] | select(.id == $id)' "$STATE_DIR/contract.json" > "$ITEM_JSON"
  ITEM_MODEL_TIER="$(jq -r '.model' "$ITEM_JSON")"
  if [ "$ITEM_MODEL_TIER" = "light" ]; then ITEM_MODEL="$MODEL_LIGHT"; else ITEM_MODEL="$MODEL_MEDIUM"; fi

  mapfile -t DEPS < <(jq -r '.dependsOn[]?' "$ITEM_JSON")
  SKIP_DUE_TO=""
  for DEP in "${DEPS[@]:-}"; do
    [ -z "$DEP" ] && continue
    DEP_STATUS="$(jq -r --arg id "$DEP" '.[$id].status' "$STATE_DIR/progress.json")"
    if [ "$DEP_STATUS" = "BLOCKED" ] || [ "$DEP_STATUS" = "SKIPPED" ]; then
      SKIP_DUE_TO="$DEP"
      break
    fi
  done
  if [ -n "$SKIP_DUE_TO" ]; then
    write_progress "$ITEM_ID" "SKIPPED" 0 "" "dependency $SKIP_DUE_TO is BLOCKED or SKIPPED"
    echo "SKIPPED $ITEM_ID (dependency $SKIP_DUE_TO not completed)"
    continue
  fi

  ATTEMPT=1
  ITEM_DONE=false
  PREVIOUS_FEEDBACK="(none — first attempt)"
  RED_STAGE=true

  while [ "$ATTEMPT" -le "$MAX_ATTEMPTS_PER_ITEM" ]; do
    EXTRA_VALUES="$STATE_DIR/extra-$ITEM_ID-$ATTEMPT.json"
    jq -n --arg attempt "$ATTEMPT" --arg feedback "$PREVIOUS_FEEDBACK" --arg suite "$FULL_SUITE_CMD" --arg memory "$MEMORY_DIR" \
      '{ATTEMPT_NUMBER: $attempt, PREVIOUS_FEEDBACK: $feedback, FULL_SUITE_CMD: $suite, MEMORY_PATH: $memory}' > "$EXTRA_VALUES"

    if [ "$RED_STAGE" = true ]; then
      RED_PROMPT="$STATE_DIR/rendered-$ITEM_ID-$ATTEMPT-red.md"
      node "$SCRIPTS/render-prompt.mjs" "$PROMPTS/worker-red-prompt.md" "$ITEM_JSON" "$EXTRA_VALUES" > "$RED_PROMPT"
      call_claude_free "$RED_PROMPT" "$ITEM_MODEL" "$STATE_DIR/out-$ITEM_ID-$ATTEMPT-red.json"

      JUDGE_B_PROMPT="$STATE_DIR/rendered-$ITEM_ID-$ATTEMPT-judgeB.md"
      node "$SCRIPTS/render-prompt.mjs" "$PROMPTS/judge-review-tests-prompt.md" "$ITEM_JSON" "$EXTRA_VALUES" > "$JUDGE_B_PROMPT"
      JUDGE_B_OUT="$STATE_DIR/out-$ITEM_ID-$ATTEMPT-judgeB.json"
      call_claude_structured "$JUDGE_B_PROMPT" "$MODEL_STRONG" "$SCHEMAS/judge-verdict.schema.json" "Read,Grep,Glob,Bash" "$JUDGE_B_OUT"
      VERDICT_B="$(jq -r '.structured_output.verdict' "$JUDGE_B_OUT")"

      if [ "$VERDICT_B" = "REJECT" ]; then
        PREVIOUS_FEEDBACK="$(jq -r '.structured_output.findings | map(.issue) | join("; ")' "$JUDGE_B_OUT")"
        ATTEMPT=$((ATTEMPT + 1))
        continue
      fi
      RED_STAGE=false
    fi

    GREEN_PROMPT="$STATE_DIR/rendered-$ITEM_ID-$ATTEMPT-green.md"
    node "$SCRIPTS/render-prompt.mjs" "$PROMPTS/worker-green-prompt.md" "$ITEM_JSON" "$EXTRA_VALUES" > "$GREEN_PROMPT"
    call_claude_free "$GREEN_PROMPT" "$ITEM_MODEL" "$STATE_DIR/out-$ITEM_ID-$ATTEMPT-green.json"

    JUDGE_D_PROMPT="$STATE_DIR/rendered-$ITEM_ID-$ATTEMPT-judgeD.md"
    node "$SCRIPTS/render-prompt.mjs" "$PROMPTS/judge-final-review-prompt.md" "$ITEM_JSON" "$EXTRA_VALUES" > "$JUDGE_D_PROMPT"
    JUDGE_D_OUT="$STATE_DIR/out-$ITEM_ID-$ATTEMPT-judgeD.json"
    call_claude_structured "$JUDGE_D_PROMPT" "$MODEL_STRONG" "$SCHEMAS/judge-verdict.schema.json" "Read,Grep,Glob,Bash" "$JUDGE_D_OUT"
    VERDICT_D="$(jq -r '.structured_output.verdict' "$JUDGE_D_OUT")"

    if [ "$VERDICT_D" = "REJECT" ]; then
      PREVIOUS_FEEDBACK="$(jq -r '.structured_output.findings | map(.issue) | join("; ")' "$JUDGE_D_OUT")"
      ATTEMPT=$((ATTEMPT + 1))
      continue
    fi

    # Step E: commit (deterministic). Any file changed outside item.files was already
    # gated by judge D's scopeExpansionJustified check above — collect it here so the
    # justified regression fix actually gets committed alongside this item.
    EXTRA_FILES="$STATE_DIR/extra-files-$ITEM_ID.json"
    node -e "
      const { execFileSync } = require('node:child_process');
      const fs = require('node:fs');
      const item = JSON.parse(fs.readFileSync('$ITEM_JSON', 'utf8'));
      const status = execFileSync('git', ['status', '--porcelain'], { cwd: '$WORKTREE_DIR' }).toString();
      const changed = status.split('\n').filter(Boolean).map((line) => line.slice(3).trim());
      const extra = changed.filter((f) => !item.files.includes(f));
      fs.writeFileSync('$EXTRA_FILES', JSON.stringify(extra));
    "
    COMMIT_OUT="$STATE_DIR/commit-$ITEM_ID.json"
    if node "$SCRIPTS/commit-item.mjs" "$WORKTREE_DIR" "$ITEM_JSON" "$ATTEMPT" "$EXTRA_FILES" > "$COMMIT_OUT"; then
      SHA="$(jq -r '.sha' "$COMMIT_OUT")"
      write_progress "$ITEM_ID" "COMPLETED" "$ATTEMPT" "$SHA" ""
      echo "COMPLETED $ITEM_ID ($SHA)"
      ITEM_DONE=true
      break
    else
      PREVIOUS_FEEDBACK="commit/hook failed: $(jq -r '.stderr' "$COMMIT_OUT")"
      ATTEMPT=$((ATTEMPT + 1))
      continue
    fi
  done

  if [ "$ITEM_DONE" != true ]; then
    write_progress "$ITEM_ID" "BLOCKED" "$MAX_ATTEMPTS_PER_ITEM" "" "$PREVIOUS_FEEDBACK"
    echo "BLOCKED $ITEM_ID after $MAX_ATTEMPTS_PER_ITEM attempts"
  fi
done

# --- Phase 2.5: Final integration pass (deterministic) ---
INTEGRATION_OUT="$STATE_DIR/integration-result.json"
node "$SCRIPTS/run-full-suite.mjs" "$WORKTREE_DIR" "$FULL_SUITE_CMD" > "$INTEGRATION_OUT" || true

# --- Phase 3: Report (deterministic) ---
node "$SCRIPTS/generate-report.mjs" "$STATE_DIR/contract.json" "$STATE_DIR/progress.json" \
  "$INTEGRATION_OUT" "$STATE_DIR/cost.json" "$STATE_DIR/REPORT.md"

echo ""
echo "Done. Report: $STATE_DIR/REPORT.md"
echo "Worktree: $WORKTREE_DIR (branch $BRANCH_NAME)"
```

- [ ] **Step 2: Write `README.md.tmpl`**

```markdown
# Ralph Loop run

This `.ralph/` folder was scaffolded by the `ralph-loop` skill for spec
`{{SPEC_PATH}}`.

## Run it

```bash
bash .ralph/run.sh
```

This runs **unattended** with `--dangerously-skip-permissions`. It will:
- Refuse to run if the current branch is `main`/`master`, or the working tree is
  dirty.
- Create a dedicated git worktree on branch `{{BRANCH_NAME}}` — all work (including
  every commit) happens there, never in this checkout.
- Spend up to ${{PER_CALL_BUDGET_USD}} per model call and ${{TOTAL_BUDGET_USD}} total
  before aborting.
- Cap each work item at {{MAX_ATTEMPTS_PER_ITEM}} attempts before marking it
  `BLOCKED` and moving on to independent items.

## After it finishes

- Read `<worktree>/.ralph-run/REPORT.md` — Mermaid graph of the item dependency graph
  colored by outcome, a task table, the coverage map, and the frozen contracts.
- Review every commit in the worktree before merging — this workflow never pushes and
  never merges on its own.
- If any item is `BLOCKED`, its `blockReason` in `.ralph-run/progress.json` and the
  judge findings under `.ralph-run/out-*-judge*.json` explain why.

## Known limitation

A defect in an already-committed item that no later item's tests ever exercise is not
caught by this workflow — TDD-based verification is bounded by what each item's
`testStrategy` actually exercises.
```

- [ ] **Step 3: Verify syntax**

Run: `bash -n ~/.claude/skills/ralph-loop/templates/run.sh`
Expected: no output, exit 0 (bash confirms the script parses without running it).

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills
git add ralph-loop/templates/run.sh ralph-loop/templates/README.md.tmpl 2>/dev/null || true
git commit -m "feat(skills): add ralph-loop run.sh orchestrator + README template" 2>/dev/null || echo "note: not a git repo here, files saved to disk regardless"
```

---

### Task 12: End-to-end smoke test against a toy repo

**Files:**
- Create (temporary, outside this repo — throwaway): `/tmp/ralph-smoke/repo/spec.md`,
  `/tmp/ralph-smoke/repo/package.json`

**Interfaces:**
- Consumes: every file from Tasks 1-11 as a whole system — this is the only task that
  actually exercises `run.sh` end-to-end with real `claude -p` calls (Tasks 4-9's unit
  tests cover each script in isolation; nothing so far has run the full Phase 0-3
  pipeline together). Budget ~$2-5 and 5-15 minutes of real API time.

- [ ] **Step 1: Build the toy target repo**

```bash
rm -rf /tmp/ralph-smoke && mkdir -p /tmp/ralph-smoke/repo
cd /tmp/ralph-smoke/repo
git init -q
git config user.email test@example.com
git config user.name Test
cat > package.json <<'EOF'
{
  "name": "ralph-smoke",
  "type": "module",
  "scripts": { "test": "node --test" }
}
EOF
cat > spec.md <<'EOF'
# Tiny math utils

## sum
Add a function `sum(a: number, b: number): number` in `sum.mjs`, exported as
`export function sum(a, b)`. AC-1: sum(2, 3) === 5. AC-2: sum(-1, 1) === 0.

## formatCurrency
Add a function `formatCurrency(amount: number): string` in `format-currency.mjs`,
exported as `export function formatCurrency(amount)`, that returns amount formatted
as "$X.XX" (two decimal places). It must use `sum` from `sum.mjs` to add a $0 rounding
adjustment of 0 (i.e. `sum(amount, 0)`) before formatting, so this item depends on
sum.mjs existing. AC-3: formatCurrency(5) === "$5.00". AC-4: formatCurrency(2.5) === "$2.50".
EOF
git add -A && git commit -q -m "chore: initial toy repo"
```

- [ ] **Step 2: Scaffold `.ralph/` manually (simulating the SKILL.md generation flow)**

```bash
cd /tmp/ralph-smoke/repo
cp -r ~/.claude/skills/ralph-loop/templates .ralph
sed -i.bak \
  -e "s|{{SPEC_PATH}}|/tmp/ralph-smoke/repo/spec.md|g" \
  -e "s|{{BRANCH_NAME}}|ralph/smoke-test|g" \
  -e "s|{{MAX_ATTEMPTS_PER_ITEM}}|5|g" \
  -e "s|{{PER_CALL_BUDGET_USD}}|1|g" \
  -e "s|{{TOTAL_BUDGET_USD}}|5|g" \
  -e "s|{{SETUP_CMD}}||g" \
  -e "s|{{MODEL_LIGHT}}|haiku|g" \
  -e "s|{{MODEL_MEDIUM}}|sonnet|g" \
  -e "s|{{MODEL_STRONG}}|opus|g" \
  -e "s|{{FULL_SUITE_CMD}}|npm test|g" \
  .ralph/run.sh
rm .ralph/run.sh.bak
cp .ralph/README.md.tmpl .ralph/README.md
chmod +x .ralph/run.sh
```

- [ ] **Step 3: Run it for real**

Run: `cd /tmp/ralph-smoke/repo && bash .ralph/run.sh 2>&1 | tee /tmp/ralph-smoke/run.log`

Expected: script runs to completion (exit 0) or reports a specific, legible `ABORT:`
reason. Watch for (and fix in the corresponding Task 3-11 file if seen):
- Any `jq: error` — a `--json-schema` call didn't actually produce the expected
  shape in `.structured_output`; inspect the raw `*-raw.json`/`out-*.json` file.
- Any `node:` stack trace — a bug in one of Tasks 4-9's scripts not caught by their
  unit tests; fix the script and re-run (the script is idempotent — Phase 1 is
  skipped if `contract.json` already exists, Phase 2 is skipped per-item if
  `progress.json` already shows a non-`PENDING` status for it).

- [ ] **Step 4: Verify the outputs**

```bash
cd /tmp/ralph-smoke/repo-ralph-smoke-test/.ralph-run
cat contract.json | node -e "const c = JSON.parse(require('fs').readFileSync(0)); console.log('items:', c.items.map(i => i.id).join(',')); console.log('coverageMap orphans:', c.coverageMap.filter(e => e.coveredBy.length === 0).length);"
cat order.json
cat progress.json
cat REPORT.md
```

Expected:
- `contract.json` has 2 items (ids may differ from "A"/"B" — whatever the Contract
  phase named them), one `dependsOn`-ing the other (formatCurrency depends on sum).
- `coverageMap orphans: 0`.
- `order.json` lists the sum item before the formatCurrency item.
- `progress.json` shows both items `COMPLETED` with a real 40-char `commitSha` (or, if
  a judge legitimately rejected something 5 times, `BLOCKED` with a `blockReason` that
  makes sense when read).
- `REPORT.md` contains a ` ```mermaid ` fenced block with `flowchart TD`, both item
  ids, one `-->` edge, and `class <id> completed;` (or `blocked;`) lines; a task table
  row per item; a coverage map table; and a "Final Integration Pass" section showing
  `PASSED`.
- `git -C /tmp/ralph-smoke/repo-ralph-smoke-test log --oneline` shows one commit per
  completed item, each touching only that item's declared file (`git show
  --stat <sha>` confirms no unexpected files).

- [ ] **Step 5: Record findings and fix any real bugs found**

Any bug found in Step 3/4 is a defect in Tasks 1-11's deliverables, not a new task —
go back to the specific script/prompt/`run.sh` section responsible, fix it, add a unit
test in the relevant Task's test file if the bug was in script logic (Tasks 4-9), and
re-run this smoke test from Step 3 until Step 4's expectations all hold.

- [ ] **Step 6: Clean up the throwaway toy repo**

```bash
git -C /tmp/ralph-smoke/repo worktree remove --force ../repo-ralph-smoke-test 2>/dev/null || true
rm -rf /tmp/ralph-smoke
```

- [ ] **Step 7: Final commit (of any fixes made during Step 5)**

```bash
cd ~/.claude/skills
git add -A ralph-loop/ 2>/dev/null || true
git commit -m "fix(skills): address issues found in ralph-loop end-to-end smoke test" 2>/dev/null || echo "note: nothing to commit, or not a git repo here"
```

