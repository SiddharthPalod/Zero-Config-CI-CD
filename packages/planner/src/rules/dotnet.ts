import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const dotnetRule: Rule = {
  id: "dotnet-ci",
  description: "Restore, build, and test .NET applications.",

  evaluate(_state, capabilities) {
    const dotnetCap = findCapability(capabilities, "runtime.dotnet");
    if (!dotnetCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "dotnet-setup",
          type: "runtime.setup",
          inputs: {
            runtime: "dotnet",
            version: dotnetCap.version ?? "8.0.x"
          },
          reason: ".NET SDK setup.",
          sourceRule: "dotnet-ci"
        },
        {
          id: "dotnet-build",
          type: "dotnet.build",
          reason: "Restore and build .NET solution/project.",
          sourceRule: "dotnet-ci"
        },
        {
          id: "dotnet-test",
          type: "dotnet.test",
          reason: "Execute .NET unit tests.",
          sourceRule: "dotnet-ci"
        }
      ],
      reasons: [".NET project detected.", ...formatEvidence(dotnetCap)]
    };
  }
};
