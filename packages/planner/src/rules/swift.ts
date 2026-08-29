import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const swiftRule: Rule = {
  id: "swift-ci",
  description: "Build and test Swift packages.",

  evaluate(_state, capabilities) {
    const swiftCap = findCapability(capabilities, "runtime.swift");
    if (!swiftCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "swift-build",
          type: "swift.build",
          reason: "Compile Swift packages.",
          sourceRule: "swift-ci"
        },
        {
          id: "swift-test",
          type: "swift.test",
          reason: "Execute Swift package tests.",
          sourceRule: "swift-ci"
        }
      ],
      reasons: ["Swift project detected.", ...formatEvidence(swiftCap)]
    };
  }
};
