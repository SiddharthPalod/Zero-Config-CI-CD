import type { PlannedAction } from "@zcicd/planner";
import type { ResolvedPrimitive } from "../types.js";
import type { WorkflowStepPattern } from "../catalog/types.js";
import { STARTER_WORKFLOWS_CATALOG } from "../catalog/index.js";

export function resolveDeployAws(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["deployments/aws.yml"];
  if (!template) return [];

  return template.steps.map((step: WorkflowStepPattern) => ({
    ...step,
    actionId: action.id,
    provenance: {
      source: "actions/starter-workflows:deployments/aws.yml",
      templateId: template.id,
      rationale: action.reason
    }
  }));
}

export function resolveDeployGcp(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["deployments/google-cloudrun-docker.yml"];
  if (!template) return [];

  return template.steps.map((step: WorkflowStepPattern) => ({
    ...step,
    actionId: action.id,
    provenance: {
      source: "actions/starter-workflows:deployments/google-cloudrun-docker.yml",
      templateId: template.id,
      rationale: action.reason
    }
  }));
}

export function resolveDeployAzure(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["deployments/azure-container-webapp.yml"];
  if (!template) return [];

  return template.steps.map((step: WorkflowStepPattern) => ({
    ...step,
    actionId: action.id,
    provenance: {
      source: "actions/starter-workflows:deployments/azure-container-webapp.yml",
      templateId: template.id,
      rationale: action.reason
    }
  }));
}

export function resolveDeployKubernetes(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["deployments/azure-kubernetes-service-helm.yml"];
  if (!template) return [];

  return template.steps.map((step: WorkflowStepPattern) => ({
    ...step,
    actionId: action.id,
    provenance: {
      source: "actions/starter-workflows:deployments/azure-kubernetes-service-helm.yml",
      templateId: template.id,
      rationale: action.reason
    }
  }));
}

export function resolveDeployTerraform(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["deployments/terraform.yml"];
  if (!template) return [];

  return template.steps.map((step: WorkflowStepPattern) => ({
    ...step,
    actionId: action.id,
    provenance: {
      source: "actions/starter-workflows:deployments/terraform.yml",
      templateId: template.id,
      rationale: action.reason
    }
  }));
}

export function resolveDeployGhcr(action: PlannedAction): ResolvedPrimitive[] {
  const template = STARTER_WORKFLOWS_CATALOG["deployments/docker-publish.yml"];
  if (!template) return [];

  return template.steps.map((step: WorkflowStepPattern) => ({
    ...step,
    actionId: action.id,
    provenance: {
      source: "actions/starter-workflows:deployments/docker-publish.yml",
      templateId: template.id,
      rationale: action.reason
    }
  }));
}
