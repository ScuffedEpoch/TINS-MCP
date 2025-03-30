#!/usr/bin/env node
/**
 * TINS-MCP Server Setup Script
 * 
 * This script helps set up the TINS-MCP server in Claude's MCP settings.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Setup paths based on platform
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Path to this project's build directory for the executable
const serverPath = path.resolve(__dirname, 'build', 'index.js');

// Default MCP settings paths
let claudeDesktopConfigPath;
let claudeVSCodeConfigPath;

if (isWindows) {
  claudeDesktopConfigPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  claudeVSCodeConfigPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
} else if (isMac) {
  claudeDesktopConfigPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  claudeVSCodeConfigPath = path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
} else if (isLinux) {
  claudeDesktopConfigPath = path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  claudeVSCodeConfigPath = path.join(os.homedir(), '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');
} else {
  console.error('Unsupported platform');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

/**
 * Add the TINS-MCP server to an MCP settings file
 */
function addServerToConfig(configPath) {
  try {
    let config = { mcpServers: {} };
    
    // Try to read existing config
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      try {
        config = JSON.parse(configContent);
      } catch (err) {
        console.error(`Error parsing existing config at ${configPath}`);
        return false;
      }
    }
    
    // Ensure mcpServers key exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    // Add/update our server
    config.mcpServers.tins = {
      command: 'node',
      args: [serverPath],
      env: {},
      disabled: false,
      autoApprove: []
    };
    
    // Create directory if it doesn't exist
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Write the updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error updating config at ${configPath}:`, err);
    return false;
  }
}

async function main() {
  console.log('TINS-MCP Server Setup');
  console.log('=====================\n');
  
  console.log('This script will help you set up the TINS-MCP server in Claude\'s MCP settings.\n');
  
  // Check if server build exists
  if (!fs.existsSync(serverPath)) {
    console.log('⚠️  Warning: The server build does not exist yet.');
    console.log('Please run "npm run build" first to build the server.\n');
  }
  
  console.log('Available options:');
  console.log('1. Set up for Claude Desktop');
  console.log('2. Set up for Claude VS Code Extension');
  console.log('3. Exit\n');
  
  const choice = await prompt('Please select an option (1-3): ');
  
  switch (choice) {
    case '1':
      if (addServerToConfig(claudeDesktopConfigPath)) {
        console.log(`✅ Successfully added TINS-MCP server to Claude Desktop settings at:`);
        console.log(`   ${claudeDesktopConfigPath}`);
      } else {
        console.log('❌ Failed to update Claude Desktop settings');
      }
      break;
    case '2':
      if (addServerToConfig(claudeVSCodeConfigPath)) {
        console.log(`✅ Successfully added TINS-MCP server to Claude VS Code Extension settings at:`);
        console.log(`   ${claudeVSCodeConfigPath}`);
      } else {
        console.log('❌ Failed to update Claude VS Code Extension settings');
      }
      break;
    case '3':
      console.log('Exiting.');
      break;
    default:
      console.log('Invalid option.');
      break;
  }
  
  rl.close();
}

main().catch(console.error);
