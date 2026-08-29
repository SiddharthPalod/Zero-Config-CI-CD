import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const dartRule: Rule = {
  id: "dart-ci",
  description: "Setup Dart SDK, resolve pub dependencies, and run tests.",

  evaluate(_state, capabilities) {
    const dartCap = findCapability(capabilities, "runtime.dart");
    if (!dartCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "dart-setup",
          type: "runtime.setup",
          inputs: {
            runtime: "dart",
            version: dartCap.version ?? "stable"
          },
          reason: "Dart SDK setup.",
          sourceRule: "dart-ci"
        },
        {
          id: "dart-test",
          type: "dart.test",
          reason: "Install dependencies and run Dart tests.",
          sourceRule: "dart-ci"
        }
      ],
      reasons: ["Dart / Flutter project detected.", ...formatEvidence(dartCap)]
    };
  }
};
