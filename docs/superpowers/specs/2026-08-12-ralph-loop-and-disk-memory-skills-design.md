# Ralph Loop + Disk Memory Skills — Design Spec

Date: 2026-08-12

## Goal

Create two global Claude Code skills (`~/.claude/skills/`, usable in any project):

1. **`disk-memory`** — a reusable convention + discipline for agents that run as a
   sequence of *stateless* invocations (fresh process/context each time) to keep
   continuity via a `memory/` folder on disk instead of conversation history.
2. **`ralph-loop`** — a generator skill that, given a spec file, scaffolds an
   autonomous, unattended workflow in the target repo that decomposes the spec into
   a dependency graph of small work items (Graph Engineering), then drives each item
   through a TDD ralph loop with a judge (Ralph Loop technique), governed by explicit
   loop guardrails (Loop Engineering), until every reachable item is done or blocked,
   producing a final report with a Mermaid diagram of the graph.

This design follows `/Users/lucasmansoldo/Projects/babyclothes/k.html` ("Guia de Loop
Engineering, Ralph Loop e Graph Engineering"), which is the normative reference for
terminology and the three pillars. Section numbers below (e.g. "guide §2.6") refer to
that document.

## Relationship between the two skills

`disk-memory` is the persistence engine `ralph-loop` uses internally (guide §1.4: state
persisted outside the model, reloaded fresh each iteration). It is also usable
standalone for any other iterative, context-cleared workflow. It is explicitly
**different** from Claude Code's own cross-conversation user-memory system
(`~/.claude/projects/.../memory/`, used for the assistant's durable relationship with
a user across unrelated conversations) — `disk-memory` is scoped to a single ongoing
task's working state across repeated, context-free execution cycles. The `disk-memory`
SKILL.md must state this distinction explicitly so it isn't confused with the
personal memory system.

`ralph-loop`'s core executable insight (per the user's own clarifying question) is
this: the classic Ralph technique — same agent, same task, repeat until a judge
approves, fresh context each attempt — is **preserved intact** as the per-item engine.
Graph Engineering does not replace it; it decides *what* items exist and *what order*
to run the ralph loop over them (guide §3.6: "sem o grafo, o loop não saberia a ordem
segura; sem o loop, o grafo seria só um plano estático"). The skill name stays
`ralph-loop` (user's decision) even though it also performs graph decomposition.

## Verified CLI mechanics (tested empirically against the installed `claude` CLI)

- `claude -p "<prompt>" --output-format json` → prints one JSON object; `.result` is
  the plain-text answer, `.total_cost_usd` and `.usage` give cost/token accounting,
  `.is_error` / `.subtype` give success/failure.
- `claude -p "<prompt>" --output-format json --json-schema '<JSON Schema>'` → the same
  envelope additionally contains `.structured_output`, an object conforming exactly to
  the given schema. **This is used instead of parsing free text or magic strings** for
  every machine-read output in this design (Contract phase graph, judge verdicts).
- `--dangerously-skip-permissions` — bypasses all permission prompts (required for
  unattended runs).
- `--allowedTools <list>` / `--disallowedTools <list>` — restricts tool access for a
  single headless call. The judge is invoked with `--allowedTools "Read,Grep,Glob,Bash"`
  (no `Edit`/`Write`) so it is structurally unable to modify files, not just
  instructed not to.
- `--max-budget-usd <amount>` — hard per-call spend cap (only with `--print`).
- `--model <alias-or-name>` — selects the model for that call (e.g. `haiku`, `sonnet`,
  `opus`).
- `--add-dir <dirs>` — not needed here (single target directory per run).

## Skill 1: `disk-memory`

### Folder schema

Created at a caller-specified path (for `ralph-loop`, this is `.ralph/memory/`; for
standalone use, any `<workdir>/memory/`):

```
memory/
├── state.md    # single current snapshot: objective, checklist ([x]/[ ]), what's
│                 done, what's next, open blockers. OVERWRITTEN each cycle — the one
│                 file a fresh cycle MUST read first.
├── log.md       # append-only chronological journal: one entry per cycle
│                 (timestamp, what was attempted, outcome, files touched). Never
│                 edited, only appended.
├── decisions.md  # append-only record of non-obvious choices/assumptions, so a later
│                   cycle doesn't re-litigate or contradict them. Also where
│                   `ralph-loop`'s guarded scope-expansion fixes (see Phase 2) are
│                   logged.
└── cycles/         # raw stdout/log per cycle, for debugging. Optional but always
                       created by ralph-loop.
```

### Discipline (the skill's actual content)

1. **Start of any cycle** (first action, before touching the task): if `memory/`
   doesn't exist, create it with empty templates. Otherwise read `state.md` in full,
   then the last ~20 lines of `log.md`, then all of `decisions.md`. This reconstructs
   "where was I" with zero conversation history.
2. **Work** using that reconstructed context.
3. **End of cycle** (mandatory, even if the cycle failed or was cut short): rewrite
   `state.md` to the new true state (snapshot, not append); append one entry to
   `log.md`; append to `decisions.md` if a non-obvious call was made.
4. This skill does not itself "clear" any window — the caller (e.g. `ralph-loop`'s
   `run.sh`, spawning a fresh `claude -p` process per cycle) guarantees that. The
   skill defines what must survive the clear and how.

### Standalone usage

Invocable directly ("use disk-memory to track progress on X across sessions") for any
manual or automated iterative workflow, independent of `ralph-loop`.

## Skill 2: `ralph-loop`

### Generation-time inputs (asked when the skill is invoked)

| Input | Default |
|---|---|
| Spec file path | required |
| Target repo directory | cwd |
| Worktree branch name | `ralph/<slug-of-spec-filename>` |
| Max attempts per item | 5 |
| Per-call budget cap | `--max-budget-usd 2` |
| Total run budget cap | `--max-total-budget-usd 20` (script-enforced by summing `total_cost_usd` across all calls) |
| Optional setup command | none (e.g. `yarn install`, `mix deps.get`) |
| Model tiers | light=`haiku`, medium=`sonnet`, strong=`opus` |
| Full-suite command(s) | asked explicitly (e.g. `yarn test && yarn check`) — used by the judge and the final integration pass |

### Preflight checks (abort scaffolding if any fails)

- Target directory is inside a git repository.
- A full-suite command was provided (the judge cannot run "the tests" generically —
  guide anti-pattern E requires the judge to actually execute verification, so this
  must be known up front).

### Scaffolded layout (`.ralph/` in the target repo)

```
.ralph/
├── README.md                    # what this is, how to run it, safety notes
├── spec.md                       # copy of the input spec
├── contract.json                  # Phase 1 output — IMMUTABLE once written
├── order.json                      # Phase 1 toposort output (ids in execution order)
├── progress.json                     # Phase 2 mutable runtime state per item
├── REPORT.md                           # Phase 3 output (not present until the run finishes)
├── memory/                               # disk-memory folder (state.md/log.md/decisions.md/cycles/)
├── prompts/                               # prompt TEMPLATES (placeholders filled per item)
│   ├── contract-prompt.md
│   ├── worker-red-prompt.md
│   ├── judge-review-tests-prompt.md
│   ├── worker-green-prompt.md
│   └── judge-final-review-prompt.md
├── schemas/
│   ├── contract.schema.json
│   └── judge-verdict.schema.json
├── scripts/                               # deterministic, dependency-free (Node — same
│   │                                        runtime the `claude` CLI itself requires)
│   ├── toposort.mjs                        # Kahn's algorithm + cycle detection
│   ├── validate-coverage.mjs                # coverageMap → orphan requirement check
│   ├── render-prompt.mjs                     # template + item JSON + memory → final prompt string
│   ├── commit-item.mjs                        # deterministic Phase 2 step E
│   ├── run-full-suite.mjs                      # wraps the user-provided full-suite command(s)
│   └── generate-report.mjs                      # Phase 3: contract.json + progress.json → REPORT.md
└── run.sh                                          # orchestrator entrypoint
```

`run.sh` is what the user actually executes (`bash .ralph/run.sh`); the skill's job is
to scaffold and print that command, never to launch it itself (launching an unattended,
permission-skipping process is a deliberate action the user must trigger).

### Phase 0 — Setup (deterministic, no LLM call)

1. `git worktree add` a new worktree on the configured branch (guide §2.6: worktree
   gives physical isolation; never branches from `main`/`master` — abort if the
   target repo's current branch IS `main`/`master` and no override branch name was
   given). Refuses to proceed if the working tree is dirty.
2. Copy `.env`/`.env.*` into the worktree if present in the source repo.
3. Run the optional setup command inside the worktree, if provided.
4. Copy the spec to `.ralph/spec.md`; initialize `.ralph/memory/` with empty
   templates; write the first `state.md` snapshot ("Phase 0 complete, entering
   Contract phase").

### Phase 1 — Contract (Graph Engineering, strong model)

**One `claude -p` call**, `--model <strong>`, `--json-schema` = `contract.schema.json`:

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

The prompt (`contract-prompt.md`) instructs the model to: read `.ralph/spec.md` in
full; read the target repo's own convention docs if present (`CLAUDE.md`, `AGENTS.md`,
`RULES.md`, `.claude/rules/*.md` or equivalent) and cite relevant lines into each
item's `projectRules[]`; extract every interface/type/prop/signature **verbatim** —
never rename, reshape, widen, or narrow what the spec declared (guide anti-pattern P);
slice the work into items small enough for one commit each (guide §3.4); assign each
item `model: "light"` (mechanical: types/enums/consts/style extraction/dead-code
removal) or `"medium"` (logic/hooks/containers/real test assertions) — **never**
`"strong"`, which is reserved for the judge (guide §2.5); declare every real
`dependsOn` edge, including write-conflict edges (two items touching the same lines),
not just existence edges (guide §8.2–8.3); and produce a `coverageMap` where every
requirement/AC/DoD line in the spec maps to ≥1 item id.

Output is written to `.ralph/contract.json` and never modified again after this phase.

**Deterministic validation (`scripts/`, no LLM):**

- `validate-coverage.mjs` — every requirement in `coverageMap` has a non-empty
  `coveredBy`. Any empty entry → **abort Phase 1**, print the orphaned requirement(s),
  write `.ralph/CONTRACT-FAILED.md` explaining exactly what's uncovered, exit
  nonzero. (Guide anti-pattern O.)
- `toposort.mjs` — Kahn's algorithm over `items[].dependsOn`. On success, writes
  `.ralph/order.json` (item ids in execution order). **On a cycle**: per the
  confirmed decision, **abort and require human review** — do not auto-break. Print
  the exact cycle (e.g. `A → B → C → A`), write `.ralph/CONTRACT-FAILED.md` with the
  cycle highlighted, exit nonzero. The run does not proceed to Phase 2 until the
  contract is fixed (edit `contract.json` by hand, or re-run Phase 1 with a revised
  spec) and toposort is re-run successfully.

### Phase 2 — Implement (the ralph loop, per item, sequential, in `order.json` order)

No fan-out (guide §1.3/§8.3: write-conflict edges make parallelism unsafe here).

**Item status state machine:** `PENDING → COMPLETED` (via step E) or `PENDING →
BLOCKED` (max attempts exceeded) or `PENDING → SKIPPED` (any entry in `dependsOn` is
`BLOCKED` or `SKIPPED` — checked once, when the script reaches that item in
`order.json`'s order; because the order already respects dependencies, a single
left-to-right pass is sufficient — no re-traversal of the graph is needed). This is
exactly the confirmed "skip to independent items and continue" behavior: an item is
only skipped if a real dependency of it failed; items with no path back to a blocked
item are attempted normally.

Per non-skipped item, the 5-step cycle, with `attempt` starting at 1 and incrementing
on every REJECT from step B or D (both judge steps use `judge-verdict.schema.json`,
below), capped at `--max-attempts-per-item`:

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

| Step | Agent | Model | Tools | Does |
|---|---|---|---|---|
| A. Red | dev | item's `model` (light/medium) | full | Reads `disk-memory` state + `contract.json`'s entry for this item. Writes ONLY tests for `objective`/`acceptanceCriteria`, using `specs.*` verbatim. Runs them; must observe failure (red). If green on first run, rewrites (self-correcting loop, bounded to a few tries before letting B catch it as a violation). |
| B. Review tests | judge | strong | `Read,Grep,Glob,Bash` only (no Edit/Write) | Runs the **full** project suite (not just the new tests) via `run-full-suite.mjs` — never approves from reading alone (guide anti-pattern E). Checks: tests cover objective+AC? Contracts used verbatim (no reshape)? `projectRules[]` followed? Red genuinely observed? `verdict: REJECT` with `findings[]` (file:line) sends it back to A with `attempt++`. |
| C. Green | dev | item's `model` | full | Makes tests pass; runs lint/style/autofix until clean. Does NOT commit. **Guarded scope-expansion escape hatch**: if a real fix belongs in a file outside this item's `files[]` (a regression in an earlier, already-committed item — see "Cross-item regression handling" below), the dev agent may touch it, but MUST append a `decisions.md` entry explaining why, and MUST NOT silently expand `files[]` in `contract.json` (which stays immutable). |
| D. Final review | judge | strong | `Read,Grep,Glob,Bash` only | Runs the full suite again. Checks: requirement satisfied? Contracts still verbatim? `projectRules[]` (with file:line on violations)? Scope creep — any file touched outside `files[]`? If yes, is it flagged in `decisions.md` as a justified regression fix (`scopeExpansionJustified: true`) or unexplained scope creep (`false` → REJECT, guide anti-pattern K)? `verdict: REJECT` sends it back to **C** (not A) with `attempt++`. |
| E. Commit | script (`commit-item.mjs`) | — (deterministic, no LLM call) | — | `git add` **exactly** `files[]` from `contract.json` for this item, plus any additional files logged as justified regression fixes in `decisions.md` for this attempt — never `git add -A`/`.`. Commit message built from `id`/`title`/`objective`. **If the commit hook fails**: never `--no-verify`, never `--amend` — surface the hook's stderr as feedback and loop back to **C** with `attempt++` (a fresh commit is attempted next time, per guide §2.6). On success: item → `COMPLETED`, record commit SHA in `progress.json`. |

If `attempt` exceeds `--max-attempts-per-item` at any B/D rejection: item → `BLOCKED`,
record the last rejection's `findings[]` as the block reason in `progress.json`, move
to the next item in `order.json` (its dependents will be `SKIPPED` per the state
machine above).

**Cross-item regression handling** (addresses: "does this allow returning to a task
with undetected failures?"): there is **no reopening of `COMPLETED` items** — once
committed, an item is not re-attempted automatically. What this design *does* do to
catch most such regressions without full reopening:
1. Steps B and D always run the **entire** accumulated test suite, not just the
   current item's tests — if item C's work genuinely depends on B's behavior and B was
   subtly wrong, C's own red/green work and the full-suite run are likely to expose it
   as a C-review rejection, not a silent pass.
2. The guarded scope-expansion escape hatch (step C/D above) lets the *current* item
   patch a real bug in an earlier item's file, with the fix visible in `decisions.md`
   and the diff, gated by judge approval — this is how a genuine "B was wrong" case
   gets fixed, attributed to the item that discovered it, without cascading a
   re-run of B's own cycle.
3. **Known, explicit limitation** (not solved by this design, and not claimed to be):
   a defect in a completed item that no later item's tests ever exercise remains
   undetected. This is a property of TDD-based verification in general — coverage is
   bounded by what `testStrategy` actually exercises — not something loop or graph
   mechanics can fix. `README.md` and the skill's SKILL.md must state this plainly.

### Phase 2.5 — Final integration pass (deterministic, no LLM call)

After the single pass over `order.json` completes (whether or not every item reached
`COMPLETED`), run the full suite one more time via `run-full-suite.mjs` against the
worktree's final state. Result (pass/fail + output) is recorded and surfaced
prominently in the report as a "post-hoc regression check" — this is cheap (existing
tests, no new LLM call) and catches integration-order issues that individual item
reviews might miss.

### Phase 3 — Report (deterministic, no LLM call)

`generate-report.mjs` reads `contract.json` + `progress.json` (+ the Phase 2.5 result)
and writes `.ralph/REPORT.md`:

1. **Summary** — N/M items `COMPLETED`, counts of `BLOCKED`/`SKIPPED`, run duration,
   cumulative `total_cost_usd` across every `claude -p` call made.
2. **Mermaid graph** — one `flowchart TD` block: a node per item (`id["title"]`), an
   edge per `dependsOn`, and a `classDef`/`class` assignment coloring by final status
   (`COMPLETED` green, `BLOCKED` red, `SKIPPED` gray) — mirrors the style used in the
   reference guide itself (its §8.6 cycle-detection diagram). If Phase 1 had aborted
   on a cycle and was subsequently fixed by hand before this run, that's out of scope
   for this report (the report only covers the run that actually executed).
3. **Task table** — one row per item: id, title, status, attempts used, commit SHA
   (if any), `files[]`, `dependsOn`.
4. **Coverage map** — requirement → covering item id(s), copied from `contract.json`
   (so the report re-confirms nothing was dropped).
5. **Frozen contracts appendix** — each item's `specs.interfaces/types/props/
   signatures`, verbatim, so the user can diff against their original spec.
6. **Final integration pass result** (Phase 2.5) — pass/fail, with output on failure,
   clearly separated from the per-item results above it.

### Guardrails (all enforced by `run.sh`/scripts, not by prompt discipline alone where a
   structural enforcement is possible)

- Never operates on `main`/`master` — checked in Phase 0, hard abort otherwise.
- Physical isolation via `git worktree`, not just a branch checkout.
- `--dangerously-skip-permissions` is required for unattended operation, but only
  after the preflight checks (git repo, not main/master, clean tree) pass.
- Per-call (`--max-budget-usd`) and per-run (`--max-total-budget-usd`, script-summed)
  spend caps.
- `--max-attempts-per-item` bounds worst-case spend per item; the graph's finite item
  count bounds the worst case for the whole run (no separate "max cycles" needed on
  top of per-item caps, since Phase 2 makes exactly one pass over `order.json`).
- Judge tool access structurally restricted to `Read,Grep,Glob,Bash` (`--allowedTools`)
  — cannot edit files even if instructed to by a prompt injection in the spec/code it
  read.
- Commit hooks are never bypassed; commits are never amended; the script never runs
  `git push` or changes any state outside the worktree it created.
- `git add` is always an explicit file list from `contract.json`, never `-A`/`.`.

## File layout for the skills themselves

```
~/.claude/skills/
  disk-memory/
    SKILL.md
  ralph-loop/
    SKILL.md
    templates/                  # the .ralph/ scaffold templates copied into target repos
      README.md.tmpl
      run.sh.tmpl
      prompts/
        contract-prompt.md
        worker-red-prompt.md
        judge-review-tests-prompt.md
        worker-green-prompt.md
        judge-final-review-prompt.md
      schemas/
        contract.schema.json
        judge-verdict.schema.json
      scripts/
        toposort.mjs
        validate-coverage.mjs
        render-prompt.mjs
        commit-item.mjs
        run-full-suite.mjs
        generate-report.mjs
```

`ralph-loop`'s SKILL.md instructs: ask the generation-time inputs, run the preflight
checks, then copy `templates/` into `<target-repo>/.ralph/`, substituting the
generation-time inputs (branch name, budgets, model tiers, full-suite command,
spec path) into `run.sh` and the README, and finally print the exact
`bash .ralph/run.sh` command for the user to run themselves.

## Skill authoring process (per the writing-skills skill)

Both skills must be authored via the RED-GREEN-REFACTOR skill-writing cycle:

- **`disk-memory`** is a discipline-enforcing skill (an agent must reliably read
  `state.md` first and rewrite it last, even under time/attempt pressure). Baseline
  (RED): run a pressure scenario with a subagent given a populated `memory/` folder
  and a task, but no `disk-memory` skill, and see whether it reads prior state before
  acting and updates it before finishing. Write the skill to close whatever gaps
  appear (GREEN), then re-test (REFACTOR) until compliant under pressure (e.g. "you
  only have one tool call left" time pressure).
- **`ralph-loop`** is primarily a Technique/generator skill; its real correctness test
  is end-to-end: scaffold it against a tiny throwaway repo + a trivial 2-3 item spec
  (e.g. "add a `sum` and a `formatCurrency` util, `formatCurrency` depends on `sum`"),
  run `.ralph/run.sh` for real, and confirm: Phase 1 produces a valid graph with full
  coverage, Phase 2 completes both items with real commits, Phase 2.5 passes, and
  `REPORT.md` renders a correct Mermaid graph and task table. This is an application
  scenario test per the writing-skills "Technique Skills" testing guidance, not a
  pressure scenario.

## Out of scope

- Parallel/fan-out execution of independent graph branches (guide §8.5 notes this is
  possible when the graph has no write-conflict edges; this design deliberately keeps
  Phase 2 sequential for v1 — YAGNI, and it's the guide's own default).
- Re-opening `COMPLETED` items automatically when a later item's judge suspects a
  regression (see "Cross-item regression handling" — the guarded scope-expansion
  escape hatch is the v1 answer; automatic re-queueing of upstream items is a possible
  future enhancement, not built now).
- Any mechanism beyond the stated coverage/testStrategy for catching defects no test
  ever exercises — explicitly a known limitation, not solved here.
- Editing the two builder/reviewer agents already added to this repo's
  `.claude/agents/` (`frontend-builder`, `backend-builder`, `quality-reviewer`,
  `backend-reviewer`) — `ralph-loop` is a separate, general-purpose, project-agnostic
  mechanism; it does not read or depend on this repo's `.claude/agents/` or
  `.claude/rules/`.
