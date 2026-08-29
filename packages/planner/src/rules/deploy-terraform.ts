import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const deployTerraformRule: Rule = {
  id: "deploy-terraform",
  description: "Plan and apply Infrastructure as Code using Terraform.",
  evaluate(_state, capabilities) {
    const tfCap = findCapability(capabilities, "infra.terraform");
    if (!tfCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "deploy-terraform-apply",
          type: "deploy.terraform",
          inputs: { tool: "terraform" },
          reason: "Terraform configuration files detected.",
          sourceRule: "deploy-terraform"
        }
      ],
      reasons: ["Terraform infrastructure detected.", ...formatEvidence(tfCap)]
    };
  }
};
