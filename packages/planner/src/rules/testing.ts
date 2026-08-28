import { createTestingRule } from "./helpers.js";

export const jestRule = createTestingRule({
  id: "jest-test",
  description: "Run Jest when Jest is detected.",
  capabilityId: "test.jest",
  framework: "jest",
  type: "test.unit",
  label: "Jest"
});

export const vitestRule = createTestingRule({
  id: "vitest-test",
  description: "Run Vitest when Vitest is detected.",
  capabilityId: "test.vitest",
  framework: "vitest",
  type: "test.unit",
  label: "Vitest"
});

export const playwrightRule = createTestingRule({
  id: "playwright-test",
  description: "Run Playwright E2E tests when Playwright is detected.",
  capabilityId: "test.playwright",
  framework: "playwright",
  type: "test.e2e",
  label: "Playwright"
});