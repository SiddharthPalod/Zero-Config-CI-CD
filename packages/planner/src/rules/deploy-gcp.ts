import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const deployGcpRule: Rule = {
  id: "deploy-gcp",
  description: "Deploy applications or containers to Google Cloud Run.",
  evaluate(_state, capabilities) {
    const gcpCap = findCapability(capabilities, "infra.gcp");
    if (!gcpCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "deploy-gcp-cloudrun",
          type: "deploy.gcp",
          inputs: { service: "cloudrun" },
          reason: "GCP deployment markers detected.",
          sourceRule: "deploy-gcp"
        }
      ],
      reasons: ["GCP infrastructure detected.", ...formatEvidence(gcpCap)]
    };
  }
};
