import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const deployAwsRule: Rule = {
  id: "deploy-aws",
  description: "Deploy container workloads to AWS ECS / ECR.",
  evaluate(_state, capabilities) {
    const awsCap = findCapability(capabilities, "infra.aws");
    if (!awsCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "deploy-aws-ecs",
          type: "deploy.aws",
          inputs: { registry: "ecr", service: "ecs" },
          reason: "AWS deployment markers detected.",
          sourceRule: "deploy-aws"
        }
      ],
      reasons: ["AWS infrastructure detected.", ...formatEvidence(awsCap)]
    };
  }
};
