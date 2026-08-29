import type { WorkflowIR } from "@zcicd/workflow-ir";
import type { ProjectState } from "@zcicd/state";
import type { WorkflowPlan } from "@zcicd/planner";
import type { ResolvedWorkflowPlan } from "@zcicd/resolver";

export type OptimizationOptions = {
  enableCaching?: boolean;
  enableHardening?: boolean;
  enableConcurrency?: boolean;
  enablePathFiltering?: boolean;
  defaultTimeoutMinutes?: number;
  matrixVersions?: {
    node?: string[];
    python?: string[];
    go?: string[];
  };
};

export type CompilerContext = {
  state?: ProjectState;
  plan?: WorkflowPlan;
  resolved?: ResolvedWorkflowPlan;
  options?: OptimizationOptions;
};

export interface CompilerPass {
  readonly name: string;
  readonly description: string;
  transform(ir: WorkflowIR, context: CompilerContext): WorkflowIR;
}
