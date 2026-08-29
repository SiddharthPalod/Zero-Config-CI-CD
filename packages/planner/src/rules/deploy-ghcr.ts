import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const deployGhcrRule: Rule = {
  id: "deploy-ghcr",
  description: "Publish container image to GitHub Container Registry (GHCR).",
  evaluate(_state, capabilities) {
    const dockerCap = findCapability(capabilities, "infra.docker");
    if (!dockerCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "deploy-ghcr-image",
          type: "deploy.ghcr",
          inputs: { registry: "ghcr.io" },
          reason: "Dockerfile detected with container deployment intent.",
          sourceRule: "deploy-ghcr"
        }
      ],
      reasons: ["Docker infrastructure detected.", ...formatEvidence(dockerCap)]
    };
  }
};
