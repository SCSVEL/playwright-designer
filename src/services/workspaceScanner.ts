import * as vscode from "vscode";
import { DesignerSettings } from "../config/settings";
import { CategoryId } from "../models/category";

type FileCategory = Exclude<CategoryId, "hooks">;

export class WorkspaceScanner {
  private readonly byCategory = new Map<FileCategory, Map<string, vscode.Uri[]>>();

  public async refresh(settings: DesignerSettings): Promise<void> {
    const categories = Object.keys(settings.patterns) as FileCategory[];
    const workspaceFolders = vscode.workspace.workspaceFolders ?? [];

    this.byCategory.clear();

    for (const category of categories) {
      const folderMap = new Map<string, vscode.Uri[]>();
      for (const folder of workspaceFolders) {
        const files = await this.scanCategoryFolder(folder, category, settings.patterns[category], settings.maxFilesPerCategory);
        folderMap.set(folder.uri.toString(), files);
      }
      this.byCategory.set(category, folderMap);
    }
  }

  public getFiles(category: FileCategory, folder: vscode.WorkspaceFolder): vscode.Uri[] {
    const folderMap = this.byCategory.get(category);
    if (!folderMap) {
      return [];
    }

    return folderMap.get(folder.uri.toString()) ?? [];
  }

  public getFoldersWithFiles(category: FileCategory): vscode.WorkspaceFolder[] {
    const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
    return workspaceFolders.filter((folder) => this.getFiles(category, folder).length > 0);
  }

  private async scanCategoryFolder(
    folder: vscode.WorkspaceFolder,
    category: FileCategory,
    patterns: string[],
    maxFiles: number
  ): Promise<vscode.Uri[]> {
    const seen = new Set<string>();
    const results: vscode.Uri[] = [];

    for (const pattern of patterns) {
      if (results.length >= maxFiles) {
        break;
      }

      const include = new vscode.RelativePattern(folder, pattern);
      const matches = await vscode.workspace.findFiles(include, "**/{node_modules,.git,.venv,venv}/**", maxFiles);

      for (const uri of matches) {
        if (this.shouldExcludeFromCategory(uri, category)) {
          continue;
        }

        const key = uri.toString();
        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        results.push(uri);

        if (results.length >= maxFiles) {
          break;
        }
      }
    }

    return results.sort((a, b) => a.fsPath.localeCompare(b.fsPath));
  }

  private shouldExcludeFromCategory(uri: vscode.Uri, category: FileCategory): boolean {
    if (category !== "tests") {
      return false;
    }

    const fileName = uri.path.split("/").pop()?.toLowerCase();
    return fileName === "conftest.py";
  }
}
