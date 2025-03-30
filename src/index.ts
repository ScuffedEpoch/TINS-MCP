#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { ReadmeParser } from './parser/index.js';
import { CodeGenerator } from './generator/index.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * TINS (There Is No Software) MCP Server
 * 
 * This server provides tools to generate software applications based on README.md files,
 * following the Zero Source specification.
 */
class TinsServer {
  private server: Server;
  private parser: ReadmeParser;
  private generator: CodeGenerator;

  constructor() {
    this.server = new Server(
      {
        name: 'tins-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.parser = new ReadmeParser();
    this.generator = new CodeGenerator();

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Setup the tool handlers for the MCP server
   */
  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_from_readme',
          description: 'Generate application code from a README.md file following the Zero Source specification',
          inputSchema: {
            type: 'object',
            properties: {
              readme_path: {
                type: 'string',
                description: 'Path to the README.md file'
              },
              output_dir: {
                type: 'string',
                description: 'Directory to output the generated code'
              },
              output_type: {
                type: 'string',
                enum: ['files', 'zip'],
                description: 'Output format (files or zip archive)'
              },
              preferred_language: {
                type: 'string',
                enum: ['javascript', 'typescript', 'python', 'java'],
                description: 'Preferred programming language (if applicable)'
              }
            },
            required: ['readme_path']
          }
        },
        {
          name: 'validate_readme',
          description: 'Validate a README.md file against the Zero Source specification',
          inputSchema: {
            type: 'object',
            properties: {
              readme_path: {
                type: 'string',
                description: 'Path to the README.md file to validate'
              }
            },
            required: ['readme_path']
          }
        }
      ]
    }));

    // Handler for generate_from_readme tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'generate_from_readme') {
        return this.handleGenerateFromReadme(request.params.arguments);
      } else if (request.params.name === 'validate_readme') {
        return this.handleValidateReadme(request.params.arguments);
      } else {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }
    });
  }

  /**
   * Handle the generate_from_readme tool request
   */
  private async handleGenerateFromReadme(args: any) {
    try {
      // Check required arguments
      if (!args.readme_path) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: readme_path is required'
            }
          ],
          isError: true
        };
      }

      // Validate file exists
      if (!await fs.pathExists(args.readme_path)) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: File not found at ${args.readme_path}`
            }
          ],
          isError: true
        };
      }

      // Parse the README
      const parsed = await this.parser.parseFile(args.readme_path);

      // Set up generator options
      const outputDir = args.output_dir || path.join(process.cwd(), 'generated_app');
      const options = {
        outputFormat: args.output_type || 'files',
        preferredLanguage: args.preferred_language || undefined,
        includeComments: true
      };

      // Generate code
      const result = await this.generator.generateCode(parsed, options);

      // Build response
      return {
        content: [
          {
            type: 'text',
            text: `Successfully generated application code for "${parsed.title}"\n\n` +
                  `Type: ${result.appType}\n` +
                  `Files: ${result.files.length}\n` +
                  `Output: ${result.outputPath || 'In-memory only'}\n\n` +
                  `To run the application:\n${result.commandToRun || 'No run command available'}`
          }
        ],
        isError: false
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Handle the validate_readme tool request
   */
  private async handleValidateReadme(args: any) {
    try {
      // Check required arguments
      if (!args.readme_path) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: readme_path is required'
            }
          ],
          isError: true
        };
      }

      // Validate file exists
      if (!await fs.pathExists(args.readme_path)) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: File not found at ${args.readme_path}`
            }
          ],
          isError: true
        };
      }

      // Validate the README
      const result = await this.parser.validateFile(args.readme_path);

      // Build response
      if (result.valid) {
        return {
          content: [
            {
              type: 'text',
              text: `README validation successful!\n\n` +
                    (result.warnings.length > 0 
                      ? `Warnings:\n${result.warnings.map(w => `- ${w}`).join('\n')}`
                      : 'No warnings.')
            }
          ],
          isError: false
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `README validation failed!\n\n` +
                    `Errors:\n${result.errors.map(e => `- ${e}`).join('\n')}\n\n` +
                    (result.warnings.length > 0 
                      ? `Warnings:\n${result.warnings.map(w => `- ${w}`).join('\n')}`
                      : '')
            }
          ],
          isError: true
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error validating README: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Start the MCP server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TINS MCP server running on stdio');
  }
}

// Run the server
const server = new TinsServer();
server.run().catch(console.error);
