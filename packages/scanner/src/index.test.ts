import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { scanRepository } from "./index.js";

const FIXTURES_DIR = join(import.meta.dirname, "../fixtures");

describe("Scanner - Real Project Snapshots", () => {
  it("detects BitTorrent (Go project)", async () => {
    const state = await scanRepository(join(FIXTURES_DIR, "bittorrent"));
    expect(state).toMatchInlineSnapshot(`
      {
        "frameworks": [],
        "infrastructure": [],
        "packageManager": [],
        "runtime": [
          {
            "evidence": [
              {
                "source": "go.mod",
                "value": "go 1.25.5",
              },
            ],
            "name": "go",
            "version": "1.25.5",
          },
        ],
        "testing": [],
        "tooling": [],
      }
    `);
  });

  it("detects Spotiflix (Docker Compose)", async () => {
    const state = await scanRepository(join(FIXTURES_DIR, "spotiflix"));
    expect(state).toMatchInlineSnapshot(`
      {
        "frameworks": [],
        "infrastructure": [
          {
            "evidence": [
              {
                "source": "docker-compose.yml",
                "value": "Compose configuration detected",
              },
            ],
            "name": "docker-compose",
          },
        ],
        "packageManager": [],
        "runtime": [],
        "testing": [],
        "tooling": [],
      }
    `);
  });

  it("detects PersonalAssistant (Python project)", async () => {
    const state = await scanRepository(join(FIXTURES_DIR, "personal-assistant"));
    expect(state).toMatchInlineSnapshot(`
      {
        "frameworks": [],
        "infrastructure": [],
        "packageManager": [],
        "runtime": [
          {
            "evidence": [
              {
                "source": "requirements.txt",
                "value": "Python project detected",
              },
            ],
            "name": "python",
          },
        ],
        "testing": [],
        "tooling": [],
      }
    `);
  });
});
