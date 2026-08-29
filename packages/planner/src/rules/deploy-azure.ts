import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const deployAzureRule: Rule = {
  id: "deploy-azure",
  description: "Deploy applications to Azure App Services or Static Web Apps.",
  evaluate(_state, capabilities) {
    const azureCap = findCapability(capabilities, "infra.azure");
    if (!azureCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "deploy-azure-app",
          type: "deploy.azure",
          inputs: { service: "webapp" },
          reason: "Azure deployment markers detected.",
          sourceRule: "deploy-azure"
        }
      ],
      reasons: ["Azure infrastructure detected.", ...formatEvidence(azureCap)]
    };
  }
};
