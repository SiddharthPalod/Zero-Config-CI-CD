import type { ProjectState } from "@zcicd/state";
import type {
  SecurityLevel,
  SecurityPolicyIR,
  DependabotTarget,
  DependabotEcosystem,
  CodeQLLanguage,
  NativeAuditConfig
} from "./types.js";

function getDir(sourcePath: string): string {
  const normalized = sourcePath.replace(/\\/g, "/");
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash === -1) return "/";
  const dir = normalized.slice(0, lastSlash);
  return dir.startsWith("/") ? dir : `/${dir}`;
}

export function resolveSecurityPolicy(
  state: ProjectState,
  level: SecurityLevel = "standard"
): SecurityPolicyIR {
  if (level === "none") {
    return {
      level: "none",
      dependabot: { enabled: false, ecosystems: [] },
      nativeAudits: [],
      codeql: { enabled: false, languages: [] },
      containerScanning: { enabled: false, dockerfiles: [], severityThreshold: "CRITICAL", uploadSarif: false },
      secretScanning: { enabled: false, tool: "gitleaks" },
      enforcement: { blockOnVulnerabilities: false }
    };
  }

  const interval = level === "strict" ? "daily" : "weekly";
  const blockOnVulnerabilities = level === "strict";

  // 1. Resolve Dependabot Targets
  const dependabotTargets: DependabotTarget[] = [];
  const seenTargets = new Set<string>();

  function addTarget(ecosystem: DependabotEcosystem, dir: string) {
    const key = `${ecosystem}:${dir}`;
    if (!seenTargets.has(key)) {
      seenTargets.add(key);
      dependabotTargets.push({ packageEcosystem: ecosystem, directory: dir, interval });
    }
  }

  // Always check GitHub Actions workflows
  addTarget("github-actions", "/");

  // Check Package Managers
  for (const pm of state.packageManager) {
    for (const ev of pm.evidence) {
      const dir = getDir(ev.source);
      if (pm.name === "npm" || pm.name === "pnpm" || pm.name === "yarn" || pm.name === "bun") {
        addTarget("npm", dir);
      } else if (pm.name === "cargo") {
        addTarget("cargo", dir);
      } else if (pm.name === "pip" || pm.name === "poetry") {
        addTarget("pip", dir);
      } else if (pm.name === "gomod") {
        addTarget("gomod", dir);
      }
    }
  }

  // Also inspect Runtime evidence for package manifests
  for (const rt of state.runtime) {
    for (const ev of rt.evidence) {
      const dir = getDir(ev.source);
      const lower = ev.source.toLowerCase();
      if (lower.endsWith("package.json")) {
        addTarget("npm", dir);
      } else if (lower.endsWith("cargo.toml")) {
        addTarget("cargo", dir);
      } else if (lower.endsWith("requirements.txt") || lower.endsWith("pipfile") || lower.endsWith("pyproject.toml")) {
        addTarget("pip", dir);
      } else if (lower.endsWith("go.mod")) {
        addTarget("gomod", dir);
      }
    }
  }

  // Check Infrastructure (Docker)
  const dockerfiles: string[] = [];
  for (const infra of state.infrastructure) {
    if (infra.name === "docker") {
      for (const ev of infra.evidence) {
        if (ev.source.toLowerCase().includes("dockerfile")) {
          const dir = getDir(ev.source);
          addTarget("docker", dir);
          dockerfiles.push(ev.source.replace(/\\/g, "/"));
        }
      }
    }
  }

  // 2. Resolve Native Audits
  const nativeAudits: NativeAuditConfig[] = [];
  const runtimes = state.runtime.map(r => r.name);

  if (runtimes.includes("rust")) {
    nativeAudits.push({
      tool: "cargo-audit",
      command: "cargo audit",
      failOnError: blockOnVulnerabilities
    });
  }

  if (runtimes.includes("node")) {
    const isPnpm = state.packageManager.some(p => p.name === "pnpm");
    const isYarn = state.packageManager.some(p => p.name === "yarn");
    const cmd = isPnpm ? "pnpm audit" : isYarn ? "yarn audit" : "npm audit --audit-level=high";
    nativeAudits.push({
      tool: "npm-audit",
      command: cmd,
      failOnError: blockOnVulnerabilities
    });
  }

  if (runtimes.includes("python")) {
    nativeAudits.push({
      tool: "pip-audit",
      command: "pip-audit",
      failOnError: blockOnVulnerabilities
    });
  }

  if (runtimes.includes("go")) {
    nativeAudits.push({
      tool: "govulncheck",
      command: "govulncheck ./...",
      failOnError: blockOnVulnerabilities
    });
  }

  // 3. Resolve CodeQL Languages (CodeQL is enabled for Standard and Strict)
  const codeqlLanguages: CodeQLLanguage[] = [];
  if (level === "standard" || level === "strict") {
    if (runtimes.includes("node")) codeqlLanguages.push("javascript-typescript");
    if (runtimes.includes("python")) codeqlLanguages.push("python");
    if (runtimes.includes("go")) codeqlLanguages.push("go");
  }

  // 4. Resolve Container Scanning
  const enableContainerScanning = (level === "standard" || level === "strict") && dockerfiles.length > 0;
  const severityThreshold = level === "strict" ? "UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL" : "HIGH,CRITICAL";

  // 5. Resolve Secret Scanning (Strict level only)
  const enableSecretScanning = level === "strict";

  return {
    level,
    dependabot: {
      enabled: dependabotTargets.length > 0,
      ecosystems: dependabotTargets
    },
    nativeAudits,
    codeql: {
      enabled: codeqlLanguages.length > 0,
      languages: codeqlLanguages,
      scheduleCron: level === "strict" ? "0 0 * * 1,4" : "0 0 * * 1" // Mon & Thu for strict, Mon for standard
    },
    containerScanning: {
      enabled: enableContainerScanning,
      dockerfiles,
      severityThreshold,
      uploadSarif: level === "strict"
    },
    secretScanning: {
      enabled: enableSecretScanning,
      tool: "harden-runner"
    },
    enforcement: {
      blockOnVulnerabilities
    }
  };
}
