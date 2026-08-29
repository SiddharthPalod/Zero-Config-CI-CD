import type { WorkflowPlan } from "@zcicd/planner";
import type { ResolvedWorkflowPlan, ResolvedPrimitive } from "@zcicd/resolver";
import type { WorkflowIR, WorkflowJob, WorkflowStep } from "@zcicd/workflow-ir";

export type BuilderOptions = {
  workflowName?: string;
  defaultRunner?: string;
  defaultBranches?: string[];
};

function toWorkflowStep(primitive: ResolvedPrimitive): WorkflowStep {
  if (primitive.kind === "uses") {
    return {
      kind: "uses",
      uses: primitive.uses,
      with: primitive.with,
      source: primitive.source
    };
  }

  return {
    kind: "run",
    run: primitive.run,
    source: primitive.source
  };
}

const CHECKOUT_STEP: WorkflowStep = {
  kind: "uses",
  uses: "actions/checkout@v4",
  source: "actions/checkout@v4"
};

export function buildWorkflowIR(
  plan: WorkflowPlan,
  resolved: ResolvedWorkflowPlan,
  options: BuilderOptions = {}
): WorkflowIR {
  const runner = options.defaultRunner ?? "ubuntu-latest";
  const branches = options.defaultBranches ?? ["main"];
  const workflowName = options.workflowName ?? "CI";

  // Bucket resolved primitives into target job domains
  const nodeSteps: WorkflowStep[] = [];
  const pythonSteps: WorkflowStep[] = [];
  const goSteps: WorkflowStep[] = [];
  const rustSteps: WorkflowStep[] = [];
  const dockerSteps: WorkflowStep[] = [];
  const generalSteps: WorkflowStep[] = [];

  for (const primitive of resolved.primitives) {
    const step = toWorkflowStep(primitive);
    const uses = primitive.kind === "uses" ? primitive.uses : "";
    const run = primitive.kind === "run" ? primitive.run : "";
    const source = primitive.source ?? "";

    if (
      uses.includes("setup-node") ||
      uses.includes("pnpm") ||
      source.includes("node") ||
      run.startsWith("npm") ||
      run.startsWith("yarn") ||
      run.startsWith("pnpm") ||
      run.includes("vitest") ||
      run.includes("jest") ||
      run.includes("playwright")
    ) {
      nodeSteps.push(step);
    } else if (
      uses.includes("setup-python") ||
      source.includes("python") ||
      run.startsWith("pytest") ||
      run.startsWith("pip")
    ) {
      pythonSteps.push(step);
    } else if (
      source.includes("rust") ||
      run.startsWith("cargo") ||
      run.includes("cargo ")
    ) {
      rustSteps.push(step);
    } else if (
      uses.includes("setup-go") ||
      source.includes("go.yml") ||
      run.startsWith("go ") ||
      run.startsWith("go\t")
    ) {
      goSteps.push(step);
    } else if (uses.includes("docker") || source.includes("docker")) {
      dockerSteps.push(step);
    } else {
      generalSteps.push(step);
    }
  }

  const jobs: WorkflowJob[] = [];
  const testJobIds: string[] = [];

  if (nodeSteps.length > 0) {
    const id = "test-node";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Node.js CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...nodeSteps]
    });
  }

  if (pythonSteps.length > 0) {
    const id = "test-python";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Python CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...pythonSteps]
    });
  }

  if (goSteps.length > 0) {
    const id = "test-go";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Go CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...goSteps]
    });
  }

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

  if (dockerSteps.length > 0) {
    jobs.push({
      id: "build-docker",
      name: "Docker Build",
      runsOn: runner,
      needs: testJobIds.length > 0 ? testJobIds : undefined,
      steps: [CHECKOUT_STEP, ...dockerSteps]
    });
  }

  if (generalSteps.length > 0 && jobs.length === 0) {
    jobs.push({
      id: "ci",
      name: "CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...generalSteps]
    });
  }

  return {
    name: workflowName,
    triggers: [
      { event: "push", branches },
      { event: "pull_request", branches }
    ],
    permissions: {
      contents: "read"
    },
    jobs
  };
}
