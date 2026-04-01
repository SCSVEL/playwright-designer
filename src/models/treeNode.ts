import * as vscode from "vscode";

export type NodeType = "workspace" | "file" | "message" | "hook";

export interface BaseNode {
  type: NodeType;
}

export interface WorkspaceNode extends BaseNode {
  type: "workspace";
  folder: vscode.WorkspaceFolder;
}

export interface FileNode extends BaseNode {
  type: "file";
  folder: vscode.WorkspaceFolder;
  uri: vscode.Uri;
  label: string;
  description?: string;
}

export interface MessageNode extends BaseNode {
  type: "message";
  label: string;
}

export interface HookNode extends BaseNode {
  type: "hook";
  hookId: string;
  label: string;
  description: string;
  enabled: boolean;
}

export type PlaywrightTreeNode = WorkspaceNode | FileNode | MessageNode | HookNode;
