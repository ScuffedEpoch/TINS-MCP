#!/usr/bin/env node
// Use CommonJS for project modules
const LTMSQL = require('../core/LTMSQL');
const Memory = require('../models/Memory');

// MCP SDK modules will be imported dynamically

/**
 * MCP Server for LTM-CLINE
 * Exposes long-term memory capabilities to Claude via the Model Context Protocol
 */
class LTMClineServer {
  constructor() {
    // Initialize the LTM-SQL framework
    this.ltm = new LTMSQL();
    this.ltm.initialize();
    
    // MCP SDK imports will be initialized in the init() method
    this.Server = null;
    this.StdioServerTransport = null;
    this.CallToolRequestSchema = null;
    this.ListResourcesRequestSchema = null;
    this.ListResourceTemplatesRequestSchema = null;
    this.ListToolsRequestSchema = null;
    this.ReadResourceRequestSchema = null;
    this.ErrorCode = null;
    this.McpError = null;
    this.server = null;
  }

  /**
   * Initialize the MCP server with dynamically imported modules
   */
  async init() {
    try {
      // Dynamically import MCP SDK modules
      const serverModule = await import('@modelcontextprotocol/sdk/server/index.js');
      const stdioModule = await import('@modelcontextprotocol/sdk/server/stdio.js');
      const typesModule = await import('@modelcontextprotocol/sdk/types.js');
      
      // Store imported modules
      this.Server = serverModule.Server;
      this.StdioServerTransport = stdioModule.StdioServerTransport;
      this.CallToolRequestSchema = typesModule.CallToolRequestSchema;
      this.ListResourcesRequestSchema = typesModule.ListResourcesRequestSchema;
      this.ListResourceTemplatesRequestSchema = typesModule.ListResourceTemplatesRequestSchema;
      this.ListToolsRequestSchema = typesModule.ListToolsRequestSchema;
      this.ReadResourceRequestSchema = typesModule.ReadResourceRequestSchema;
      this.ErrorCode = typesModule.ErrorCode;
      this.McpError = typesModule.McpError;
      
      // Initialize MCP server
      this.server = new this.Server(
        {
          name: 'ltm-cline-server',
          version: '1.0.0',
        },
        {
          capabilities: {
            resources: {},
            tools: {},
          },
        }
      );

      // Set up request handlers
      this.setupResourceHandlers();
      this.setupToolHandlers();
      
      // Error handling
      this.server.onerror = (error) => console.error('[MCP Error]', error);
      process.on('SIGINT', async () => {
        // Make sure to run dreamstate processing before shutting down
        if (this.ltm.isAwake) {
          await this.ltm.sleep();
        }
        await this.server.close();
        process.exit(0);
      });

      return this.server;
    } catch (error) {
      console.error('Error initializing MCP server:', error);
      throw error;
    }
  }

  /**
   * Set up resource handlers for MCP
   */
  setupResourceHandlers() {
    // List available static resources
    this.server.setRequestHandler(this.ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'persona://current',
          name: 'Current persona',
          mimeType: 'application/json',
          description: 'Current Claude persona with traits, values, and preferences',
        },
        {
          uri: 'status://current',
          name: 'Current LTM status',
          mimeType: 'application/json',
          description: 'Current status of the LTM-CLINE system',
        },
      ],
    }));

    // List available resource templates
    this.server.setRequestHandler(this.ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: [
        {
          uriTemplate: 'memories://recent/{limit}',
          name: 'Recent memories',
          mimeType: 'application/json',
          description: 'Most recent memories, optionally limited',
        },
        {
          uriTemplate: 'memories://important/{threshold}/{limit}',
          name: 'Important memories',
          mimeType: 'application/json',
          description: 'Important memories with threshold and limit',
        },
        {
          uriTemplate: 'memories://tag/{tag}/{limit}',
          name: 'Memories by tag',
          mimeType: 'application/json',
          description: 'Memories with specific tag',
        },
        {
          uriTemplate: 'updates://recent/{limit}',
          name: 'Recent persona updates',
          mimeType: 'application/json',
          description: 'Most recent persona updates',
        },
      ],
    }));

    // Handle resource reading
    this.server.setRequestHandler(this.ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      let contents;

      // Handle static resources
      if (uri === 'persona://current') {
        const persona = this.ltm.getPersona();
        
        if (!persona) {
          throw new this.McpError(
            this.ErrorCode.ResourceNotFound,
            'No persona found'
          );
        }
        
        contents = {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            id: persona.personaId,
            traits: persona.traits,
            values: persona.values,
            preferences: persona.preferences,
            biography: persona.biography,
            lastUpdated: persona.lastUpdated,
          }, null, 2),
        };
      } 
      else if (uri === 'status://current') {
        const status = this.ltm.getStatus();
        
        contents = {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(status, null, 2),
        };
      }
      // Handle recent memories URI pattern
      else if (uri.startsWith('memories://recent')) {
        const match = uri.match(/^memories:\/\/recent(?:\/(\d+))?$/);
        
        if (!match) {
          throw new this.McpError(
            this.ErrorCode.InvalidRequest,
            `Invalid URI format: ${uri}`
          );
        }
        
        const limit = match[1] ? parseInt(match[1]) : 5;
        const memories = await this.ltm.getRecentMemories(limit);
        
        // Handle case where no memories are found or memories is null/undefined
        if (!memories || memories.length === 0) {
          contents = {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              count: 0,
              memories: [],
              message: "No recent memories found"
            }, null, 2),
          };
        } else {
          contents = {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(memories.map(mem => ({
              id: mem.memoryId,
              summary: mem.summary,
              importance: mem.importance,
              when: mem.timestamp,
              tags: mem.tags,
            })), null, 2),
          };
        }
      }
      // Handle important memories URI pattern
      else if (uri.startsWith('memories://important')) {
        const match = uri.match(/^memories:\/\/important(?:\/(\d+))?(?:\/(\d+))?$/);
        
        if (!match) {
          throw new this.McpError(
            this.ErrorCode.InvalidRequest,
            `Invalid URI format: ${uri}`
          );
        }
        
        const threshold = match[1] ? parseInt(match[1]) : 7;
        const limit = match[2] ? parseInt(match[2]) : 5;
        
        const memories = await this.ltm.getImportantMemories(threshold, limit);
        
        // Handle case where no memories are found or memories is null/undefined
        if (!memories || memories.length === 0) {
          contents = {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              count: 0,
              memories: [],
              message: "No important memories found matching the criteria"
            }, null, 2),
          };
        } else {
          contents = {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(memories.map(mem => ({
              id: mem.memoryId,
              summary: mem.summary,
              importance: mem.importance,
              when: mem.timestamp,
              tags: mem.tags,
            })), null, 2),
          };
        }
      }
      // Handle memories by tag
      else if (uri.startsWith('memories://tag')) {
        const match = uri.match(/^memories:\/\/tag\/([^\/]+)(?:\/(\d+))?$/);
        
        if (!match) {
          throw new this.McpError(
            this.ErrorCode.InvalidRequest,
            `Invalid URI format: ${uri}`
          );
        }
        
        const tag = decodeURIComponent(match[1]);
        const limit = match[2] ? parseInt(match[2]) : 5;
        
        const memories = await Memory.searchByTags([tag], limit);
        
        // Handle case where no memories are found or memories is null/undefined
        if (!memories || memories.length === 0) {
          contents = {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              count: 0,
              memories: [],
              message: `No memories found with tag: ${tag}`
            }, null, 2),
          };
        } else {
          contents = {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(memories.map(mem => ({
              id: mem.memoryId,
              summary: mem.summary,
              importance: mem.importance,
              when: mem.timestamp,
              tags: mem.tags,
            })), null, 2),
          };
        }
      }
      // Handle recent persona updates
      else if (uri.startsWith('updates://recent')) {
        const match = uri.match(/^updates:\/\/recent(?:\/(\d+))?$/);
        
        if (!match) {
          throw new this.McpError(
            this.ErrorCode.InvalidRequest,
            `Invalid URI format: ${uri}`
          );
        }
        
        const limit = match[1] ? parseInt(match[1]) : 3;
        const updates = await this.ltm.getRecentUpdates(limit);
        
        // Handle case where no updates are found or updates is null/undefined
        if (!updates || updates.length === 0) {
          contents = {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              count: 0,
              updates: [],
              message: "No recent persona updates found"
            }, null, 2),
          };
        } else {
          contents = {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(updates.map(update => {
              const diff = update.getDiff();
              return {
                id: update.updateId,
                description: update.description,
                justification: update.justification,
                timestamp: update.timestamp,
                changes: diff,
              };
            }), null, 2),
          };
        }
      }
      else {
        throw new this.McpError(
          this.ErrorCode.ResourceNotFound,
          `Resource not found: ${uri}`
        );
      }

      return { contents: [contents] };
    });
  }

  /**
   * Set up tool handlers for MCP
   */
  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(this.ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'ltm_initialize',
          description: 'Initialize the LTM-CLINE system',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          },
        },
        {
          name: 'ltm_awaken',
          description: 'Awaken the system and load persona and memories',
          inputSchema: {
            type: 'object',
            properties: {
              recentMemoriesLimit: {
                type: 'number',
                description: 'Maximum number of recent memories to load',
              },
              importantMemoriesThreshold: {
                type: 'number',
                description: 'Importance threshold for important memories (1-10)',
              },
              importantMemoriesLimit: {
                type: 'number',
                description: 'Maximum number of important memories to load',
              },
            },
            required: []
          },
        },
        {
          name: 'ltm_record_message',
          description: 'Record a message in the current conversation',
          inputSchema: {
            type: 'object',
            properties: {
              role: {
                type: 'string',
                description: 'Role of the message sender (user or claude)',
              },
              content: {
                type: 'string',
                description: 'Content of the message',
              },
            },
            required: ['role', 'content']
          },
        },
        {
          name: 'ltm_end_conversation',
          description: 'End the current conversation and process it into a memory',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          },
        },
        {
          name: 'ltm_sleep',
          description: 'Put the system to sleep, triggering persona evolution',
          inputSchema: {
            type: 'object',
            properties: {
              recentMemoriesLimit: {
                type: 'number',
                description: 'Number of recent memories to process for evolution',
              },
            },
            required: []
          },
        },
        {
          name: 'ltm_search_memories',
          description: 'Search for memories based on a query or tags',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              tags: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Array of tags to search for',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return',
              },
            },
            required: []
          },
        },
        {
          name: 'ltm_get_awakening_prompt',
          description: 'Generate an awakening prompt for Claude 3.7',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(this.CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Initialize the LTM system
        if (name === 'ltm_initialize') {
          this.ltm.initialize();
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'LTM-CLINE system initialized successfully',
                  personaId: this.ltm.persona.personaId,
                }, null, 2),
              },
            ],
          };
        }
        
        // Awaken the system
        else if (name === 'ltm_awaken') {
          const context = await this.ltm.awaken(args);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'System awakened successfully',
                  context: {
                    personaId: context.persona.id,
                    recentMemoriesCount: context.recentMemories.length,
                    importantMemoriesCount: context.importantMemories.length,
                    awakeningTime: context.awakeningTime,
                  },
                }, null, 2),
              },
            ],
          };
        }
        
        // Record a message
        else if (name === 'ltm_record_message') {
          if (!args.role || !args.content) {
            throw new Error('Both role and content are required');
          }
          
          if (!this.ltm.isAwake) {
            throw new Error('System must be awakened first');
          }
          
          // Check if there's an active conversation, if not start one
          if (!this.ltm.currentConversation) {
            console.log('No active conversation found, starting a new one');
            await this.ltm.startConversation(['user', 'claude']);
          }
          
          const conversation = await this.ltm.addMessage(args.role, args.content);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'Message recorded successfully',
                  conversationId: conversation.conversationId,
                  messageCount: conversation.messages.length,
                }, null, 2),
              },
            ],
          };
        }
        
        // End conversation
        else if (name === 'ltm_end_conversation') {
          if (!this.ltm.isAwake) {
            throw new Error('System must be awakened first');
          }
          
          if (!this.ltm.currentConversation) {
            throw new Error('No active conversation to end');
          }
          
          const memory = this.ltm.endConversation();
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'Conversation ended and processed into memory',
                  memoryId: memory.memoryId,
                  summary: memory.summary,
                  importance: memory.importance,
                  tags: memory.tags,
                }, null, 2),
              },
            ],
          };
        }
        
        // Put system to sleep
        else if (name === 'ltm_sleep') {
          if (!this.ltm.isAwake) {
            throw new Error('System must be awakened first');
          }
          
          const dreamstateUpdate = this.ltm.sleep(args);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'System entered sleep state with dreamstate processing',
                  updateId: dreamstateUpdate.updateId,
                  description: dreamstateUpdate.description,
                  justification: dreamstateUpdate.justification,
                }, null, 2),
              },
            ],
          };
        }
        
        // Search memories
        else if (name === 'ltm_search_memories') {
          const { query = '', tags = [], limit = 5 } = args;
          
          const memories = await this.ltm.searchMemories(query, tags, { limit });
          
          // Handle case where no memories are found or memories is null/undefined
          if (!memories || memories.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    count: 0,
                    memories: [],
                    message: "No memories found matching the criteria"
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  count: memories.length,
                  memories: memories.map(mem => ({
                    id: mem.memoryId,
                    summary: mem.summary,
                    importance: mem.importance,
                    when: mem.timestamp,
                    tags: mem.tags,
                  })),
                }, null, 2),
              },
            ],
          };
        }
        
        // Get awakening prompt
        else if (name === 'ltm_get_awakening_prompt') {
          if (!this.ltm.isAwake) {
            throw new Error('System must be awakened first');
          }
          
          const prompt = this.ltm.getAwakeningPrompt();
          
          return {
            content: [
              {
                type: 'text',
                text: prompt,
              },
            ],
          };
        }
        
        else {
          throw new this.McpError(
            this.ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
        }
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the MCP server
   */
  async run() {
    // Make sure the server has been initialized
    if (!this.server) {
      await this.init();
    }
    
    // Create the transport
    const transport = new this.StdioServerTransport();
    
    // Connect with error handling
    try {
      await this.server.connect(transport);
      console.error('LTM-CLINE MCP server running on stdio');
    } catch (error) {
      console.error('[CRITICAL] Failed to connect MCP server transport:', error);
      if (error.stack) console.error(error.stack);
    }
  }
}

// Run the server if this script is executed directly
if (require.main === module) {
  // Use an async IIFE to handle dynamic imports
  (async () => {
    try {
      // Add custom debug output
      console.error('[DEBUG] Starting LTM-CLINE MCP server...');
      
      // Redirect all console.log to console.error to avoid interfering with stdio transport
      const originalConsoleLog = console.log;
      console.log = function() {
        console.error.apply(console, ['[LOG]', ...arguments]);
      };
      
      console.error('[DEBUG] Creating server instance...');
      const server = new LTMClineServer();
      
      console.error('[DEBUG] Initializing server...');
      await server.init();
      
      console.error('[DEBUG] Running server...');
      await server.run();
      
      console.error('[DEBUG] Server started successfully.');
    } catch (error) {
      console.error('[FATAL] Failed to start LTM-CLINE server:', error);
      if (error.stack) console.error(error.stack);
      
      // Log specific additional information based on error type
      if (error instanceof TypeError) {
        console.error('[DEBUG] Type error detected. This might be due to incompatible MCP SDK versions or missing properties.');
      }
      
      process.exit(1);
    }
  })();
}

module.exports = LTMClineServer;
