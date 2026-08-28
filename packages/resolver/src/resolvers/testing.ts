import type { PlannedAction } from "@zcicd/planner";
import type { ResolvedPrimitive } from "../types.js";
import { STARTER_WORKFLOWS_CATALOG } from "../catalog/starter-workflows.js";

export function resolveUnitTest(action: PlannedAction): ResolvedPrimitive[] {
  const framework = action.inputs?.framework;

  if (typeof framework !== "string") {
    throw new Error(`test.unit action "${action.id}" is missing framework`);
  }

  switch (framework) {
    case "jest": {
      const template = STARTER_WORKFLOWS_CATALOG["ci/node.js.yml"];
      return [
        {
          kind: "run",
          run: "npm test -- --ci",
          reason: "Run Jest unit tests.",
          source: `actions/starter-workflows:${template.id}`,
          actionId: action.id
        }
      ];
    }

    case "vitest": {
      const template = STARTER_WORKFLOWS_CATALOG["ci/node.js.yml"];
      return [
        {
          kind: "run",
          run: "npm run test -- --run",
          reason: "Run Vitest unit tests.",
          source: `actions/starter-workflows:${template.id}`,
          actionId: action.id
        }
      ];
    }

    default:
      throw new Error(`Unsupported unit testing framework: ${framework}`);
  }
}

export function resolveE2ETest(action: PlannedAction): ResolvedPrimitive[] {
  const framework = action.inputs?.framework;

  if (typeof framework !== "string") {
    throw new Error(`test.e2e action "${action.id}" is missing framework`);
  }

  switch (framework) {
    case "playwright":
      return [
        {
          kind: "run",
          run: "npx playwright test",
          reason: "Run Playwright end-to-end tests.",
          source: "microsoft/playwright-github-action",
          actionId: action.id
        }
      ];

    case "cypress":
      return [
        {
          kind: "run",
          run: "npx cypress run",
          reason: "Run Cypress end-to-end tests.",
          source: "cypress-io/github-action",
          actionId: action.id
        }
      ];

    default:
      throw new Error(`Unsupported E2E testing framework: ${framework}`);
  }
}