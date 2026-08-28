import type { PlannedAction } from "@zcicd/planner";
import type { ResolvedPrimitive } from "./types.js";
import {
  resolveRuntimeSetup,
  resolveGoBuild,
  resolveGoTest,
  resolvePythonTest
} from "./resolvers/runtime.js";
import { resolveDependencyInstall } from "./resolvers/dependencies.js";
import { resolveDockerBuild } from "./resolvers/docker.js";
import { resolveUnitTest, resolveE2ETest } from "./resolvers/testing.js";

type ResolverFunction = (action: PlannedAction) => ResolvedPrimitive[];

export const resolverRegistry: Record<string, ResolverFunction> = {
  "runtime.setup": resolveRuntimeSetup,
  "dependency.install": resolveDependencyInstall,
  "docker.build": resolveDockerBuild,
  "test.unit": resolveUnitTest,
  "test.e2e": resolveE2ETest,
  "go.build": resolveGoBuild,
  "go.test": resolveGoTest,
  "python.test": resolvePythonTest
};