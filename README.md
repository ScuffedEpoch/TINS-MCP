# TINS-MCP Server

More Information: https://github.com/ScuffedEpoch/TINS
**https://thereisnosource.com/**

## There Is No Software - MCP Server

A Model Context Protocol (MCP) server that generates software applications from README.md files following the Zero Source specification.

## What is "Zero Source"?

Zero Source is a paradigm shift in software distribution where:

1. **Only READMEs are distributed** - No source code is included in releases
2. **LLMs generate code on demand** - Software is reconstructed locally using AI
3. **Instructions evolve with technology** - The same README produces better code as LLMs improve
4. **Standardized format ensures consistency** - A structured approach to describing software functionality

## Prerequisites

- Node.js 16+
- TypeScript

## Installation

1. Clone the repository
2. Install dependencies:

```bash
cd TINS-MCP
npm install
```

3. Build the server:

```bash
npm run build
```

4. Configure the MCP server in your Claude desktop or VS Code extension settings using the provided setup script:

```bash
node setup-mcp.cjs
```

This script will automatically add the TINS-MCP server to your Claude VS Code extension or desktop app configuration.

> **Note**: The setup script uses CommonJS syntax, so it must be run with the `.cjs` extension.

## Usage

This MCP server provides two main tools:

### 1. Generate From README

Generates a complete application from a README.md file that follows the Zero Source specification.

Parameters:
- `readme_path`: Path to the README.md file (required)
- `output_dir`: Directory to output the generated code (optional)
- `output_type`: Output format - 'files' or 'zip' (optional, defaults to 'files')
- `preferred_language`: Preferred programming language for code generation (optional)

### 2. Validate README

Validates a README.md file against the Zero Source specification.

Parameters:
- `readme_path`: Path to the README.md file (required)

## Best Practices

### Path Handling

- **Always use absolute paths** when providing parameters to TINS-MCP server tools:
  ```
  ✅ CORRECT: "c:/path/to/project/README.md"
  ❌ INCORRECT: "./README.md" or "README.md"
  ```
  The TINS-MCP server may not correctly resolve relative paths based on your current working directory.

- **Use forward slashes** (`/`) in paths, even on Windows systems, for better cross-platform compatibility.

- **For output directories**, ensure they exist before running the generator or use absolute paths where TINS can create the directory automatically.

### General Usage Tips

- **Start with validation**: Always use the `validate_readme` tool first to check if your README follows Zero Source specifications before attempting generation.

- **Check the output location**: Be aware that the actual output location might differ from what was specified in the `output_dir` parameter. You may need to copy files to your desired location after generation.

- **Specify output parameters clearly**:
  - `output_dir`: Use absolute paths for reliable file placement
  - `output_type`: Choose "files" for individual files or "zip" for a compressed package
  - `preferred_language`: Only specify if the README doesn't already contain a language directive

## Configuration

To use this MCP server with Claude, you need to add it to your MCP settings configuration file:

For VS Code extension:
- Edit `claude_mcp_settings.json` in the extension's settings directory

For Claude desktop app:
- Edit `claude_desktop_config.json` in the app's settings directory

Example configuration:
```json
{
  "mcpServers": {
    "tins": {
      "command": "node",
      "args": ["path/to/TINS-MCP/build/index.js"],
      "env": {}
    }
  }
}
```

## Development

The server is structured as follows:

- `src/index.ts` - Main MCP server implementation
- `src/parser/` - README parsing and validation
- `src/generator/` - Code generation from parsed README
- `src/types/` - TypeScript type definitions

To run in development mode:

```bash
npm run dev
```

## License

MIT

## Testing Your Installation

To verify that your TINS-MCP server is correctly installed and working with Claude:

1. Make sure the MCP server is configured using the setup script
2. Ask Claude to generate an application from a Zero Source README

For example, you can try generating the todo app example:

```
Please use the TINS-MCP server to generate an application from the examples/todo-app-example.md file.
```

Claude should use the TINS-MCP server to parse the README and generate a complete todo application based on the specifications.
