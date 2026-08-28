import { stringify } from "yaml";
import type { WorkflowIR } from "@zcicd/workflow-ir";
import { validateWorkflowIR } from "./validator.js";

export function compileWorkflowYAML(ir: WorkflowIR): string {
  const validation = validateWorkflowIR(ir);
  if (!validation.valid) {
    const errorDetails = validation.errors.map(e => `  - [${e.path}] ${e.message}`).join("\n");
    throw new Error(`WorkflowIR validation failed:\n${errorDetails}`);
  }

  // 1. Build Triggers Object
  const onObj: Record<string, unknown> = {};
  for (const trigger of ir.triggers) {
    if (trigger.event === "workflow_dispatch") {
      onObj.workflow_dispatch = {};
    } else {
      const triggerDetails: Record<string, unknown> = {};
      if (trigger.branches && trigger.branches.length > 0) {
        triggerDetails.branches = trigger.branches;
      }
      if (trigger.paths && trigger.paths.length > 0) {
        triggerDetails.paths = trigger.paths;
      }
      onObj[trigger.event] = Object.keys(triggerDetails).length > 0 ? triggerDetails : null;
    }
  }

  // 2. Build Jobs Object
  const jobsObj: Record<string, unknown> = {};
  for (const job of ir.jobs) {
    const jobDetails: Record<string, unknown> = {
      ...(job.name ? { name: job.name } : {}),
      "runs-on": job.runsOn,
      ...(job.needs && job.needs.length > 0 ? { needs: job.needs } : {}),
      ...(job.permissions ? { permissions: job.permissions } : {}),
      steps: job.steps.map(step => {
        if (step.kind === "uses") {
          return {
            ...(step.name ? { name: step.name } : {}),
            uses: step.uses,
            ...(step.with ? { with: step.with } : {})
          };
        }
        return {
          ...(step.name ? { name: step.name } : {}),
          run: step.run,
          ...(step.env ? { env: step.env } : {}),
          ...(step.workingDirectory ? { "working-directory": step.workingDirectory } : {})
        };
      })
    };

    jobsObj[job.id] = jobDetails;
  }

  // 3. Assemble Document Structure
  const documentObj: Record<string, unknown> = {
    name: ir.name,
    on: onObj,
    ...(ir.permissions ? { permissions: ir.permissions } : {}),
    ...(ir.concurrency ? { concurrency: ir.concurrency } : {}),
    jobs: jobsObj
  };

  return stringify(documentObj, {
    indent: 2,
    lineWidth: 0,
    simpleKeys: true
  });
}
