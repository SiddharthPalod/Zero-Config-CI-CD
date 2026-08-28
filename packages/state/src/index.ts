export type RuntimeName =
  | "node"
  | "python"
  | "go"
  | "rust";

export type PackageManagerName =
  | "npm"
  | "pnpm"
  | "yarn"
  | "bun"
  | "cargo";

export type Evidence = {
  source: string;
  value: string;
};

export type Runtime = {
  name: RuntimeName;
  version?: string;
  evidence: Evidence[];
};

export type PackageManager = {
  name: PackageManagerName;
  evidence: Evidence[];
};

export type Capability = {
  name: string;
  evidence: Evidence[];
};

export type ProjectState = {
  runtime: Runtime[];
  packageManager: PackageManager[];
  frameworks: Capability[];
  testing: Capability[];
  tooling: Capability[];
  infrastructure: Capability[];
};