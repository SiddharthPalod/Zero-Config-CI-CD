import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const nodeSetupRule: Rule = {
  id: "node-setup",
  description: "Configure Node.js when a Node runtime is detected.",

  evaluate(_state, capabilities) {
    const capability = findCapability(capabilities, "runtime.node");
    if (!capability) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "node-setup",
          type: "runtime.setup",
          inputs: {
            runtime: "node",
            version: capability.version ?? "20.x"
          },
          reason: "Node.js runtime detected.",
          sourceRule: "node-setup"
        }
      ],
      reasons: ["Node.js runtime detected.", ...formatEvidence(capability)]
    };
  }
};