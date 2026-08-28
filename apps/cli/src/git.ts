import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rmSync } from "node:fs";
import { randomUUID } from "node:crypto";

export function isRemoteUrl(target: string): boolean {
  return target.startsWith("https://github.com/") || target.startsWith("git@github.com:");
}

export async function withRepository<T>(
  target: string,
  action: (path: string) => Promise<T>
): Promise<T> {
  if (!isRemoteUrl(target)) {
    return action(target);
  }

  const tempPath = join(tmpdir(), `zcicd-scan-${randomUUID()}`);
  console.log(`Cloning remote repository: ${target} ...`);

  try {
    execSync(`git clone --depth 1 ${target} "${tempPath}"`, { stdio: "pipe" });
    return await action(tempPath);
  } finally {
    try {
      rmSync(tempPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors on temporary directories
    }
  }
}
