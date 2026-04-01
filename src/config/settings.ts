import * as vscode from "vscode";
import { PatternMap, getDefaultPatterns } from "./defaultPatterns";
import { HookDefinition } from "../models/hook";
import { LanguageMode } from "../models/category";

export interface DesignerSettings {
  languageMode: LanguageMode;
  maxFilesPerCategory: number;
  patterns: PatternMap;
  hooks: HookDefinition[];
}

function toLanguageMode(value: unknown): LanguageMode {
  return value === "python" ? "python" : "ts-js";
}

function mergePatterns(defaults: PatternMap, custom: unknown): PatternMap {
  if (!custom || typeof custom !== "object") {
    return defaults;
  }

  const output: PatternMap = {
    pageObjects: [...defaults.pageObjects],
    dataResources: [...defaults.dataResources],
    tests: [...defaults.tests],
    reports: [...defaults.reports],
    fixtures: [...defaults.fixtures],
    utils: [...defaults.utils]
  };

  for (const key of Object.keys(output) as Array<keyof PatternMap>) {
    const next = (custom as Record<string, unknown>)[key];
    if (Array.isArray(next) && next.every((item) => typeof item === "string")) {
      output[key] = next;
    }
  }

  return output;
}

function toFolderPattern(folderPath: string): string | undefined {
  const normalized = folderPath.trim().replace(/\\/g, "/").replace(/^\.?\//, "");
  if (!normalized) {
    return undefined;
  }

  if (normalized.endsWith("/**")) {
    return normalized;
  }

  if (normalized.endsWith("/")) {
    return `${normalized}**`;
  }

  return `${normalized}/**`;
}

function applyFolderMappings(patterns: PatternMap, mappings: unknown): PatternMap {
  if (!mappings || typeof mappings !== "object") {
    return patterns;
  }

  const output: PatternMap = {
    pageObjects: [...patterns.pageObjects],
    dataResources: [...patterns.dataResources],
    tests: [...patterns.tests],
    reports: [...patterns.reports],
    fixtures: [...patterns.fixtures],
    utils: [...patterns.utils]
  };

  for (const key of Object.keys(output) as Array<keyof PatternMap>) {
    const candidate = (mappings as Record<string, unknown>)[key];
    if (!Array.isArray(candidate)) {
      continue;
    }

    for (const rawFolder of candidate) {
      if (typeof rawFolder !== "string") {
        continue;
      }

      const folderPattern = toFolderPattern(rawFolder);
      if (!folderPattern) {
        continue;
      }

      if (!output[key].includes(folderPattern)) {
        output[key].push(folderPattern);
      }
    }
  }

  return output;
}

function normalizeHook(candidate: unknown): HookDefinition | undefined {
  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }

  const raw = candidate as Record<string, unknown>;
  const id = typeof raw.id === "string" && raw.id.trim() ? raw.id : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const command = typeof raw.command === "string" ? raw.command.trim() : "";

  if (!name || !command) {
    return undefined;
  }

  const trigger = raw.trigger === "onTestSave" ? "onTestSave" : "onTestSave";
  const matchGlob = typeof raw.matchGlob === "string" && raw.matchGlob.trim() ? raw.matchGlob : "**/*";
  const enabled = raw.enabled !== false;
  const cwd = typeof raw.cwd === "string" && raw.cwd.trim() ? raw.cwd : undefined;

  let env: Record<string, string> | undefined;
  if (raw.env && typeof raw.env === "object") {
    env = {};
    for (const [key, value] of Object.entries(raw.env as Record<string, unknown>)) {
      if (typeof value === "string") {
        env[key] = value;
      }
    }
  }

  return { id, name, enabled, trigger, matchGlob, command, cwd, env };
}

export function getDesignerSettings(): DesignerSettings {
  const config = vscode.workspace.getConfiguration("playwrightDesigner");
  const mode = toLanguageMode(config.get<string>("languageMode"));
  const maxFiles = Math.max(100, config.get<number>("maxFilesPerCategory", 2000));
  const defaults = getDefaultPatterns(mode);

  const basePatterns = mergePatterns(defaults, config.get<unknown>("customPatterns"));
  const patterns = applyFolderMappings(basePatterns, config.get<unknown>("folderMappings"));
  const rawHooks = config.get<unknown[]>("hooks", []);
  const hooks = rawHooks.map((item) => normalizeHook(item)).filter((item): item is HookDefinition => Boolean(item));

  return {
    languageMode: mode,
    maxFilesPerCategory: maxFiles,
    patterns,
    hooks
  };
}
