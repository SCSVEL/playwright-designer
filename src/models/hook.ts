export type HookTrigger = "onTestSave";

export interface HookDefinition {
  id: string;
  name: string;
  enabled: boolean;
  trigger: HookTrigger;
  matchGlob: string;
  command: string;
  cwd?: string;
  env?: Record<string, string>;
}
