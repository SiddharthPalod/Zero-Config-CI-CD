import type { CapabilityId, ResolvedCapability, Rule, RuleResult } from "../types.js";

export function findCapability(
  capabilities: readonly ResolvedCapability[],
  id: CapabilityId
): ResolvedCapability | undefined {
  return capabilities.find(c => c.id === id);
}

export function hasCapability(
  capabilities: readonly ResolvedCapability[],
  id: CapabilityId
): boolean {
  return capabilities.some(c => c.id === id);
}

export function formatEvidence(
  ...capabilities: (ResolvedCapability | undefined)[]
): string[] {
  const lines: string[] = [];
  for (const cap of capabilities) {
    if (!cap) continue;
    for (const ev of cap.evidence) {
      lines.push(`${ev.source}: ${ev.reason}`);
    }
  }
  return lines;
}

export function noMatch(): RuleResult {
  return { matched: false, actions: [], reasons: [] };
}

export function createTestingRule(options: {
  id: string;
  description: string;
  capabilityId: CapabilityId;
  framework: string;
  type: "test.unit" | "test.e2e";
  label: string;
}): Rule {
  return {
    id: options.id,
    description: options.description,
    evaluate(_state, capabilities) {
      const capability = findCapability(capabilities, options.capabilityId);
      if (!capability) return noMatch();

      return {
        matched: true,
        actions: [
          {
            id: options.id,
            type: options.type,
            inputs: { framework: options.framework },
            reason: `${options.label} detected in project.`,
            sourceRule: options.id
          }
        ],
        reasons: [`${options.label} testing framework detected.`, ...formatEvidence(capability)]
      };
    }
  };
}
