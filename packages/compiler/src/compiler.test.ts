import { describe, it, expect } from "vitest";
import { buildWorkflowIR } from "./builder.js";
import { validateWorkflowIR } from "./validator.js";
import { compileWorkflowYAML } from "./compiler.js";
import type { WorkflowPlan } from "@zcicd/planner";
import type { ResolvedWorkflowPlan } from "@zcicd/resolver";

describe("Phase 4 - Workflow IR & Compiler", () => {
  it("builds multi-job WorkflowIR and compiles valid YAML for polyglot project (Node + Python + Docker)", () => {
    const plan: WorkflowPlan = {
      capabilities: [],
      matchedRules: ["node-setup", "python-test", "docker-build"],
      diagnostics: [],
      actions: [
        { id: "node-setup", type: "runtime.setup", reason: "Node", sourceRule: "node-setup" },
        { id: "python-test", type: "python.test", reason: "Python", sourceRule: "python-test" },
        { id: "docker-build", type: "docker.build", reason: "Docker", sourceRule: "docker-build" }
      ]
    };

    const resolved: ResolvedWorkflowPlan = {
      results: [],
      warnings: [],
      primitives: [
        {
          kind: "uses",
          uses: "actions/setup-node@v4",
          with: { "node-version": "20.x" },
          reason: "Node setup",
          source: "actions/starter-workflows:ci/node.js.yml",
          actionId: "node-setup"
        },
        {
          kind: "run",
          run: "npm test",
          reason: "Node test",
          source: "actions/starter-workflows:ci/node.js.yml",
          actionId: "node-setup"
        },
        {
          kind: "uses",
          uses: "actions/setup-python@v5",
          with: { "python-version": "3.x" },
          reason: "Python setup",
          source: "actions/starter-workflows:ci/python-app.yml",
          actionId: "python-test"
        },
        {
          kind: "run",
          run: "pytest",
          reason: "Python test",
          source: "actions/starter-workflows:ci/python-app.yml",
          actionId: "python-test"
        },
        {
          kind: "uses",
          uses: "docker/build-push-action@v6",
          with: { push: false },
          reason: "Docker build",
          source: "actions/starter-workflows:ci/docker-image.yml",
          actionId: "docker-build"
        }
      ]
    };

    // 1. Build WorkflowIR
    const ir = buildWorkflowIR(plan, resolved);
    expect(ir.name).toBe("CI");
    expect(ir.jobs).toHaveLength(3);

    const nodeJob = ir.jobs.find(j => j.id === "test-node");
    const pythonJob = ir.jobs.find(j => j.id === "test-python");
    const dockerJob = ir.jobs.find(j => j.id === "build-docker");

    expect(nodeJob).toBeDefined();
    expect(pythonJob).toBeDefined();
    expect(dockerJob).toBeDefined();

    // Check checkout step is injected as step 0
    const nodeStep0 = nodeJob?.steps[0];
    const pythonStep0 = pythonJob?.steps[0];
    const dockerStep0 = dockerJob?.steps[0];

    expect(nodeStep0?.kind).toBe("uses");
    if (nodeStep0?.kind === "uses") {
      expect(nodeStep0.uses).toBe("actions/checkout@v4");
    }

    expect(pythonStep0?.kind).toBe("uses");
    if (pythonStep0?.kind === "uses") {
      expect(pythonStep0.uses).toBe("actions/checkout@v4");
    }

    expect(dockerStep0?.kind).toBe("uses");
    if (dockerStep0?.kind === "uses") {
      expect(dockerStep0.uses).toBe("actions/checkout@v4");
    }

    // Check DAG dependency: Docker build depends on test jobs
    expect(dockerJob?.needs).toContain("test-node");
    expect(dockerJob?.needs).toContain("test-python");

    // 2. Validate IR
    const validation = validateWorkflowIR(ir);
    expect(validation.valid).toBe(true);

    // 3. Compile to YAML
    const yaml = compileWorkflowYAML(ir);
    expect(yaml).toContain("name: CI");
    expect(yaml).toContain("test-node:");
    expect(yaml).toContain("test-python:");
    expect(yaml).toContain("build-docker:");
    expect(yaml).toContain("actions/checkout@v4");
    expect(yaml).toContain("actions/setup-node@v4");
    expect(yaml).toContain("pytest");
    expect(yaml).toContain("docker/build-push-action@v6");
  });

  it("detects circular dependencies during validation pass", () => {
    const invalidIR = {
      name: "Cycle Test",
      triggers: [{ event: "push" as const }],
      jobs: [
        { id: "job-a", runsOn: "ubuntu-latest", needs: ["job-b"], steps: [{ kind: "run" as const, run: "echo A" }] },
        { id: "job-b", runsOn: "ubuntu-latest", needs: ["job-a"], steps: [{ kind: "run" as const, run: "echo B" }] }
      ]
    };

    const validation = validateWorkflowIR(invalidIR);
    expect(validation.valid).toBe(false);
    expect(validation.errors[0].message).toContain("Circular dependency");
  });
});
