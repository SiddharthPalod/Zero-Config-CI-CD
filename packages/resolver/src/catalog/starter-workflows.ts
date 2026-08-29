import type { StarterWorkflowCatalog } from "./types.js";

export const STARTER_WORKFLOWS_CATALOG: StarterWorkflowCatalog = {
  "ci/node.js.yml": {
    id: "ci/node.js.yml",
    name: "Node.js Package",
    description: "Build and test a Node.js package with npm, pnpm, or yarn.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml",
    languages: ["javascript", "typescript"],
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
    name: "Go",
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
    name: "Python application",
    description: "Create and test a Python application on multiple Python versions.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/python-app.yml",
    languages: ["python"],
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
        id: "cargo-check",
        name: "Check",
        category: "build",
        kind: "run",
        run: "cargo check --verbose"
      },
      {
        id: "cargo-test",
        name: "Run tests",
        category: "test",
        kind: "run",
        run: "cargo test --verbose"
      },
      {
        id: "cargo-build",
        name: "Build",
        category: "build",
        kind: "run",
        run: "cargo build --verbose"
      }
    ]
  },

  "ci/maven.yml": {
    id: "ci/maven.yml",
    name: "Java with Maven",
    description: "Build and test a Java project with Apache Maven.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/maven.yml",
    languages: ["java"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "setup-java",
        name: "Set up JDK",
        category: "setup",
        kind: "uses",
        uses: "actions/setup-java@v4",
        with: {
          "java-version": "17",
          distribution: "temurin",
          cache: "maven"
        }
      },
      {
        id: "maven-package",
        name: "Build with Maven",
        category: "build",
        kind: "run",
        run: "mvn -B package --file pom.xml"
      }
    ]
  },

  "ci/gradle.yml": {
    id: "ci/gradle.yml",
    name: "Java with Gradle",
    description: "Build and test a Java project with Gradle.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/gradle.yml",
    languages: ["java"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "setup-java",
        name: "Set up JDK",
        category: "setup",
        kind: "uses",
        uses: "actions/setup-java@v4",
        with: {
          "java-version": "17",
          distribution: "temurin"
        }
      },
      {
        id: "setup-gradle",
        name: "Setup Gradle",
        category: "setup",
        kind: "uses",
        uses: "gradle/actions/setup-gradle@v4"
      },
      {
        id: "gradle-build",
        name: "Build with Gradle",
        category: "build",
        kind: "run",
        run: "./gradlew build"
      }
    ]
  },

  "ci/dotnet.yml": {
    id: "ci/dotnet.yml",
    name: ".NET",
    description: "Build and test a .NET project.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/dotnet.yml",
    languages: ["csharp", "fsharp"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "setup-dotnet",
        name: "Setup .NET SDK",
        category: "setup",
        kind: "uses",
        uses: "actions/setup-dotnet@v4",
        with: {
          "dotnet-version": "8.0.x"
        }
      },
      {
        id: "dotnet-restore",
        name: "Restore dependencies",
        category: "dependency",
        kind: "run",
        run: "dotnet restore"
      },
      {
        id: "dotnet-build",
        name: "Build",
        category: "build",
        kind: "run",
        run: "dotnet build --no-restore"
      },
      {
        id: "dotnet-test",
        name: "Test",
        category: "test",
        kind: "run",
        run: "dotnet test --no-build --verbosity normal"
      }
    ]
  },

  "ci/ruby.yml": {
    id: "ci/ruby.yml",
    name: "Ruby",
    description: "Build and test a Ruby project with Bundler.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/ruby.yml",
    languages: ["ruby"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "setup-ruby",
        name: "Set up Ruby",
        category: "setup",
        kind: "uses",
        uses: "ruby/setup-ruby@v1",
        with: {
          "ruby-version": "3.2",
          "bundler-cache": true
        }
      },
      {
        id: "bundle-exec-rake",
        name: "Run tests",
        category: "test",
        kind: "run",
        run: "bundle exec rake"
      }
    ]
  },

  "ci/php.yml": {
    id: "ci/php.yml",
    name: "PHP",
    description: "Build and test a PHP project with Composer and PHPUnit.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/php.yml",
    languages: ["php"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "setup-php",
        name: "Setup PHP",
        category: "setup",
        kind: "uses",
        uses: "shivammathur/setup-php@v2",
        with: {
          "php-version": "8.2"
        }
      },
      {
        id: "composer-install",
        name: "Install dependencies",
        category: "dependency",
        kind: "run",
        run: "composer install -q --no-ansi --no-interaction --no-scripts --no-progress --prefer-dist"
      },
      {
        id: "phpunit",
        name: "Execute tests via PHPUnit",
        category: "test",
        kind: "run",
        run: "vendor/bin/phpunit"
      }
    ]
  },

  "ci/dart.yml": {
    id: "ci/dart.yml",
    name: "Dart",
    description: "Build and test a Dart project.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/dart.yml",
    languages: ["dart"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "setup-dart",
        name: "Setup Dart SDK",
        category: "setup",
        kind: "uses",
        uses: "dart-lang/setup-dart@v1"
      },
      {
        id: "dart-pub-get",
        name: "Install dependencies",
        category: "dependency",
        kind: "run",
        run: "dart pub get"
      },
      {
        id: "dart-test",
        name: "Run tests",
        category: "test",
        kind: "run",
        run: "dart test"
      }
    ]
  },

  "ci/elixir.yml": {
    id: "ci/elixir.yml",
    name: "Elixir",
    description: "Build and test an Elixir project with Mix.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/elixir.yml",
    languages: ["elixir"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "setup-beam",
        name: "Set up BEAM",
        category: "setup",
        kind: "uses",
        uses: "erlef/setup-beam@v1",
        with: {
          "elixir-version": "1.15",
          "otp-version": "26.0"
        }
      },
      {
        id: "mix-deps",
        name: "Restore dependencies cache and fetch",
        category: "dependency",
        kind: "run",
        run: "mix deps.get"
      },
      {
        id: "mix-test",
        name: "Run tests",
        category: "test",
        kind: "run",
        run: "mix test"
      }
    ]
  },

  "ci/cmake-single-platform.yml": {
    id: "ci/cmake-single-platform.yml",
    name: "CMake",
    description: "Build and test a C/C++ project using CMake on a single platform.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/cmake-single-platform.yml",
    languages: ["c", "cpp"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "cmake-configure",
        name: "Configure CMake",
        category: "build",
        kind: "run",
        run: "cmake -B ${{github.workspace}}/build -DCMAKE_BUILD_TYPE=Release"
      },
      {
        id: "cmake-build",
        name: "Build",
        category: "build",
        kind: "run",
        run: "cmake --build ${{github.workspace}}/build --config Release"
      },
      {
        id: "ctest",
        name: "Test",
        category: "test",
        kind: "run",
        run: "ctest --test-dir ${{github.workspace}}/build --output-on-failure -C Release"
      }
    ]
  },

  "ci/deno.yml": {
    id: "ci/deno.yml",
    name: "Deno",
    description: "Build and test a Deno project.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/deno.yml",
    languages: ["typescript", "javascript"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "setup-deno",
        name: "Setup Deno",
        category: "setup",
        kind: "uses",
        uses: "denoland/setup-deno@v2",
        with: {
          "deno-version": "v1.x"
        }
      },
      {
        id: "deno-test",
        name: "Run tests",
        category: "test",
        kind: "run",
        run: "deno test"
      }
    ]
  },

  "ci/swift.yml": {
    id: "ci/swift.yml",
    name: "Swift",
    description: "Build and test a Swift package.",
    sourceUrl: "https://github.com/actions/starter-workflows/blob/main/ci/swift.yml",
    languages: ["swift"],
    triggers: ["push", "pull_request"],
    steps: [
      {
        id: "swift-build",
        name: "Build",
        category: "build",
        kind: "run",
        run: "swift build -v"
      },
      {
        id: "swift-test",
        name: "Run tests",
        category: "test",
        kind: "run",
        run: "swift test -v"
      }
    ]
  }
};
