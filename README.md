# TINS-MCP Server

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

4. Configure the MCP server in your Claude desktop or VS Code extension settings

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
