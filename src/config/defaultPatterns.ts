import { CategoryId, LanguageMode } from "../models/category";

export type PatternMap = Record<CategoryId, string[]>;

const tsJsPatterns: PatternMap = {
  pageObjects: ["pages/**/*.ts", "pages/**/*.js", "**/*.page.ts", "**/*.page.js", "**/*.po.ts", "**/*.po.js"],
  dataResources: ["data/**", "resources/**", "test-data/**", "**/*.json", "**/*.csv", "**/.env", "**/.env.*"],
  tests: [
    "**/tests/**/*.spec.ts",
    "**/tests/**/*.test.ts",
    "**/tests/**/*.spec.tsx",
    "**/tests/**/*.test.tsx",
    "**/tests/**/*.spec.js",
    "**/tests/**/*.test.js",
    "**/tests/**/*.spec.jsx",
    "**/tests/**/*.test.jsx",
    "**/e2e/**/*.spec.ts",
    "**/e2e/**/*.test.ts",
    "**/e2e/**/*.spec.js",
    "**/e2e/**/*.test.js"
  ],
  reports: ["**/playwright-report/**/*.html", "**/allure-report/**/*.html", "**/reports/**/*.html", "**/reports/**/*.xml"],
  fixtures: ["fixtures/**", "tests/fixtures/**"],
  utils: ["**/utils/**/*", "**/helpers/**/*", "**/common/utils/**/*", "**/shared/utils/**/*"],
  github: [
    "**/AGENTS.md",
    "**/copilot-instructions.md",
    "**/*.instructions.md",
    "**/*.prompt.md",
    "**/*.agent.md",
    "**/SKILL.md",
    "**/.github/hooks/**/*",
    "**/.github/instructions/**/*",
    "**/.github/skills/**/*",
    "**/.github/prompts/**/*"
  ]
};

const pythonPatterns: PatternMap = {
  pageObjects: ["pages/**/*.py", "page_objects/**/*.py", "**/*_page.py"],
  dataResources: ["data/**", "resources/**", "test_data/**", "**/*.json", "**/*.csv", "**/*.yaml", "**/*.yml", "**/.env", "**/.env.*"],
  tests: ["**/tests/**/test_*.py", "**/tests/**/*_test.py", "**/e2e/**/test_*.py", "**/e2e/**/*_test.py"],
  reports: ["**/playwright-report/**/*.html", "**/allure-report/**/*.html", "**/reports/**/*.html", "**/reports/**/*.xml"],
  fixtures: ["tests/conftest.py", "**/conftest.py", "fixtures/**/*.py"],
  utils: ["**/utils/**/*.py", "**/helpers/**/*.py", "**/common/utils/**/*.py", "**/shared/utils/**/*.py"],
  github: [
    "**/AGENTS.md",
    "**/copilot-instructions.md",
    "**/*.instructions.md",
    "**/*.prompt.md",
    "**/*.agent.md",
    "**/SKILL.md",
    "**/.github/hooks/**/*",
    "**/.github/instructions/**/*",
    "**/.github/skills/**/*",
    "**/.github/prompts/**/*"
  ]
};

export function getDefaultPatterns(mode: LanguageMode): PatternMap {
  return mode === "python" ? pythonPatterns : tsJsPatterns;
}
