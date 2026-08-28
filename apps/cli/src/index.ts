#!/usr/bin/env node
import { scanRepository } from "@zcicd/scanner";
import { planWorkflow } from "@zcicd/planner";
import { resolvePlan } from "@zcicd/resolver";
import { buildWorkflowIR, compileWorkflowYAML } from "@zcicd/compiler";
import { withRepository } from "./git.js";
import { printScanResults } from "./formatter.js";

const target = process.argv[2] ?? ".";

try {
  await withRepository(target, async (scanPath) => {
    // 1. Phase 1: Deterministic Scanner
    const state = await scanRepository(scanPath);

    // 2. Phase 2: Capability Model & Policy Rules
    const plan = planWorkflow(state);

    // 3. Phase 3: Starter Workflow Knowledge Resolver
    const resolvedPlan = resolvePlan(plan);

    // 4. Phase 4: Typed Workflow IR & Deterministic Compiler
    const ir = buildWorkflowIR(plan, resolvedPlan);
    const compiledYaml = compileWorkflowYAML(ir);

    // Render results
    printScanResults(target, state, plan, resolvedPlan, ir, compiledYaml);
  });
} catch (error) {
  console.error("\n[Error] Failed to scan, plan, or compile repository:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}