import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const deployK8sRule: Rule = {
  id: "deploy-k8s",
  description: "Deploy manifests or Helm charts to Kubernetes.",
  evaluate(_state, capabilities) {
    const k8sCap = findCapability(capabilities, "infra.kubernetes");
    if (!k8sCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "deploy-k8s-cluster",
          type: "deploy.kubernetes",
          inputs: { tool: "helm" },
          reason: "Kubernetes/Helm manifests detected.",
          sourceRule: "deploy-k8s"
        }
      ],
      reasons: ["Kubernetes infrastructure detected.", ...formatEvidence(k8sCap)]
    };
  }
};
