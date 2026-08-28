import type { PlannedAction } from "@zcicd/planner";
import type { ResolvedPrimitive } from "../types.js";
import { STARTER_WORKFLOWS_CATALOG } from "../catalog/starter-workflows.js";

export function resolveRuntimeSetup(action: PlannedAction): ResolvedPrimitive[] {
  const runtime = action.inputs?.runtime;
  const version = action.inputs?.version;

  if (typeof runtime !== "string") {
    throw new Error(`runtime.setup action "${action.id}" is missing runtime`);
  }

  const resolvedVersion = typeof version === "string" ? version : undefined;

  switch (runtime) {
    case "node": {
      const template = STARTER_WORKFLOWS_CATALOG["ci/node.js.yml"];
      const setupStep = template.steps.find(s => s.id === "setup-node");
      return [
        {
          kind: "uses",
          uses: setupStep?.uses ?? "actions/setup-node@v4",
          with: resolvedVersion ? { "node-version": resolvedVersion } : (setupStep?.with ?? { "node-version": "20.x" }),
          reason: "Node.js runtime setup from starter workflow.",
          source: `actions/starter-workflows:${template.id}`,
          actionId: action.id
        }
      ];
    }

    case "python": {
      const template = STARTER_WORKFLOWS_CATALOG["ci/python-app.yml"];
      const setupStep = template.steps.find(s => s.id === "setup-python");
      return [
        {
          kind: "uses",
          uses: setupStep?.uses ?? "actions/setup-python@v5",
          with: resolvedVersion ? { "python-version": resolvedVersion } : (setupStep?.with ?? { "python-version": "3.x" }),
          reason: "Python runtime setup from starter workflow.",
          source: `actions/starter-workflows:${template.id}`,
          actionId: action.id
        }
      ];
    }

    case "go": {
      const template = STARTER_WORKFLOWS_CATALOG["ci/go.yml"];
      const setupStep = template.steps.find(s => s.id === "setup-go");
      return [
        {
          kind: "uses",
          uses: setupStep?.uses ?? "actions/setup-go@v5",
          with: resolvedVersion ? { "go-version": resolvedVersion } : (setupStep?.with ?? { "go-version": "1.22" }),
          reason: "Go runtime setup from starter workflow.",
          source: `actions/starter-workflows:${template.id}`,
          actionId: action.id
        }
      ];
    }

    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
}

export function resolveGoBuild(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["ci/go.yml"];
  const setupStep = template.steps.find(s => s.id === "setup-go");
  const buildStep = template.steps.find(s => s.id === "go-build");

  return [
    {
      kind: "uses",
      uses: setupStep?.uses ?? "actions/setup-go@v5",
      with: action.inputs?.version && action.inputs.version !== "default"
        ? { "go-version": String(action.inputs.version) }
        : (setupStep?.with ?? { "go-version": "1.22" }),
      reason: "Setup Go environment for build.",
      source: `actions/starter-workflows:${template.id}`,
      actionId: action.id
    },
    {
      kind: "run",
      run: buildStep?.run ?? "go build -v ./...",
      reason: "Compile Go packages according to starter workflow.",
      source: `actions/starter-workflows:${template.id}`,
      actionId: action.id
    }
  ];
}

export function resolveGoTest(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["ci/go.yml"];
  const testStep = template.steps.find(s => s.id === "go-test");

  return [
    {
      kind: "run",
      run: testStep?.run ?? "go test -v ./...",
      reason: "Run Go test suite according to starter workflow.",
      source: `actions/starter-workflows:${template.id}`,
      actionId: action.id
    }
  ];
}

export function resolvePythonTest(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["ci/python-app.yml"];
  const setupStep = template.steps.find(s => s.id === "setup-python");
  const testStep = template.steps.find(s => s.id === "pytest");

  return [
    {
      kind: "uses",
      uses: setupStep?.uses ?? "actions/setup-python@v5",
      with: { "python-version": "3.x" },
      reason: "Setup Python environment for test.",
      source: `actions/starter-workflows:${template.id}`,
      actionId: action.id
    },
    {
      kind: "run",
      run: testStep?.run ?? "pytest",
      reason: "Run Python tests with pytest according to starter workflow.",
      source: `actions/starter-workflows:${template.id}`,
      actionId: action.id
    }
  ];
}