# Zero-Config CI/CD Engine

A deterministic policy compiler that inspects codebases, deduces capabilities, resolves official GitHub Actions patterns from a curated knowledge catalog, compiles type-safe, multi-job CI/CD workflows, and automatically orchestrates security policies and GitHub Pull Requests with zero manual configuration.

---

## 🏛️ Compiler Pipeline

```text
Repository / Remote Git URL
     │
     ▼
┌─────────────────────────┐
│  1. Repository Scanner  │  (File-system crawler + language & framework detectors)
└────────────┬────────────┘
             ▼
       Project State         (Raw facts & filesystem evidence)
             │
             ▼
┌─────────────────────────┐
│  2. Workflow Planner    │  (Policy rules engine: Facts ──► Capabilities)
└────────────┬────────────┘
             ▼
    Workflow Requirements    (Planned Actions)
             │
             ▼
┌─────────────────────────┐
│ 3. Knowledge Resolver   │  (Starter Workflows catalog lookup + Provenance)
└────────────┬────────────┘
             ▼
    Resolved Primitives      (Uses / Run steps with provenance source tags)
             │
             ▼
┌─────────────────────────┐
│  4. Workflow Builder    │  (Partitions steps into parallel jobs & DAG dependencies)
└────────────┬────────────┘
             ▼
      Typed Workflow IR      (Compiler-independent AST)
             │
             ▼
┌─────────────────────────┐
│  5. Optimization Passes │  (Caching, Production Hardening, Job Timeouts, Concurrency)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  6. Security Compiler   │  (Dependabot, Multi-language CodeQL SAST, Native Audits, Trivy)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  7. Reconciliation & PR │  (AST Semantic Diffing + Non-Destructive Merge + 1-Click PR)
└────────────┬────────────┘
             ▼
.github/workflows/ci.yml
.github/workflows/codeql.yml
.github/workflows/security.yml
.github/dependabot.yml
```

---

## 📦 Monorepo Packages

| Package | Role | Description |
| :--- | :--- | :--- |
| **`@zcicd/state`** | Data Contracts | Pure TypeScript interfaces representing discovered project facts and provenance evidence. |
| **`@zcicd/scanner`** | Phase 1 Engine | High-performance filesystem crawler and deterministic detectors for Node, Python, Go, Rust, Docker. |
| **`@zcicd/planner`** | Phase 2 Engine | Capability vocabulary normalizer and declarative rule evaluation engine. |
| **`@zcicd/resolver`** | Phase 3 Engine | Knowledge catalog containing normalized GitHub Starter Workflows with provenance tracking. |
| **`@zcicd/workflow-ir`** | Phase 4 AST | Strongly-typed Workflow Intermediate Representation (Jobs, DAG `needs`, Matrices, Triggers, Steps). |
| **`@zcicd/compiler`** | Phase 4/5 Compiler | Workflow Builder, DAG Cycle Validator, and deterministic YAML emitter with optimization passes. |
| **`@zcicd/security`** | Phase 6 Engine | Security Policy IR & Multi-artifact Security Compiler (Dependabot, CodeQL, Trivy, Audits). |
| **`@zcicd/reconciliation`** | Phase 7 Engine | Semantic AST diffing & non-destructive merging with existing `.github/workflows`. |
| **`@zcicd/github`** | Phase 7 Automation | Native Git branch management and GitHub Pull Request automation. |
| **`@zcicd/cli`** | Developer CLI | Terminal runner with interactive live progress (Wizard v2), minimalist mode (v1), and `--inspect`. |

---

## 🚀 Quick Start

### 1. Interactive CLI Wizard
Run the interactive wizard (defaults to Wizard v2 with live multi-phase visual feedback):
```bash
pnpm --filter @zcicd/cli dev          # Wizard v2 (Live compiler pipeline + Unified Git Delivery)
pnpm --filter @zcicd/cli dev --v1     # Wizard v1 (Minimalist fast flow)
```

### 2. Non-Interactive Inspection & Scripting
Print the AST, DAG structure, and compiled YAML to stdout:
```bash
pnpm --filter @zcicd/cli dev --inspect "../path-to-project"
pnpm --filter @zcicd/cli dev --inspect "https://github.com/expressjs/express"
```

### 3. Build & Test Monorepo
```bash
pnpm install
pnpm -r build
pnpm -r test
```

---

## 💡 Core Invariants

1. **Deterministic Policy over AI Guessing:** Workflow requirements are generated through strict, provenance-backed rule evaluation.
2. **Compiler-Independent Workflow IR:** The intermediate representation (`WorkflowIR`) is a first-class, inspectable AST completely decoupled from YAML serialization. Even if the YAML compiler is deleted, the Planner + Resolver still produce a full workflow model.
3. **Failure Domain Isolation:** Polyglot projects (e.g. Node + Python + Docker) are automatically partitioned into isolated, concurrent jobs with proper DAG dependencies.
4. **Monorepo & Polyglot Path Awareness:** Discovers nested package manifests (`package-lock.json`, `requirements.txt`, `Cargo.toml`, `go.mod`), injects recursive path caching (`cache-dependency-path`), and handles projects with or without root configurations.
5. **Non-Destructive Reconciliation:** When existing workflows contain custom deployment or notification steps, the AST diff engine preserves them during upgrades.
6. **Provenance Tracking:** Every resolved step preserves its origin (e.g. `source: actions/starter-workflows:ci/node.js.yml`).

---

## 🛡️ Security Policies Matrix (Phase 6)

| Feature | Minimal | Standard (Recommended) | Strict |
| :--- | :---: | :---: | :---: |
| **Dependabot Updates** | Weekly | Weekly (All sub-ecosystems) | Daily |
| **CodeQL SAST Scanning** | — | JS/TS, Python, Go Matrix | JS/TS, Python, Go Matrix |
| **Native Dependency Audits** | `npm audit`, `pip-audit`, `cargo-audit`, `govulncheck` (non-blocking) | `npm audit`, `pip-audit`, `cargo-audit`, `govulncheck` (report mode) | Zero-Tolerance Gating (Blocks on CVEs) |
| **Container Scanning** | — | Trivy Image Scanning (High/Critical) | Trivy + SARIF Upload to GitHub Security |
| **Runner Hardening** | — | — | StepSecurity `harden-runner` |
| **Secret Scanning** | — | — | Gitleaks Action |

---

## 🗺️ Roadmap & Phase Plan

- [x] **Phase 0:** Engine Foundation (pnpm workspace, TS base configs, Vitest, package boundaries)
- [x] **Phase 1:** Deterministic Repository Scanner (Node, Python, Go, Rust, Docker detectors, Snapshot tests)
- [x] **Phase 2:** Capability Model + Policy Rules Engine (Capabilities normalization, Action deduplication)
- [x] **Phase 3 & 3B:** Starter Workflow Knowledge Catalog & Resolver (Ingestion of `actions/starter-workflows`, Provenance tracking)
- [x] **Phase 4:** Typed Workflow IR & Deterministic Compiler (Job partitioning, DAG cycle validation, YAML emitter)
- [x] **Phase 5:** Optimization Passes (Dependency Caching, Job Timeouts, Concurrency Cancellation, Matrix Testing)
- [x] **Phase 6:** Security Policy Compiler (Dependabot, CodeQL, Container scanning, Policy levels)
- [x] **Phase 7:** Workflow Reconciliation + Automated GitHub PRs (Semantic AST diffing & 1-click PR links)
- [ ] **Phase 8:** Webhooks & Continuous Adaptation
- [ ] **Phase 9:** CI Observability (P50/P95 durations, failure rates, cache hit telemetry)
- [ ] **Phase 10:** Data-Driven Optimization

---

## 🛠️ Complete Guide: Adding a New Starter Workflow / Language

Here is the complete step-by-step guide to adding support for any starter workflow from GitHub's [`actions/starter-workflows`](https://github.com/actions/starter-workflows/tree/main). 

Let's use **Rust (`ci/rust.yml`)** as an end-to-end example across all compiler layers.

---

### Step 1: Declare the Types in `@zcicd/state`
* **File:** `packages/state/src/index.ts`
* Add `"rust"` to `Runtime` and `"cargo"` to `PackageManager`:
```ts
export type Runtime = {
  name: "node" | "python" | "go" | "rust"; // <── Add "rust"
  version?: string;
  evidence: Evidence[];
};
```

---

### Step 2: Create the Detector in `@zcicd/scanner`
* **File:** `packages/scanner/src/detectors/rust.ts`
```ts
import type { Detector, RepositoryContext } from "../detector.js";
import type { ProjectState } from "@zcicd/state";

export const rustDetector: Detector = {
  name: "rust",

  async detect(context: RepositoryContext, state: ProjectState): Promise<void> {
    // 1. Find all Cargo.toml files in the repo
    const cargoFiles = context.findFiles(f => f.endsWith("Cargo.toml"));

    for (const file of cargoFiles) {
      state.runtime.push({
        name: "rust",
        evidence: [{ source: file, value: "Cargo project detected" }]
      });
    }

    // 2. Check for Cargo.lock
    if (context.findFiles(f => f.endsWith("Cargo.lock")).length > 0) {
      state.packageManager.push({
        name: "cargo",
        evidence: [{ source: "Cargo.lock", value: "lockfile detected" }]
      });
    }
  }
};
```
* **Register it:** In `packages/scanner/src/index.ts`, add `rustDetector` to the `detectors` array.

---

### Step 3: Define Capabilities & Rules in `@zcicd/planner`

1. **Add Capability IDs & Action Types in `packages/planner/src/types.ts`:**
```ts
export type CapabilityId = 
  | "runtime.node"
  | "runtime.rust"     // <── Add capability
  | ...;

export type ActionType = 
  | "rust.build"       // <── Add action types
  | "rust.test"
  | ...;
```

2. **Create the Rule in `packages/planner/src/rules/rust.ts`:**
```ts
import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const rustBuildRule: Rule = {
  id: "rust-ci",
  description: "Build and test Rust applications.",

  evaluate(_state, capabilities) {
    const capability = findCapability(capabilities, "runtime.rust");
    if (!capability) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "rust-build",
          type: "rust.build",
          reason: "Rust / Cargo detected.",
          sourceRule: "rust-ci"
        },
        {
          id: "rust-test",
          type: "rust.test",
          reason: "Rust / Cargo detected.",
          sourceRule: "rust-ci"
        }
      ],
      reasons: ["Rust project detected.", ...formatEvidence(capability)]
    };
  }
};
```
* **Register it:** In `packages/planner/src/planner.ts`, add `rustBuildRule` to the `rules` array.

---

### Step 4: Register in the Starter Workflows Catalog & Resolver (`@zcicd/resolver`)

1. **Add to Catalog (`packages/resolver/src/catalog/starter-workflows.ts`):**
```ts
"ci/rust.yml": {
  id: "ci/rust.yml",
  name: "Rust CI",
  description: "Build and test a Rust project with Cargo.",
  sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/rust.yml",
  languages: ["rust"],
  triggers: ["push", "pull_request"],
  steps: [
    { id: "cargo-build", category: "build", kind: "run", run: "cargo build --verbose" },
    { id: "cargo-test", category: "test", kind: "run", run: "cargo test --verbose" }
  ]
}
```

2. **Add Resolver Functions & Provenance (`packages/resolver/src/resolvers/runtime.ts` & `registry.ts`):**
```ts
export function resolveRustBuild(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["ci/rust.yml"];
  const buildStep = template.steps.find(s => s.id === "cargo-build");
  return [
    {
      kind: "run",
      run: buildStep?.run ?? "cargo build --verbose",
      reason: "Compile Rust crates according to starter workflow.",
      source: `actions/starter-workflows:${template.id}`,
      actionId: action.id
    }
  ];
}
```

---

### Step 5: Update the Workflow Builder (`@zcicd/compiler`)
* In `packages/compiler/src/builder.ts`, route `cargo`/`rust` steps into a dedicated parallel job:
```ts
if (rustSteps.length > 0) {
  const id = "test-rust";
  testJobIds.push(id);
  jobs.push({
    id,
    name: "Rust CI",
    runsOn: runner,
    steps: [CHECKOUT_STEP, ...rustSteps]
  });
}
```

---

### Step 6: Build & Test End-to-End!
1. Rebuild and run unit tests:
```bash
pnpm -r build
pnpm -r test
```
2. Test against any live Rust repository:
```bash
pnpm --filter @zcicd/cli dev "https://github.com/BurntSushi/ripgrep"
```

The CLI will scan the repo, match `runtime.rust`, resolve `cargo build`/`cargo test` from `ci/rust.yml`, assemble the `test-rust` job in `WorkflowIR`, and output valid GitHub Actions YAML!