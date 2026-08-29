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
  const javaSteps: WorkflowStep[] = [];
  const dotnetSteps: WorkflowStep[] = [];
  const rubySteps: WorkflowStep[] = [];
  const phpSteps: WorkflowStep[] = [];
  const dartSteps: WorkflowStep[] = [];
  const elixirSteps: WorkflowStep[] = [];
  const cppSteps: WorkflowStep[] = [];
  const denoSteps: WorkflowStep[] = [];
  const swiftSteps: WorkflowStep[] = [];
  const dockerSteps: WorkflowStep[] = [];
  const generalSteps: WorkflowStep[] = [];

  for (const primitive of resolved.primitives) {
    const step = toWorkflowStep(primitive);
    const uses = primitive.kind === "uses" ? primitive.uses : "";
    const run = primitive.kind === "run" ? primitive.run : "";
    const source = primitive.source ?? "";
    const actionId = primitive.actionId ?? "";

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
    } else if (
      uses.includes("setup-java") ||
      uses.includes("setup-gradle") ||
      source.includes("maven") ||
      source.includes("gradle") ||
      run.includes("mvn ") ||
      run.includes("./gradlew")
    ) {
      javaSteps.push(step);
    } else if (
      uses.includes("setup-dotnet") ||
      source.includes("dotnet") ||
      run.startsWith("dotnet")
    ) {
      dotnetSteps.push(step);
    } else if (
      uses.includes("setup-ruby") ||
      source.includes("ruby") ||
      run.startsWith("bundle")
    ) {
      rubySteps.push(step);
    } else if (
      uses.includes("setup-php") ||
      source.includes("php") ||
      run.includes("composer") ||
      run.includes("phpunit")
    ) {
      phpSteps.push(step);
    } else if (
      uses.includes("setup-dart") ||
      source.includes("dart") ||
      run.startsWith("dart")
    ) {
      dartSteps.push(step);
    } else if (
      uses.includes("setup-beam") ||
      source.includes("elixir") ||
      run.startsWith("mix")
    ) {
      elixirSteps.push(step);
    } else if (
      source.includes("cmake") ||
      run.includes("cmake") ||
      run.includes("ctest")
    ) {
      cppSteps.push(step);
    } else if (
      uses.includes("setup-deno") ||
      source.includes("deno") ||
      run.startsWith("deno")
    ) {
      denoSteps.push(step);
    } else if (
      source.includes("swift") ||
      run.startsWith("swift")
    ) {
      swiftSteps.push(step);
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

  if (javaSteps.length > 0) {
    const id = "test-java";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Java CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...javaSteps]
    });
  }

  if (dotnetSteps.length > 0) {
    const id = "test-dotnet";
    testJobIds.push(id);
    jobs.push({
      id,
      name: ".NET CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...dotnetSteps]
    });
  }

  if (rubySteps.length > 0) {
    const id = "test-ruby";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Ruby CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...rubySteps]
    });
  }

  if (phpSteps.length > 0) {
    const id = "test-php";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "PHP CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...phpSteps]
    });
  }

  if (dartSteps.length > 0) {
    const id = "test-dart";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Dart CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...dartSteps]
    });
  }

  if (elixirSteps.length > 0) {
    const id = "test-elixir";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Elixir CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...elixirSteps]
    });
  }

  if (cppSteps.length > 0) {
    const id = "test-cpp";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "C/C++ CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...cppSteps]
    });
  }

  if (denoSteps.length > 0) {
    const id = "test-deno";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Deno CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...denoSteps]
    });
  }

  if (swiftSteps.length > 0) {
    const id = "test-swift";
    testJobIds.push(id);
    jobs.push({
      id,
      name: "Swift CI",
      runsOn: runner,
      steps: [CHECKOUT_STEP, ...swiftSteps]
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
