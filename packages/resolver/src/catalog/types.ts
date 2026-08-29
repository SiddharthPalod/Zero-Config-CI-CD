export type StepCategory =
  | "checkout"
  | "setup"
  | "dependency"
  | "build"
  | "test"
  | "lint"
  | "docker"
  | "auth"
  | "deploy";

export type WorkflowStepPattern = {
  id: string;
  name?: string;
  category: StepCategory;
  kind: "uses" | "run";
  uses?: string;
  run?: string;
  with?: Record<string, string | number | boolean>;
  env?: Record<string, string>;
};

export type StarterWorkflowKnowledge = {
  id: string; // e.g. "ci/node.js.yml"
  name: string;
  description: string;
  sourceUrl: string;
  languages: string[];
  triggers: string[];
  defaultMatrix?: {
    key: string;
    values: (string | number)[];
  };
  steps: WorkflowStepPattern[];
};

export type StarterWorkflowCatalog = Record<string, StarterWorkflowKnowledge>;
