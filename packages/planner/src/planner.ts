import type {ProjectState} from "@zcicd/state";
import type {Rule, WorkflowPlan, PlannedAction} from "./types.js";
import {resolveCapabilities} from "./capabilities.js";
import {goBuildRule} from "./rules/go.js";
import {pythonRule} from "./rules/python.js";
import {dockerBuildRule} from "./rules/docker.js";
import {nodeSetupRule} from "./rules/node.js";
import {rustBuildRule} from "./rules/rust.js";

import {jestRule, vitestRule, playwrightRule} from "./rules/testing.js";

const rules: Rule[] = [
  nodeSetupRule,
  goBuildRule,
  pythonRule,
  dockerBuildRule,
  jestRule,
  vitestRule,
  playwrightRule,
  rustBuildRule
];

export function planWorkflow(
  state: ProjectState
): WorkflowPlan {
  const capabilities =
    resolveCapabilities(state);

  const actions: PlannedAction[] = [];

  const matchedRules: string[] = [];

  const diagnostics: string[] = [];

  for (const rule of rules) {
    const result =
      rule.evaluate(
        state,
        capabilities
      );

    if (!result.matched) {
      continue;
    }

    matchedRules.push(rule.id);

    actions.push(
      ...result.actions
    );

    diagnostics.push(
      ...result.reasons.map(
        reason =>
          `[${rule.id}] ${reason}`
      )
    );
  }

  return {
    capabilities,
    actions: deduplicateActions(actions),
    matchedRules,
    diagnostics
  };
}

function deduplicateActions(
  actions: PlannedAction[]
): PlannedAction[] {
  const map =
    new Map<string, PlannedAction>();

  for (const action of actions) {
    const existing =
      map.get(action.id);

    if (!existing) {
      map.set(
        action.id,
        action
      );

      continue;
    }

    if (
      existing.reason !== action.reason
    ) {
      existing.reason +=
        `; ${action.reason}`;
    }
  }

  return [...map.values()];
}