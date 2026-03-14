# Project Guidelines

This workspace is currently uninitialized (no source files or manifests yet). Use these defaults until project files are added.

## Code Style
- Match existing style and tooling once files exist (formatter, linter, naming, and folder conventions).
- Keep changes minimal and focused; avoid unrelated refactors.
- Prefer clear, readable code and small, testable edits.

## Architecture
- No architecture has been defined yet.
- When files are added, infer boundaries from directory structure and update this file with concrete component guidance.

## Build and Test
- No build/test commands are currently available.
- Detect commands from project manifests when present (for example: `package.json`, `pyproject.toml`, `requirements.txt`, `pom.xml`, `build.gradle`, `*.sln`, `*.csproj`).
- Before major changes, run relevant checks and tests for the detected stack.

## Conventions
- Do not assume a technology stack without evidence in the workspace.
- Prefer asking for clarification when requirements are ambiguous.
- If environment variables are required, use a root `.env` file with placeholder values and document required keys.
