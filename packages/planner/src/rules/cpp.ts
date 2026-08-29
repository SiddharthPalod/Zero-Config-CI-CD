import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const cppRule: Rule = {
  id: "cpp-ci",
  description: "Configure, build, and test C/C++ projects using CMake.",

  evaluate(_state, capabilities) {
    const cppCap = findCapability(capabilities, "runtime.cpp");
    if (!cppCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "cpp-build",
          type: "cpp.build",
          reason: "Configure and compile with CMake.",
          sourceRule: "cpp-ci"
        },
        {
          id: "cpp-test",
          type: "cpp.test",
          reason: "Execute CTest test suite.",
          sourceRule: "cpp-ci"
        }
      ],
      reasons: ["C/C++ project detected.", ...formatEvidence(cppCap)]
    };
  }
};
