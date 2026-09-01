# Ralph Loop run

This `.ralph/` folder was scaffolded by the `ralph-loop` skill for:
`"/tmp/ralph-smoke/repo/spec.md"`.

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
