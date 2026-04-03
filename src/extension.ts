import * as vscode from "vscode";
import * as path from "path";
import { minimatch } from "minimatch";
import { getDesignerSettings } from "./config/settings";
import { CategoryProvider } from "./tree/categoryProvider";
import { WorkspaceScanner } from "./services/workspaceScanner";
import { HookService } from "./services/hookService";
import { CategoryId } from "./models/category";
import { FileNode, WorkspaceNode } from "./models/treeNode";

type FileCategory = CategoryId;

const FILE_CATEGORIES: FileCategory[] = ["pageObjects", "dataResources", "tests", "reports", "fixtures", "utils", "github"];

const VIEW_BY_CATEGORY: Record<FileCategory, string> = {
  pageObjects: "playwrightDesigner.pageObjects",
  dataResources: "playwrightDesigner.dataResources",
  tests: "playwrightDesigner.tests",
  reports: "playwrightDesigner.reports",
  fixtures: "playwrightDesigner.fixtures",
  utils: "playwrightDesigner.utils",
  github: "playwrightDesigner.github"
};

function toHookId(arg: unknown): string | undefined {
  if (typeof arg === "string") {
    return arg;
  }

  if (arg && typeof arg === "object" && "hookId" in arg && typeof (arg as { hookId?: unknown }).hookId === "string") {
    return (arg as { hookId: string }).hookId;
  }

  return undefined;
}

function isFileNode(arg: unknown): arg is FileNode {
  return Boolean(arg && typeof arg === "object" && "type" in arg && (arg as { type?: unknown }).type === "file");
}

function isWorkspaceNode(arg: unknown): arg is WorkspaceNode {
  return Boolean(arg && typeof arg === "object" && "type" in arg && (arg as { type?: unknown }).type === "workspace");
}

function appendRelativePath(baseUri: vscode.Uri, inputPath: string): vscode.Uri {
  const segments = inputPath
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.length ? vscode.Uri.joinPath(baseUri, ...segments) : baseUri;
}

async function pickWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (!folders.length) {
    void vscode.window.showWarningMessage("Open a workspace folder to create files or folders.");
    return undefined;
  }

  if (folders.length === 1) {
    return folders[0];
  }

  return vscode.window.showWorkspaceFolderPick({ placeHolder: "Select a workspace folder" });
}

async function resolveBaseDirectory(arg: unknown): Promise<vscode.Uri | undefined> {
  if (isFileNode(arg)) {
    return vscode.Uri.file(path.dirname(arg.uri.fsPath));
  }

  if (isWorkspaceNode(arg)) {
    return arg.folder.uri;
  }

  const folder = await pickWorkspaceFolder();
  return folder?.uri;
}

async function createFileEntry(arg: unknown): Promise<vscode.Uri | undefined> {
  const baseUri = await resolveBaseDirectory(arg);
  if (!baseUri) {
    return undefined;
  }

  const fileInput = await vscode.window.showInputBox({
    prompt: "Enter file name or relative path",
    placeHolder: isFileNode(arg) ? "example.spec.ts" : "pages/login.page.ts"
  });

  if (!fileInput?.trim()) {
    return undefined;
  }

  const fileUri = appendRelativePath(baseUri, fileInput);
  const directoryUri = vscode.Uri.file(path.dirname(fileUri.fsPath));
  await vscode.workspace.fs.createDirectory(directoryUri);

  try {
    await vscode.workspace.fs.stat(fileUri);
  } catch {
    await vscode.workspace.fs.writeFile(fileUri, new Uint8Array());
  }

  await vscode.window.showTextDocument(fileUri, { preview: false, preserveFocus: false });
  return fileUri;
}

async function createFolderEntry(arg: unknown): Promise<vscode.Uri | undefined> {
  const baseUri = await resolveBaseDirectory(arg);
  if (!baseUri) {
    return undefined;
  }

  const folderInput = await vscode.window.showInputBox({
    prompt: "Enter folder name or relative path",
    placeHolder: isFileNode(arg) ? "subfolder" : "pages/components"
  });

  if (!folderInput?.trim()) {
    return undefined;
  }

  const folderUri = appendRelativePath(baseUri, folderInput);
  await vscode.workspace.fs.createDirectory(folderUri);
  return folderUri;
}

async function deleteFileEntry(arg: unknown): Promise<boolean> {
  if (!isFileNode(arg)) {
    void vscode.window.showInformationMessage("Right-click a file in a panel to delete it.");
    return false;
  }

  const fileName = path.basename(arg.uri.fsPath);
  const response = await vscode.window.showWarningMessage(
    `Delete file \"${fileName}\"?`,
    { modal: true },
    "Delete"
  );

  if (response !== "Delete") {
    return false;
  }

  await vscode.workspace.fs.delete(arg.uri, { useTrash: true, recursive: false });
  return true;
}

async function deleteFolderEntry(arg: unknown): Promise<boolean> {
  const baseUri = await resolveBaseDirectory(arg);
  if (!baseUri) {
    return false;
  }

  const folderInput = await vscode.window.showInputBox({
    prompt: "Enter folder name or relative path to delete",
    placeHolder: isFileNode(arg) ? "subfolder" : "pages/old"
  });

  if (!folderInput?.trim()) {
    return false;
  }

  const targetUri = appendRelativePath(baseUri, folderInput);
  if (targetUri.toString() === baseUri.toString()) {
    void vscode.window.showWarningMessage("Refusing to delete the selected workspace root folder.");
    return false;
  }

  const response = await vscode.window.showWarningMessage(
    `Delete folder \"${vscode.workspace.asRelativePath(targetUri, false)}\"?`,
    { modal: true },
    "Delete"
  );

  if (response !== "Delete") {
    return false;
  }

  await vscode.workspace.fs.delete(targetUri, { useTrash: true, recursive: true });
  return true;
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const scanner = new WorkspaceScanner();
  const hookService = new HookService();

  const providers = new Map<FileCategory, CategoryProvider>();
  for (const category of FILE_CATEGORIES) {
    const provider = new CategoryProvider(category, scanner);
    providers.set(category, provider);
    context.subscriptions.push(vscode.window.registerTreeDataProvider(VIEW_BY_CATEGORY[category], provider));
  }

  const refreshAll = async (): Promise<void> => {
    const settings = getDesignerSettings();
    await scanner.refresh(settings);
    providers.forEach((provider) => provider.refresh());
  };

  let refreshTimer: NodeJS.Timeout | undefined;
  const scheduleRefresh = (): void => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    refreshTimer = setTimeout(() => {
      void refreshAll();
    }, 350);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("playwrightDesigner.refreshAll", async () => {
      await refreshAll();
    }),
    vscode.commands.registerCommand("playwrightDesigner.openFile", async (uri: vscode.Uri) => {
      await vscode.window.showTextDocument(uri, { preview: true, preserveFocus: false });
    }),
    vscode.commands.registerCommand("playwrightDesigner.createFile", async (arg: unknown) => {
      const created = await createFileEntry(arg);
      if (created) {
        await refreshAll();
      }
    }),
    vscode.commands.registerCommand("playwrightDesigner.createFolder", async (arg: unknown) => {
      const created = await createFolderEntry(arg);
      if (created) {
        await refreshAll();
      }
    }),
    vscode.commands.registerCommand("playwrightDesigner.deleteFile", async (arg: unknown) => {
      const deleted = await deleteFileEntry(arg);
      if (deleted) {
        await refreshAll();
      }
    }),
    vscode.commands.registerCommand("playwrightDesigner.deleteFolder", async (arg: unknown) => {
      const deleted = await deleteFolderEntry(arg);
      if (deleted) {
        await refreshAll();
      }
    }),
    vscode.commands.registerCommand("playwrightDesigner.hooks.create", async () => {
      await hookService.createHook();
      await refreshAll();
    }),
    vscode.commands.registerCommand("playwrightDesigner.hooks.toggle", async (arg: unknown) => {
      const hookId = toHookId(arg);
      if (!hookId) {
        return;
      }

      await hookService.toggleHook(hookId);
    }),
    vscode.commands.registerCommand("playwrightDesigner.hooks.delete", async (arg: unknown) => {
      const hookId = toHookId(arg);
      if (!hookId) {
        return;
      }

      await hookService.deleteHook(hookId);
    }),
    vscode.commands.registerCommand("playwrightDesigner.hooks.runNow", async (arg: unknown) => {
      const hookId = toHookId(arg);
      if (!hookId) {
        return;
      }

      await hookService.runHookNow(hookId);
    })
  );

  const fsWatcher = vscode.workspace.createFileSystemWatcher("**/*");
  context.subscriptions.push(
    fsWatcher,
    fsWatcher.onDidCreate(() => scheduleRefresh()),
    fsWatcher.onDidChange(() => scheduleRefresh()),
    fsWatcher.onDidDelete(() => scheduleRefresh())
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("playwrightDesigner")) {
        scheduleRefresh();
      }
    }),
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
      if (doc.isUntitled) {
        return;
      }

      const settings = getDesignerSettings();
      const testsPatterns = settings.patterns.tests;
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri);
      const relativePath = workspaceFolder ? vscode.workspace.asRelativePath(doc.uri, false) : doc.uri.fsPath;

      const isTestFile = testsPatterns.some((pattern) => {
        return minimatch(relativePath.replace(/\\\\/g, "/"), pattern.replace(/\\\\/g, "/"), { dot: true });
      });

      if (!isTestFile) {
        return;
      }

      await hookService.processTestSave(relativePath, doc.uri, workspaceFolder);
    })
  );

  await refreshAll();
}

export function deactivate(): void {
  // No-op for now.
}
