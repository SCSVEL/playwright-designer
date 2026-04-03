# Playwright Designer

Playwright Designer is a VS Code extension that adds a focused Activity Bar section to work faster with Playwright projects.

Current version: 0.0.7

## Included Panels

- Page Objects
- Data & Resources
- Tests
- Reports
- Fixtures
- Utils
- GitHub

## Current Capabilities

- Multi-root workspace support.
- Category discovery by glob patterns.
- Language mode setting: `ts-js` or `python`.
- Open files from panels in preview tab.
- Context menus in file-based panels for add, delete files/folders  
- GitHub panel for Copilot/GitHub automation files:
  - skills (for example `SKILL.md`)
  - instructions (for example `*.instructions.md`, `copilot-instructions.md`)
  - prompts and agents (for example `*.prompt.md`, `*.agent.md`, `AGENTS.md`)
  - repository hooks under `.github/hooks`
- On test file save, matching enabled hooks prompt for confirmation before command execution.

## Settings

- `playwrightDesigner.languageMode`: `ts-js` or `python`
- `playwrightDesigner.maxFilesPerCategory`: max files scanned per category/folder
- `playwrightDesigner.customPatterns`: optional category pattern overrides
- `playwrightDesigner.folderMappings`: optional manual folder-to-panel mapping with explicit filePattern per entry
- `playwrightDesigner.hooks`: project hook definitions

## Others

- Data & Resources also includes environment files by default (`.env`, `.env.*`).
- Fixtures include `conftest.py` by default (`tests/conftest.py` and `**/conftest.py` in Python mode).
- Tests include only test-like files (`*.spec.*`, `*.test.*`, `test_*.py`, `*_test.py`).
- Reports include only `html`/`xml` files by default.
- Duplicate files are automatically deduplicated so the same file URI is shown only once per category panel.


### Manual Folder Mapping Example

Add this to your workspace settings if you want explicit folder routing:

```json
{
  "playwrightDesigner.folderMappings": {
    "pageObjects": [
      { "folder": "src/pom", "filePattern": "*.{ts,tsx,js,jsx,py}" },
      { "folder": "automation/page_objects", "filePattern": "*.{ts,tsx,js,jsx,py}" }
    ],
    "tests": [
      { "folder": "tests", "filePattern": "*.spec.ts" },
      { "folder": "tests", "filePattern": "*.test.ts" },
      { "folder": "tests", "filePattern": "test_*.py" }
    ],
    "fixtures": [{ "folder": "tests/fixtures", "filePattern": "*.{ts,tsx,js,jsx,py}" }],
    "dataResources": [
      { "folder": "resources", "filePattern": "**/*" },
      { "folder": "test-data", "filePattern": "**/*" }
    ],
    "utils": [{ "folder": "shared/utils", "filePattern": "*.{ts,tsx,js,jsx,py}" }],
    "reports": [
      { "folder": "reports", "filePattern": "*.html" },
      { "folder": "reports", "filePattern": "*.xml" }
    ],
    "github": [
      { "folder": ".github/skills", "filePattern": "SKILL.md" },
      { "folder": ".github/instructions", "filePattern": "*.instructions.md" },
      { "folder": ".github/hooks", "filePattern": "**/*" }
    ]
  }
}
```

- Each folder is matched at any level (for example `tests` matches `myapp/tests`, `myapp1/tests`, etc.).
- Set `filePattern` for each mapping entry. For tests and reports, use file patterns that keep results focused to test files and html/xml report files.

## Hook Placeholders

You can use these placeholders in hook command and cwd:

- `${file}`: workspace-relative saved file
- `${filePath}`: absolute saved file path
- `${workspaceFolder}`: workspace folder path

