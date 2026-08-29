import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const denoRule: Rule = {
  id: "deno-ci",
  description: "Setup Deno runtime, check formatting/lint, and run deno test.",

  evaluate(_state, capabilities) {
    const denoCap = findCapability(capabilities, "runtime.deno");
    if (!denoCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "deno-setup",
          type: "runtime.setup",
          inputs: {
            runtime: "deno",
            version: denoCap.version ?? "v1.x"
          },
          reason: "Deno runtime setup.",
          sourceRule: "deno-ci"
        },
        {
          id: "deno-test",
          type: "deno.test",
          reason: "Run Deno tests.",
          sourceRule: "deno-ci"
        }
      ],
      reasons: ["Deno project detected.", ...formatEvidence(denoCap)]
    };
  }
};
