import type { ProjectState } from "@zcicd/state";
import {
  createRepositoryContext
} from "./context.js";

import { nodeDetector } from "./detectors/node.js";
import { dockerDetector } from "./detectors/docker.js";
import { pythonDetector } from "./detectors/python.js";
import { goDetector } from "./detectors/go.js";
import { rustDetector } from "./detectors/rust.js";

const detectors = [
  nodeDetector,
  pythonDetector,
  goDetector,
  dockerDetector,
  rustDetector,
];

export async function scanRepository(
  root: string
): Promise<ProjectState> {
  const context =
    await createRepositoryContext(root);

  const state: ProjectState = {
    runtime: [],
    packageManager: [],
    frameworks: [],
    testing: [],
    tooling: [],
    infrastructure: []
  };

  for (const detector of detectors) {
    await detector.detect(context, state);
  }

  return state;
}