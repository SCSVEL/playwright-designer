import * as vscode from "vscode";
import { minimatch } from "minimatch";
import { HookDefinition } from "../models/hook";
import { getDesignerSettings } from "../config/settings";

export class HookService {
  private readonly onDidChangeHooksEmitter = new vscode.EventEmitter<void>();
  public readonly onDidChangeHooks = this.onDidChangeHooksEmitter.event;
  private readonly runningHookIds = new Set<string>();
  private readonly recentRuns = new Map<string, number>();

  public getHooks(): HookDefinition[] {
    return getDesignerSettings().hooks;
  }

  public async createHook(): Promise<void> {
    const name = await vscode.window.showInputBox({ prompt: "Hook name", placeHolder: "Run related tests" });
    if (!name) {
      return;
    }

    const matchGlob =
      (await vscode.window.showInputBox({
        prompt: "Hook file match glob",
        placeHolder: "tests/**/*.spec.ts or tests/test_*.py",
        value: "**/*"
      })) ?? "**/*";

    const command = await vscode.window.showInputBox({
      prompt: "Command to execute after confirmation",
      placeHolder: "npx playwright test ${file}"
    });

    if (!command) {
      return;
    }

    const existing = this.getHooks();
    const hook: HookDefinition = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      enabled: true,
      trigger: "onTestSave",
      matchGlob,
      command,
      cwd: "${workspaceFolder}"
    };

    await this.saveHooks([...existing, hook]);
  }

  public async toggleHook(hookId: string): Promise<void> {
    const next = this.getHooks().map((hook) => (hook.id === hookId ? { ...hook, enabled: !hook.enabled } : hook));
    await this.saveHooks(next);
  }

  public async deleteHook(hookId: string): Promise<void> {
    const next = this.getHooks().filter((hook) => hook.id !== hookId);
    await this.saveHooks(next);
  }

  public async runHookNow(hookId: string): Promise<void> {
    const hook = this.getHooks().find((item) => item.id === hookId);
    if (!hook) {
      return;
    }

    await this.executeHook(hook, undefined, true);
  }

  public async processTestSave(relativePath: string, fileUri: vscode.Uri, workspaceFolder?: vscode.WorkspaceFolder): Promise<void> {
    const hooks = this.getHooks().filter((hook) => hook.enabled && hook.trigger === "onTestSave");

    for (const hook of hooks) {
      if (!minimatch(relativePath, hook.matchGlob, { dot: true })) {
        continue;
      }

      const now = Date.now();
      const runKey = `${hook.id}:${relativePath}`;
      const lastRun = this.recentRuns.get(runKey) ?? 0;
      if (now - lastRun < 1000) {
        continue;
      }

      this.recentRuns.set(runKey, now);
      await this.executeHook(hook, { relativePath, fileUri, workspaceFolder }, false);
    }
  }

  private async executeHook(
    hook: HookDefinition,
    fileContext?: { relativePath: string; fileUri: vscode.Uri; workspaceFolder?: vscode.WorkspaceFolder },
    skipConfirm?: boolean
  ): Promise<void> {
    if (this.runningHookIds.has(hook.id)) {
      return;
    }

    const fileArg = fileContext?.relativePath ?? "";
    const workspaceFolder = fileContext?.workspaceFolder?.uri.fsPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";

    const resolvedCommand = hook.command
      .replaceAll("${file}", fileArg)
      .replaceAll("${filePath}", fileContext?.fileUri.fsPath ?? "")
      .replaceAll("${workspaceFolder}", workspaceFolder);

    if (!skipConfirm) {
      const response = await vscode.window.showInformationMessage(
        `Run hook \"${hook.name}\" for ${fileArg}?`,
        { modal: false },
        "Run",
        "Skip"
      );

      if (response !== "Run") {
        return;
      }
    }

    this.runningHookIds.add(hook.id);

    try {
      const terminal = vscode.window.createTerminal({
        name: `PW Hook: ${hook.name}`,
        cwd: hook.cwd?.replaceAll("${workspaceFolder}", workspaceFolder) || workspaceFolder,
        env: hook.env
      });

      terminal.show(true);
      terminal.sendText(resolvedCommand, true);
    } finally {
      this.runningHookIds.delete(hook.id);
    }
  }

  private async saveHooks(hooks: HookDefinition[]): Promise<void> {
    const target = vscode.workspace.workspaceFolders?.length
      ? vscode.ConfigurationTarget.Workspace
      : vscode.ConfigurationTarget.Global;

    await vscode.workspace.getConfiguration("playwrightDesigner").update("hooks", hooks, target);
    this.onDidChangeHooksEmitter.fire();
  }
}
