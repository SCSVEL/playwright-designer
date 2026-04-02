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

## Others

- Data & Resources also includes environment files by default (`.env`, `.env.*`).
- Fixtures include `conftest.py` by default (`tests/conftest.py` and `**/conftest.py` in Python mode).
- Duplicate files are automatically deduplicated so the same file URI is shown only once per category panel.


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

