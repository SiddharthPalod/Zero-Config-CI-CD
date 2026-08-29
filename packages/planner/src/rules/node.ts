import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const nodeSetupRule: Rule = {
  id: "node-setup",
  description: "Configure Node.js runtime and test steps when a Node runtime is detected.",

  evaluate(_state, capabilities) {
    const capability = findCapability(capabilities, "runtime.node");
    if (!capability) return noMatch();

    const isPnpm = findCapability(capabilities, "package.pnpm");
    const isYarn = findCapability(capabilities, "package.yarn");
    const isBun = findCapability(capabilities, "package.bun");

    const actions: any[] = [];

    if (isPnpm) {
      actions.push({
        id: "pnpm-setup",
        type: "dependency.install",
        inputs: { packageManager: "pnpm" },
        reason: "pnpm package manager detected.",
        sourceRule: "node-setup"
      });
    }

    actions.push({
      id: "node-setup",
      type: "runtime.setup",
      inputs: {
        runtime: "node",
        version: capability.version ?? "20.x"
      },
      reason: "Node.js runtime detected.",
      sourceRule: "node-setup"
    });

    // Monorepo-aware dependency installation & test execution
    const installCmd = isPnpm
      ? "if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi"
      : isYarn
      ? "if [ -f yarn.lock ]; then yarn install --immutable; else yarn install; fi"
      : isBun
      ? "bun install --frozen-lockfile || bun install"
      : "if [ -f package-lock.json ]; then npm ci; else npm install; fi; for dir in $(find . -name 'package.json' -not -path '*/node_modules/*' -not -path './package.json' -exec dirname {} \\;); do if [ -f \"$dir/package-lock.json\" ]; then (cd \"$dir\" && npm ci); else (cd \"$dir\" && npm install); fi; done";

    actions.push({
      id: "node-install",
      type: "dependency.install",
      inputs: {
        packageManager: isPnpm ? "pnpm-cmd" : isYarn ? "yarn-cmd" : isBun ? "bun-cmd" : "npm-cmd",
        customCommand: installCmd
      },
      reason: "Install Node.js dependencies across root and monorepo packages.",
      sourceRule: "node-setup"
    });

    const testCmd = isPnpm
      ? "pnpm test --if-present"
      : isYarn
      ? "yarn test"
      : isBun
      ? "bun test"
      : "npm test --if-present; for dir in $(find . -name 'package.json' -not -path '*/node_modules/*' -not -path './package.json' -exec dirname {} \\;); do (cd \"$dir\" && npm test --if-present); done";

    actions.push({
      id: "node-test",
      type: "test.unit",
      inputs: {
        framework: "npm-test",
        customCommand: testCmd
      },
      reason: "Run Node.js tests if present across workspace.",
      sourceRule: "node-setup"
    });

    return {
      matched: true,
      actions,
      reasons: ["Node.js runtime detected.", ...formatEvidence(capability)]
    };
  }
};