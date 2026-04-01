import * as vscode from "vscode";
import { HookService } from "../services/hookService";
import { PlaywrightTreeNode } from "../models/treeNode";

export class HooksProvider implements vscode.TreeDataProvider<PlaywrightTreeNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<PlaywrightTreeNode | undefined>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  public constructor(private readonly hookService: HookService) {
    this.hookService.onDidChangeHooks(() => this.refresh());
  }

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  public async getChildren(): Promise<PlaywrightTreeNode[]> {
    const hooks = this.hookService.getHooks();
    if (!hooks.length) {
      return [{ type: "message", label: "No hooks configured. Use 'Create Hook'." }];
    }

    return hooks.map((hook) => ({
      type: "hook",
      hookId: hook.id,
      label: hook.name,
      description: `${hook.enabled ? "Enabled" : "Disabled"} | ${hook.matchGlob}`,
      enabled: hook.enabled
    }));
  }

  public getTreeItem(element: PlaywrightTreeNode): vscode.TreeItem {
    if (element.type === "message") {
      return new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
    }

    if (element.type === "hook") {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
      item.description = element.description;
      item.contextValue = "hookItem";
      item.iconPath = new vscode.ThemeIcon(element.enabled ? "check" : "circle-slash");
      item.command = {
        command: "playwrightDesigner.hooks.runNow",
        title: "Run Hook Now",
        arguments: [element.hookId]
      };
      return item;
    }

    return new vscode.TreeItem("Unsupported node", vscode.TreeItemCollapsibleState.None);
  }
}
