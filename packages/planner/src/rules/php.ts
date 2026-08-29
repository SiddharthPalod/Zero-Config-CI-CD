import type { Rule } from "../types.js";
import { findCapability, formatEvidence, noMatch } from "./helpers.js";

export const phpRule: Rule = {
  id: "php-ci",
  description: "Setup PHP, install Composer dependencies, and run PHPUnit.",

  evaluate(_state, capabilities) {
    const phpCap = findCapability(capabilities, "runtime.php");
    if (!phpCap) return noMatch();

    return {
      matched: true,
      actions: [
        {
          id: "php-setup",
          type: "runtime.setup",
          inputs: {
            runtime: "php",
            version: phpCap.version ?? "8.2"
          },
          reason: "PHP runtime setup with Composer.",
          sourceRule: "php-ci"
        },
        {
          id: "php-test",
          type: "php.test",
          reason: "Run PHP tests via PHPUnit / Pest.",
          sourceRule: "php-ci"
        }
      ],
      reasons: ["PHP project detected.", ...formatEvidence(phpCap)]
    };
  }
};
