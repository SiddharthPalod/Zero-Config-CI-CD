import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const elixirRule: Rule = {
  id: "elixir-ci",
  description: "Setup BEAM/Elixir, install mix dependencies, and run tests.",

  evaluate(_state, capabilities) {
    const elixirCap = findCapability(capabilities, "runtime.elixir");
    if (!elixirCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "elixir-setup",
          type: "runtime.setup",
          inputs: {
            runtime: "elixir",
            version: elixirCap.version ?? "1.15"
          },
          reason: "Erlang / Elixir BEAM setup.",
          sourceRule: "elixir-ci"
        },
        {
          id: "elixir-test",
          type: "elixir.test",
          reason: "Fetch mix dependencies and execute mix test.",
          sourceRule: "elixir-ci"
        }
      ],
      reasons: ["Elixir project detected.", ...formatEvidence(elixirCap)]
    };
  }
};
