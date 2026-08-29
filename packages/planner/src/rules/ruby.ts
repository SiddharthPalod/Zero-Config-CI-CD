import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const rubyRule: Rule = {
  id: "ruby-ci",
  description: "Setup Ruby, install gems via Bundler, and run tests.",

  evaluate(_state, capabilities) {
    const rubyCap = findCapability(capabilities, "runtime.ruby");
    if (!rubyCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "ruby-setup",
          type: "runtime.setup",
          inputs: {
            runtime: "ruby",
            version: rubyCap.version ?? "3.2"
          },
          reason: "Ruby environment setup with Bundler caching.",
          sourceRule: "ruby-ci"
        },
        {
          id: "ruby-test",
          type: "ruby.test",
          reason: "Run Ruby test suite via Rake / RSpec.",
          sourceRule: "ruby-ci"
        }
      ],
      reasons: ["Ruby project detected.", ...formatEvidence(rubyCap)]
    };
  }
};
