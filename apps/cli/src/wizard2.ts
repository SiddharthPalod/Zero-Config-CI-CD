import { intro, outro, text, multiselect, select, confirm, spinner, note, log, isCancel, cancel } from "@clack/prompts";
import pc from "picocolors";
import { promises as fs } from "node:fs";
import path from "node:path";
import { scanRepository } from "@zcicd/scanner";
import { planWorkflow } from "@zcicd/planner";
import { resolvePlan } from "@zcicd/resolver";
import { buildWorkflowIR, compileWorkflowYAML, validateWorkflowIR } from "@zcicd/compiler";
import { compileSecurityPolicy, type SecurityLevel } from "@zcicd/security";
import { withRepository, isRemoteUrl } from "./git.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wizard v2: Clean multi-stage compilation pipeline with discrete step logging & Security Policy Compiler
 */
export async function runInteractiveWizardV2(): Promise<void> {
  console.clear();
  intro(pc.bgCyan(pc.black(" Zero-Config CI/CD Engine (v2 - Live Pipeline) ")));

  // 1. Ask for repository target path or URL
  const targetInput = await text({
    message: "Enter the repository path or GitHub URL to scan:",
    placeholder: "./",
    defaultValue: "./",
    validate: (value) => {
      if (!value || value.trim() === "") return "Please enter a valid path or URL.";
    }
  });

  if (isCancel(targetInput)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const target = String(targetInput).trim();
  const s = spinner();

  try {
    s.start(pc.cyan("Analyzing repository..."));

    await withRepository(
      target,
      async (scanPath) => {
        // Step 1: Scanner
        const state = await scanRepository(scanPath);
        s.stop(pc.green("Repository cloned & scanned"));

        log.step(pc.cyan("[1/6] Scanner: Crawled file tree & evaluated runtime detectors"));
        await sleep(150);

        // Step 2: Planner
        const plan = planWorkflow(state);
        const runtimeCount = state.runtime.length;
        const frameworkCount = state.frameworks.length;
        log.step(
          pc.cyan(
            `[2/6] Planner: Deduced ${plan.capabilities.length} capabilities across ${runtimeCount} runtimes & ${frameworkCount} frameworks`
          )
        );
        await sleep(150);

        // Step 3: Resolver
        const resolvedPlan = resolvePlan(plan);
        log.step(
          pc.cyan(
            `[3/6] Resolver: Resolved ${resolvedPlan.primitives.length} primitives from Starter Workflows Catalog`
          )
        );
        await sleep(150);

        // Step 4: Workflow Builder
        const ir = buildWorkflowIR(plan, resolvedPlan);
        log.step(
          pc.cyan(
            `[4/6] Builder: Partitioned primitives into ${ir.jobs.length} parallel jobs in Workflow IR`
          )
        );
        await sleep(150);

        // Step 5: Validation
        const validation = validateWorkflowIR(ir);
        if (!validation.valid) {
          throw new Error(`Workflow validation failed: ${validation.errors[0]?.message}`);
        }
        log.step(pc.cyan("[5/6] Compiler: Validated Execution Graph (DAG) cycle-freedom & safety invariants"));
        await sleep(150);

        // Rich Discovered Capabilities & Summary Box
        const summaryItems: string[] = [];

        if (state.runtime.length > 0) {
          const runtimes = state.runtime.map(r => pc.bold(pc.green(r.name))).join(", ");
          summaryItems.push(`  ${pc.bold("Runtimes:")}      ${runtimes}`);
        }

        if (state.packageManager.length > 0) {
          const pms = state.packageManager.map(p => pc.bold(pc.magenta(p.name))).join(", ");
          summaryItems.push(`  ${pc.bold("Package Mgrs:")}  ${pms}`);
        }

        if (state.frameworks.length > 0) {
          const frameworks = state.frameworks.map(f => pc.cyan(f.name)).join(", ");
          summaryItems.push(`  ${pc.bold("Frameworks:")}   ${frameworks}`);
        }

        if (state.infrastructure.length > 0) {
          const infra = state.infrastructure.map(i => pc.yellow(i.name)).join(", ");
          summaryItems.push(`  ${pc.bold("Infrastructure:")} ${infra}`);
        }

        summaryItems.push("");
        summaryItems.push(pc.bold("  Planned Policy Actions:"));
        for (const action of plan.actions) {
          summaryItems.push(`    → ${pc.cyan(action.id)}: ${action.reason}`);
        }

        note(summaryItems.join("\n"), "Analyzed Project Architecture");

        if (ir.jobs.length === 0) {
          outro(pc.yellow("No CI/CD actions could be planned for this repository."));
          return;
        }

        // 2. Interactive Job Selection Checkbox list
        const jobOptions = ir.jobs.map(job => {
          const needsTag = job.needs && job.needs.length > 0 ? ` (needs: [${job.needs.join(", ")}])` : "";
          const stepCount = `${job.steps.length} steps`;
          return {
            value: job.id,
            label: `${pc.bold(job.name ?? job.id)}`,
            hint: `${stepCount} on ${job.runsOn}${needsTag}`
          };
        });

        const selectedJobIds = await multiselect({
          message: "Select the CI/CD jobs you want to generate (Space to toggle, Enter to confirm):",
          options: jobOptions,
          initialValues: jobOptions.map(j => j.value),
          required: true
        });

        if (isCancel(selectedJobIds)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }

        const activeJobIds = new Set(selectedJobIds as string[]);

        // 3. Optimization Pass Toggles
        const enableCaching = await confirm({
          message: "⚡ Enable automatic dependency caching (npm/pnpm/yarn/pip/go/cargo)?",
          initialValue: true
        });

        if (isCancel(enableCaching)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }

        const enableHardening = await confirm({
          message: "🛡️  Enable production hardening (15m job timeouts & cancel-in-progress concurrency)?",
          initialValue: true
        });

        if (isCancel(enableHardening)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }

        // 4. Phase 6: Security Policy Level Selector
        const securityLevelInput = await select({
          message: "🔒 Select Security Policy Level:",
          options: [
            {
              value: "standard",
              label: "Standard (Recommended)",
              hint: "CodeQL SAST + Container Scans + Dependabot + Audits"
            },
            {
              value: "strict",
              label: "Strict",
              hint: "Harden-Runner + Gitleaks + Daily Dependabot + Zero-tolerance gating"
            },
            {
              value: "minimal",
              label: "Minimal",
              hint: "Dependabot + Native lockfile audits only"
            },
            {
              value: "none",
              label: "None",
              hint: "Skip security configuration"
            }
          ],
          initialValue: "standard"
        });

        if (isCancel(securityLevelInput)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }

        const securityLevel = securityLevelInput as SecurityLevel;

        log.step(pc.cyan(`[6/6] Security: Compiling security policies for level '${securityLevel}'`));
        const securityArtifacts = compileSecurityPolicy(state, securityLevel);

        // Filter WorkflowIR jobs by user selection
        const filteredJobs = ir.jobs
          .filter(j => activeJobIds.has(j.id))
          .map(j => ({
            ...j,
            needs: j.needs ? j.needs.filter(need => activeJobIds.has(need)) : undefined
          }));

        const filteredIR = {
          ...ir,
          jobs: filteredJobs
        };

        // Phase 5: Compile YAML with chosen optimization passes
        const compiledCiYaml = compileWorkflowYAML(filteredIR, {
          state,
          plan,
          resolved: resolvedPlan,
          options: {
            enableCaching: Boolean(enableCaching),
            enableHardening: Boolean(enableHardening)
          }
        });

        // Show Previews
        note(compiledCiYaml, "Generated Workflow (.github/workflows/ci.yml)");

        if (securityArtifacts.dependabotYaml) {
          note(securityArtifacts.dependabotYaml, "Generated Dependabot (.github/dependabot.yml)");
        }
        if (securityArtifacts.codeqlYaml) {
          note(securityArtifacts.codeqlYaml, "Generated CodeQL SAST (.github/workflows/codeql.yml)");
        }
        if (securityArtifacts.securityWorkflowYaml) {
          note(securityArtifacts.securityWorkflowYaml, "Generated Security Scans (.github/workflows/security.yml)");
        }

        // 5. Save Files (Remote repo vs Local repo)
        if (isRemoteUrl(target)) {
          const repoName = target.split("/").pop()?.replace(/\.git$/, "") || "repo";
          const defaultSaveDir = `./${repoName}-ci`;

          const shouldSave = await confirm({
            message: `Would you like to save the generated CI/CD & Security files to a local directory?`,
            initialValue: true
          });

          if (isCancel(shouldSave) || !shouldSave) {
            outro(pc.green(`✨ Workflow preview complete for remote repo ${target}!`));
            return;
          }

          const saveDirInput = await text({
            message: "Enter the directory path to save the configuration files:",
            placeholder: defaultSaveDir,
            defaultValue: defaultSaveDir,
            validate: (val) => {
              if (!val || val.trim() === "") return "Please enter a valid directory path.";
            }
          });

          if (isCancel(saveDirInput)) {
            cancel("Operation cancelled.");
            process.exit(0);
          }

          const baseDir = path.resolve(process.cwd(), String(saveDirInput).trim());
          const workflowsDir = path.join(baseDir, ".github", "workflows");
          const githubDir = path.join(baseDir, ".github");

          await fs.mkdir(workflowsDir, { recursive: true });
          await fs.writeFile(path.join(workflowsDir, "ci.yml"), compiledCiYaml, "utf8");

          if (securityArtifacts.dependabotYaml) {
            await fs.writeFile(path.join(githubDir, "dependabot.yml"), securityArtifacts.dependabotYaml, "utf8");
          }
          if (securityArtifacts.codeqlYaml) {
            await fs.writeFile(path.join(workflowsDir, "codeql.yml"), securityArtifacts.codeqlYaml, "utf8");
          }
          if (securityArtifacts.securityWorkflowYaml) {
            await fs.writeFile(path.join(workflowsDir, "security.yml"), securityArtifacts.securityWorkflowYaml, "utf8");
          }

          outro(
            pc.green(
              `✨ Successfully saved all CI/CD and Security configurations to ${pc.bold(baseDir)}\n\n` +
              `   Files created:\n` +
              `   - .github/workflows/ci.yml\n` +
              (securityArtifacts.dependabotYaml ? `   - .github/dependabot.yml\n` : "") +
              (securityArtifacts.codeqlYaml ? `   - .github/workflows/codeql.yml\n` : "") +
              (securityArtifacts.securityWorkflowYaml ? `   - .github/workflows/security.yml\n` : "")
            )
          );
          return;
        }

        // Local Repo Write
        const shouldWrite = await confirm({
          message: `Write generated CI/CD and Security configurations to ${pc.cyan(target)}?`,
          initialValue: true
        });

        if (isCancel(shouldWrite) || !shouldWrite) {
          outro(pc.yellow("Generation skipped (files not written to disk)."));
          return;
        }

        const targetWorkflowsDir = path.resolve(target, ".github", "workflows");
        const targetGithubDir = path.resolve(target, ".github");

        await fs.mkdir(targetWorkflowsDir, { recursive: true });
        await fs.writeFile(path.join(targetWorkflowsDir, "ci.yml"), compiledCiYaml, "utf8");

        if (securityArtifacts.dependabotYaml) {
          await fs.writeFile(path.join(targetGithubDir, "dependabot.yml"), securityArtifacts.dependabotYaml, "utf8");
        }
        if (securityArtifacts.codeqlYaml) {
          await fs.writeFile(path.join(targetWorkflowsDir, "codeql.yml"), securityArtifacts.codeqlYaml, "utf8");
        }
        if (securityArtifacts.securityWorkflowYaml) {
          await fs.writeFile(path.join(targetWorkflowsDir, "security.yml"), securityArtifacts.securityWorkflowYaml, "utf8");
        }

        outro(
          pc.green(
            `✨ Successfully wrote CI/CD and Security files to ${pc.bold(target)}\n\n` +
            `   Next steps:\n` +
            `   1. git add .github/\n` +
            `   2. git commit -m "ci: add zero-config CI/CD and security automation"\n` +
            `   3. git push origin main`
          )
        );
      },
      (msg) => {
        s.message(pc.cyan(msg));
      }
    );
  } catch (error) {
    s.stop(pc.red("Error occurred"));
    console.error(pc.red(`\n[Error] ${error instanceof Error ? error.message : error}`));
    process.exit(1);
  }
}
