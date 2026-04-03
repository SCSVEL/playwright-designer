export type CategoryId =
  | "pageObjects"
  | "dataResources"
  | "tests"
  | "reports"
  | "fixtures"
  | "utils"
  | "github";

export type LanguageMode = "ts-js" | "python";

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  viewId: string;
  supportsFiles: boolean;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: "pageObjects",
    label: "Page Objects",
    viewId: "playwrightDesigner.pageObjects",
    supportsFiles: true
  },
  {
    id: "dataResources",
    label: "Data & Resources",
    viewId: "playwrightDesigner.dataResources",
    supportsFiles: true
  },
  {
    id: "tests",
    label: "Tests",
    viewId: "playwrightDesigner.tests",
    supportsFiles: true
  },
  {
    id: "reports",
    label: "Reports",
    viewId: "playwrightDesigner.reports",
    supportsFiles: true
  },
  {
    id: "fixtures",
    label: "Fixtures",
    viewId: "playwrightDesigner.fixtures",
    supportsFiles: true
  },
  {
    id: "utils",
    label: "Utils",
    viewId: "playwrightDesigner.utils",
    supportsFiles: true
  },
  {
    id: "github",
    label: "GitHub",
    viewId: "playwrightDesigner.github",
    supportsFiles: true
  }
];
