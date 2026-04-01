# Playwright Designer

Playwright Designer is a VS Code extension that adds a focused Activity Bar section to work faster with Playwright projects.

Current version: 0.0.4

## Included Panels

- Page Objects
- Data & Resources
- Tests
- Reports
- Fixtures
- Utils
- Hooks

## Current Capabilities

- Multi-root workspace support.
- Category discovery by glob patterns.
- Language mode setting: `ts-js` or `python`.
- Open files from panels in preview tab.
- Context menus in file-based panels for:
  - New File
  - New Folder
  - Delete File
  - Delete Folder
- Hooks panel with commands:
  - Create Hook
  - Toggle Hook
  - Delete Hook
  - Run Hook Now
- On test file save, matching enabled hooks prompt for confirmation before command execution.

## Settings

- `playwrightDesigner.languageMode`: `ts-js` or `python`
- `playwrightDesigner.maxFilesPerCategory`: max files scanned per category/folder
- `playwrightDesigner.customPatterns`: optional category pattern overrides
- `playwrightDesigner.folderMappings`: optional manual folder-to-panel mapping
- `playwrightDesigner.hooks`: project hook definitions

Default folder mapping includes:

- pageObjects: `src/pom`, `automation/page_objects`, `pages`
- tests: `tests/e2e`, `qa/specs`, `tests`
- fixtures: `tests/fixtures`, `tests` (for `conftest.py` discovery)
- dataResources: `resources`, `test-data`, `data`
- utils: `shared/utils`, `utils`, `helpers`, `common/utils`
- reports: `playwright-report`, `allure-report`, `reports`

Data & Resources also includes environment files by default (`.env`, `.env.*`).

Fixtures include `conftest.py` by default (`tests/conftest.py` and `**/conftest.py` in Python mode).

Duplicate files are automatically deduplicated so the same file URI is shown only once per category panel.

### Manual Folder Mapping Example

Add this to your workspace settings if you want explicit folder routing:

```json
{
  "playwrightDesigner.folderMappings": {
    "pageObjects": ["src/pom", "automation/page_objects"],
    "tests": ["tests/e2e", "qa/specs"],
    "fixtures": ["tests/fixtures"],
    "dataResources": ["resources", "test-data"],
    "utils": ["shared/utils"],
    "reports": ["playwright-report", "allure-report", "reports"]
  }
}
```

Each folder path is converted to a recursive glob (for example `src/pom` becomes `src/pom/**`) and merged with defaults/custom patterns.

## Hook Placeholders

You can use these placeholders in hook command and cwd:

- `${file}`: workspace-relative saved file
- `${filePath}`: absolute saved file path
- `${workspaceFolder}`: workspace folder path

## Run Locally

1. `npm install`
2. `npm run build`
3. Press `F5` to launch Extension Development Host

## Update Installed VSIX

If icon or panel updates do not appear immediately:

1. Install the latest VSIX version.
2. Run `Developer: Reload Window`.
3. If needed, uninstall the old Playwright Designer version and reinstall the latest VSIX.

## Panel Context Menus

Right-click items inside Page Objects, Data & Resources, Tests, Reports, Fixtures, and Utils panels.

- On a file: create sibling files/folders, delete the file, or delete a folder by relative path.
- On a workspace group: create files/folders from that workspace root or delete a target folder by relative path.
- On a panel title: create a new file or folder even when no file is selected.

## Publish To Marketplace

1. Create a publisher in Visual Studio Marketplace.
2. Generate a Personal Access Token with Marketplace `Manage` scope.
3. Log in with `vsce`:

```bash
npx @vscode/vsce login <publisher-name>
```


4. Update package.json fields before publish:
  - `publisher`: your real publisher id
  - `repository`: your GitHub repository URL
  - `version`: increment for each release
  - optional `icon`: Marketplace listing icon path

5. Publish publicly:

```bash
npx @vscode/vsce publish
```

6. Or publish a specific version:

```bash
npx @vscode/vsce publish 0.0.4
```

7. For private sharing only, keep using VSIX packages:

```bash
npm run package:vsix
```
