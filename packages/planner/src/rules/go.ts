import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const goBuildRule: Rule = {
  id: "go-build",
  description: "Build Go applications when Go is detected.",

  evaluate(_state, capabilities) {
    const capability = findCapability(capabilities, "runtime.go");
    if (!capability) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "go-build",
          type: "go.build",
          inputs: { version: capability.version ?? "default" },
          reason: "Go runtime detected.",
          sourceRule: "go-build"
        },
        {
          id: "go-test",
          type: "go.test",
          reason: "Go runtime detected.",
          sourceRule: "go-build"
        }
      ],
      reasons: ["Go runtime detected.", ...formatEvidence(capability)]
    };
  }
};