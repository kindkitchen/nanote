# Refactor Imports

## Overview

`refactor_imports.ts` is a Deno utility script that automatically adds `.js` file extensions to relative import statements in TypeScript test files. This is useful for projects that require explicit file extensions in ES module imports.

## Purpose

The script processes all TypeScript files in the `test/` directory and:
- Detects import statements with relative paths (e.g., `from "./"`)
- Appends `.js` extension to relative imports that don't already have it
- Preserves multi-line import statements
- Maintains the original file structure for non-import content

## How It Works

1. **Walks the test directory**: Recursively finds all `.ts` files in the `test/` directory
2. **Parses imports**: Identifies lines containing import statements and detects if they span multiple lines
3. **Adds .js extension**: For relative imports without `.js` extension, appends `.js` to the import path
4. **Writes back**: Updates files with the refactored imports

## Usage

```bash
deno run refactor_imports.ts
```

### Requirements

- Deno runtime
- The script expects to be run from the `__dev__/` directory
- Target test files should be in `../test/` relative to the script location

## Example

**Before:**
```typescript
import { helper } from "./utils/helper";
```

**After:**
```typescript
import { helper } from "./utils/helper.js";
```

## Features

- ✓ Handles single-line import statements
- ✓ Handles multi-line import statements
- ✓ Preserves non-relative imports (e.g., `from "module"`)
- ✓ Skips files already having `.js` extensions
- ✓ Skips `node_modules` directories
- ✓ Logs file processing information (line count)

## Dependencies

- `@std/fs` - File system utilities
- `@std/path` - Path manipulation utilities
- Deno built-in APIs (`Deno.readTextFile`, `Deno.writeTextFileSync`)
