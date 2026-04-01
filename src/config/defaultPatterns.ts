import { CategoryId, LanguageMode } from "../models/category";

export type PatternMap = Record<Exclude<CategoryId, "hooks">, string[]>;

const tsJsPatterns: PatternMap = {
  pageObjects: ["pages/**/*.ts", "pages/**/*.js", "**/*.page.ts", "**/*.page.js", "**/*.po.ts", "**/*.po.js"],
  dataResources: ["data/**", "resources/**", "test-data/**", "**/*.json", "**/*.csv", "**/.env", "**/.env.*"],
  tests: ["tests/**/*.spec.ts", "tests/**/*.test.ts", "tests/**/*.spec.js", "tests/**/*.test.js", "e2e/**/*.spec.ts", "e2e/**/*.test.ts"],
  reports: ["playwright-report/**", "allure-report/**", "reports/**"],
  fixtures: ["fixtures/**", "tests/fixtures/**"],
  utils: ["utils/**", "tests/utils/**", "helpers/**"]
};

const pythonPatterns: PatternMap = {
  pageObjects: ["pages/**/*.py", "page_objects/**/*.py", "**/*_page.py"],
  dataResources: ["data/**", "resources/**", "test_data/**", "**/*.json", "**/*.csv", "**/*.yaml", "**/*.yml", "**/.env", "**/.env.*"],
  tests: ["tests/test_*.py", "tests/**/*_test.py", "e2e/test_*.py", "e2e/**/*_test.py"],
  reports: ["playwright-report/**", "allure-report/**", "reports/**"],
  fixtures: ["tests/conftest.py", "**/conftest.py", "fixtures/**/*.py"],
  utils: ["utils/**/*.py", "helpers/**/*.py"]
};

export function getDefaultPatterns(mode: LanguageMode): PatternMap {
  return mode === "python" ? pythonPatterns : tsJsPatterns;
}
