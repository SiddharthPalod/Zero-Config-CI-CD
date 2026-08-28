import type {
  ProjectState
} from "@zcicd/state";

export type CapabilityId =
  | "runtime.node"
  | "runtime.python"
  | "runtime.go"

  | "package.npm"
  | "package.pnpm"
  | "package.yarn"
  | "package.bun"

  | "framework.react"
  | "framework.next"
  | "framework.express"
  | "framework.nestjs"

  | "test.jest"
  | "test.vitest"
  | "test.playwright"
  | "test.cypress"

  | "tool.typescript"
  | "tool.eslint"
  | "tool.prettier"

  | "runtime.node"
  | "runtime.rust"     

  | "infra.docker"
  | "infra.docker-compose";

export type ResolvedCapability = {
  id: CapabilityId;
  confidence: number;
  version?: string;
  evidence: {
    source: string;
    reason: string;
  }[];
};

export type ActionType =
  | "runtime.setup"
  | "dependency.install"
  | "code.lint"
  | "code.typecheck"
  | "test.unit"
  | "test.e2e"
  | "go.build"
  | "go.test"
  | "python.test"
  | "rust.build"      
  | "rust.test"
  | "docker.build";

export type PlannedAction = {
  id: string;
  type: ActionType;

  inputs?: Record<
    string,
    string | number | boolean
  >;

  reason: string;

  sourceRule: string;
};

export type RuleResult = {
  matched: boolean;

  actions: PlannedAction[];

  reasons: string[];
};

export type Rule = {
  id: string;

  description: string;

  evaluate(
    state: ProjectState,
    capabilities: ResolvedCapability[]
  ): RuleResult;
};

export type WorkflowPlan = {
  capabilities: ResolvedCapability[];

  actions: PlannedAction[];

  matchedRules: string[];

  diagnostics: string[];
};