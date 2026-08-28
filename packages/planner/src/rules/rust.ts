import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const rustBuildRule: Rule = {
  id: "rust-ci",
  description: "Build and test Rust applications (actions/starter-workflows/ci/rust.yml).",

  evaluate(_state, capabilities) {
    const capability = findCapability(capabilities, "runtime.rust");
    if (!capability) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "rust-build",
          type: "rust.build",
          reason: "Rust / Cargo detected.",
          sourceRule: "rust-ci"
        },
        {
          id: "rust-test",
          type: "rust.test",
          reason: "Rust / Cargo detected.",
          sourceRule: "rust-ci"
        }
      ],
      reasons: ["Rust project detected.", ...formatEvidence(capability)]
    };
  }
};