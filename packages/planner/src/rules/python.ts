import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const pythonRule: Rule = {
  id: "python-test",
  description: "Create Python test execution when Python is detected.",

  evaluate(_state, capabilities) {
    const capability = findCapability(capabilities, "runtime.python");
    if (!capability) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "python-test",
          type: "python.test",
          reason: "Python runtime detected.",
          sourceRule: "python-test"
        }
      ],
      reasons: ["Python runtime detected.", ...formatEvidence(capability)]
    };
  }
};