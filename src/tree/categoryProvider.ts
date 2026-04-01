import * as vscode from "vscode";
import { CategoryId } from "../models/category";
import { PlaywrightTreeNode } from "../models/treeNode";
import { WorkspaceScanner } from "../services/workspaceScanner";

type FileCategory = Exclude<CategoryId, "hooks">;

export class CategoryProvider implements vscode.TreeDataProvider<PlaywrightTreeNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<PlaywrightTreeNode | undefined>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  public constructor(private readonly category: FileCategory, private readonly scanner: WorkspaceScanner) {}

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  public async getChildren(element?: PlaywrightTreeNode): Promise<PlaywrightTreeNode[]> {
    const folders = vscode.workspace.workspaceFolders ?? [];
    const withMatches = this.scanner.getFoldersWithFiles(this.category);
    const allEntries = this.dedupeEntries(
      withMatches.flatMap((folder) => this.scanner.getFiles(this.category, folder).map((uri) => ({ folder, uri })))
    );
    const nameCounts = this.getFileNameCounts(allEntries.map((entry) => entry.uri));

    if (!element) {
      if (!folders.length) {
        return [{ type: "message", label: "Open a workspace to view files." }];
      }

      if (!withMatches.length) {
        return [{ type: "message", label: "No files found for this category." }];
      }

      if (withMatches.length === 1) {
        return this.toFileNodes(allEntries, nameCounts);
      }

      return withMatches.map((folder) => ({ type: "workspace", folder }));
    }

    if (element.type === "workspace") {
      const entries = allEntries.filter((entry) => entry.folder.uri.toString() === element.folder.uri.toString());
      return this.toFileNodes(entries, nameCounts, true);
    }

    return [];
  }

  public getTreeItem(element: PlaywrightTreeNode): vscode.TreeItem {
    if (element.type === "message") {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
      item.contextValue = "messageItem";
      return item;
    }

    if (element.type === "workspace") {
      const item = new vscode.TreeItem(element.folder.name, vscode.TreeItemCollapsibleState.Expanded);
      item.description = "workspace";
      item.contextValue = "workspaceItem";
      item.resourceUri = element.folder.uri;
      return item;
    }

    if (element.type === "file") {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
      item.description = element.description;
      item.resourceUri = element.uri;
      item.contextValue = "fileItem";
      item.command = {
        command: "playwrightDesigner.openFile",
        title: "Open File",
        arguments: [element.uri]
      };
      return item;
    }

    return new vscode.TreeItem("Unsupported node", vscode.TreeItemCollapsibleState.None);
  }

  private toFileNodes(
    entries: Array<{ folder: vscode.WorkspaceFolder; uri: vscode.Uri }>,
    nameCounts: Map<string, number>,
    includeFolderInDescription?: boolean
  ): PlaywrightTreeNode[] {
    return entries.map(({ folder, uri }) => {
      const fileName = uri.path.split("/").pop() ?? uri.fsPath;
      const duplicateName = (nameCounts.get(fileName) ?? 0) > 1;
      const relativePath = vscode.workspace.asRelativePath(uri, false);
      const relativeDirectory = relativePath.includes("/") ? relativePath.slice(0, relativePath.lastIndexOf("/")) : "";

      return {
        type: "file",
        folder,
        uri,
        label: fileName,
        description: duplicateName
          ? relativeDirectory || folder.name
          : includeFolderInDescription
            ? folder.name
            : undefined
      };
    });
  }

  private getFileNameCounts(uris: vscode.Uri[]): Map<string, number> {
    const counts = new Map<string, number>();

    for (const uri of uris) {
      const fileName = uri.path.split("/").pop() ?? uri.fsPath;
      counts.set(fileName, (counts.get(fileName) ?? 0) + 1);
    }

    return counts;
  }

  private dedupeEntries(
    entries: Array<{ folder: vscode.WorkspaceFolder; uri: vscode.Uri }>
  ): Array<{ folder: vscode.WorkspaceFolder; uri: vscode.Uri }> {
    const byUri = new Map<string, { folder: vscode.WorkspaceFolder; uri: vscode.Uri }>();

    for (const entry of entries) {
      const key = entry.uri.toString();
      if (!byUri.has(key)) {
        byUri.set(key, entry);
      }
    }

    return Array.from(byUri.values());
  }
}
