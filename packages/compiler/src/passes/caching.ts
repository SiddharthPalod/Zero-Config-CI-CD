import type { CompilerPass, CompilerContext } from "./types.js";
import type { WorkflowIR, WorkflowStep } from "@zcicd/workflow-ir";

export const dependencyCachingPass: CompilerPass = {
  name: "dependency-caching",
  description: "Injects native GitHub Actions dependency caching keys for Node, Python, Go, and Rust.",

  transform(ir: WorkflowIR, context: CompilerContext): WorkflowIR {
    if (context.options?.enableCaching === false) {
      return ir;
    }

    const packageManagers = context.state?.packageManager.map(p => p.name) ?? [];
    const isPnpm = packageManagers.includes("pnpm");
    const isYarn = packageManagers.includes("yarn");
    const isBun = packageManagers.includes("bun");
    const nodeCache = isPnpm ? "pnpm" : isYarn ? "yarn" : isBun ? "bun" : "npm";

    const updatedJobs = ir.jobs.map(job => {
      // 1. Rust / Cargo Caching via actions/cache@v4
      if (job.id === "test-rust" || job.name?.toLowerCase().includes("rust")) {
        const hasCheckout = job.steps.some(s => s.kind === "uses" && s.uses.startsWith("actions/checkout"));
        const hasCargoCache = job.steps.some(s => s.kind === "uses" && s.uses.startsWith("actions/cache"));

        if (!hasCargoCache) {
          const cacheStep: WorkflowStep = {
            kind: "uses",
            name: "Cache Rust Dependencies",
            uses: "actions/cache@v4",
            with: {
              path: "~/.cargo/registry\n~/.cargo/git\ntarget",
              key: "${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}",
              "restore-keys": "${{ runner.os }}-cargo-"
            },
            source: "actions/cache@v4"
          };

          const newSteps = [...job.steps];
          if (hasCheckout) {
            // Insert after checkout (index 1)
            newSteps.splice(1, 0, cacheStep);
          } else {
            newSteps.unshift(cacheStep);
          }

          return {
            ...job,
            steps: newSteps
          };
        }
      }

      // 2. Node, Python, and Go inline setup caching
      const updatedSteps = job.steps.map(step => {
        if (step.kind !== "uses") return step;

        // Node.js setup caching
        if (step.uses.startsWith("actions/setup-node")) {
          return {
            ...step,
            with: {
              ...step.with,
              cache: nodeCache
            }
          };
        }

        // Python setup caching
        if (step.uses.startsWith("actions/setup-python")) {
          return {
            ...step,
            with: {
              ...step.with,
              cache: "pip"
            }
          };
        }

        // Go setup caching
        if (step.uses.startsWith("actions/setup-go")) {
          return {
            ...step,
            with: {
              ...step.with,
              cache: true
            }
          };
        }

        return step;
      });

      return {
        ...job,
        steps: updatedSteps
      };
    });

    return {
      ...ir,
      jobs: updatedJobs
    };
  }
};
