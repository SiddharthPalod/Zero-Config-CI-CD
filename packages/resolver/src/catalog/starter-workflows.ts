import type { StarterWorkflowCatalog } from "./types.js";

export const STARTER_WORKFLOWS_CATALOG: StarterWorkflowCatalog = {
  "ci/node.js.yml": {
    id: "ci/node.js.yml",
    name: "Node.js CI",
    description: "Build and test a Node.js project with npm, yarn, or pnpm.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml",
    languages: ["javascript", "typescript"],
    triggers: ["push", "pull_request"],
    defaultMatrix: {
      key: "node-version",
      values: ["18.x", "20.x", "22.x"]
    },
    steps: [
      {
        id: "checkout",
        name: "Checkout repository",
        category: "checkout",
        kind: "uses",
        uses: "actions/checkout@v4"
      },
      {
        id: "setup-node",
        name: "Use Node.js ${{ matrix.node-version }}",
        category: "setup",
        kind: "uses",
        uses: "actions/setup-node@v4",
        with: {
          "node-version": "20.x"
        }
      },
      {
        id: "npm-ci",
        name: "Install dependencies",
        category: "dependency",
        kind: "run",
        run: "npm ci"
      },
      {
        id: "npm-build",
        name: "Build",
        category: "build",
        kind: "run",
        run: "npm run build --if-present"
      },
      {
        id: "npm-test",
        name: "Test",
        category: "test",
        kind: "run",
        run: "npm test"
      }
    ]
  },

  "ci/go.yml": {
    id: "ci/go.yml",
    name: "Go CI",
    description: "Build and test a Go project.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/go.yml",
    languages: ["go"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "checkout",
        name: "Checkout repository",
        category: "checkout",
        kind: "uses",
        uses: "actions/checkout@v4"
      },
      {
        id: "setup-go",
        name: "Set up Go",
        category: "setup",
        kind: "uses",
        uses: "actions/setup-go@v5",
        with: {
          "go-version": "1.22"
        }
      },
      {
        id: "go-build",
        name: "Build",
        category: "build",
        kind: "run",
        run: "go build -v ./..."
      },
      {
        id: "go-test",
        name: "Test",
        category: "test",
        kind: "run",
        run: "go test -v ./..."
      }
    ]
  },

  "ci/python-app.yml": {
    id: "ci/python-app.yml",
    name: "Python Application CI",
    description: "Create and test a Python application on multiple Python versions.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/python-app.yml",
    languages: ["python"],
    triggers: ["push", "pull_request"],
    defaultMatrix: {
      key: "python-version",
      values: ["3.10", "3.11", "3.12"]
    },
    steps: [
      {
        id: "checkout",
        name: "Checkout repository",
        category: "checkout",
        kind: "uses",
        uses: "actions/checkout@v4"
      },
      {
        id: "setup-python",
        name: "Set up Python ${{ matrix.python-version }}",
        category: "setup",
        kind: "uses",
        uses: "actions/setup-python@v5",
        with: {
          "python-version": "3.x"
        }
      },
      {
        id: "pip-install",
        name: "Install dependencies",
        category: "dependency",
        kind: "run",
        run: "python -m pip install --upgrade pip\nif [ -f requirements.txt ]; then pip install -r requirements.txt; fi"
      },
      {
        id: "pytest",
        name: "Test with pytest",
        category: "test",
        kind: "run",
        run: "pytest"
      }
    ]
  },

  "ci/docker-image.yml": {
    id: "ci/docker-image.yml",
    name: "Docker Image CI",
    description: "Build a Docker container image.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/docker-image.yml",
    languages: ["docker"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "checkout",
        name: "Checkout repository",
        category: "checkout",
        kind: "uses",
        uses: "actions/checkout@v4"
      },
      {
        id: "setup-buildx",
        name: "Set up Docker Buildx",
        category: "setup",
        kind: "uses",
        uses: "docker/setup-buildx-action@v3"
      },
      {
        id: "docker-build",
        name: "Build the Docker image",
        category: "docker",
        kind: "uses",
        uses: "docker/build-push-action@v6",
        with: {
          push: false
        }
      }
    ]
  },

  "ci/rust.yml": {
    id: "ci/rust.yml",
    name: "Rust CI",
    description: "Build and test a Rust project with Cargo.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/rust.yml",
    languages: ["rust"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "checkout",
        name: "Checkout repository",
        category: "checkout",
        kind: "uses",
        uses: "actions/checkout@v4"
      },
      {
        id: "cargo-build",
        name: "Build",
        category: "build",
        kind: "run",
        run: "cargo build --verbose"
      },
      {
        id: "cargo-test",
        name: "Run tests",
        category: "test",
        kind: "run",
        run: "cargo test --verbose"
      }
    ]
  }
};
