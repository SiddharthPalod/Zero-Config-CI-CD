import { execSync } from "node:child_process";
import type { GitHubAuthStatus } from "./types.js";

export function checkGitHubAuth(): GitHubAuthStatus {
  // 1. Check GITHUB_TOKEN / GH_TOKEN env variables
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (envToken && envToken.trim() !== "") {
    return {
      isAuthenticated: true,
      authMethod: "token"
    };
  }

  // 2. Check GitHub CLI (`gh auth status`)
  try {
    const output = execSync("gh auth status", {
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf8"
    });

    const match = output.match(/Logged in to [^\s]+ account ([^\s]+)/i);
    const username = match ? match[1] : undefined;

    return {
      isAuthenticated: true,
      username,
      authMethod: "gh-cli"
    };
  } catch (err: any) {
    const stderr = err?.stderr?.toString() || err?.message || "";
    // gh auth status sometimes writes to stderr even when successful in older versions
    if (stderr.includes("Logged in to")) {
      return {
        isAuthenticated: true,
        authMethod: "gh-cli"
      };
    }

    return {
      isAuthenticated: false,
      authMethod: "none",
      error: "GitHub CLI (gh) is not installed or not logged in. Run 'gh auth login' to enable automated PRs."
    };
  }
}
