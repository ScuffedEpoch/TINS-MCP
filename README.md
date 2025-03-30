# LTM-CLINE: Long-Term Memory for Claude 3.7

LTM-CLINE is a Model Context Protocol (MCP) server that provides Claude 3.7 with long-term memory, concurrency, and persona evolution capabilities using SQLite as a persistent storage backend. When integrated with the Cline VSCode extension, it enhances Claude 3.7 with human-like memory and the ability to evolve based on experiences.

## 🧠 Features

- **Long-Term Memory**: Store and retrieve conversation histories across sessions
- **Persona Evolution**: Evolve Claude's personality and traits based on its experiences
- **Conversation Management**: Track, summarize, and process conversation data
- **Dreamstate Processing**: Update Claude's persona during "sleep" based on recent memories
- **Awakening Process**: Reload relevant memories and persona on startup
- **Importance-Based Memory**: Assign and retrieve memories based on importance scores
- **Tag-Based Retrieval**: Search memories using tags and keywords
- **MCP Integration**: Expose all functionality to Claude 3.7 via MCP tools and resources

## 🔄 Memory Lifecycle

LTM-CLINE implements a human-like memory cycle:

1. **Awakening**: Claude "wakes up" and loads its persona and relevant memories
2. **Conversation**: The system records and processes conversations with users
3. **Sleep**: When a session ends, conversations are summarized and Claude enters "sleep" mode
4. **Dreamstate**: During sleep, the system processes recent experiences and evolves the persona

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/ScuffedEpoch/ltm-cline.git
cd .\LTM-MCP\LTM-CLINE\

# Install dependencies
npm install
```

Note: The project uses sqlite3 instead of better-sqlite3, which avoids native code compilation issues. If you encounter any SQLite-related errors during installation, make sure you have a compatible Node.js version.

## 🔌 MCP Configuration

To use LTM-CLINE with Claude 3.7 via the Cline VSCode extension:

1. Start the MCP server:
   ```bash
   node src/mcp/server.js
   ```

2. Configure the MCP server in your Cline settings (`~/.config/cline/cline_mcp_settings.json` or equivalent for your OS):
   ```json
   {
     "mcpServers": {
       "ltm-cline": {
         "command": "node",
         "args": ["/path/to/ltm-cline/src/mcp/server.js"],
         "env": {},
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

3. Restart the Cline VSCode extension to connect to the MCP server.

## 🚀 Using with Claude 3.7

Once the MCP server is running and configured, Claude 3.7 can use the following tools:

- **ltm_initialize**: Initialize the system
- **ltm_awaken**: Load persona and memories
- **ltm_record_message**: Record conversation messages
- **ltm_end_conversation**: Process conversation into memory
- **ltm_sleep**: Trigger dreamstate processing
- **ltm_search_memories**: Find relevant memories
- **ltm_get_awakening_prompt**: Generate an awakening prompt

Claude 3.7 can also access these resources:

- **persona://current**: Current Claude persona
- **status://current**: Current system status
- **memories://recent/{limit}**: Recent memories
- **memories://important/{threshold}/{limit}**: Important memories
- **memories://tag/{tag}/{limit}**: Memories by tag
- **updates://recent/{limit}**: Recent persona updates

### Example Usage

Here's an example conversation with Claude 3.7 using the LTM-CLINE MCP server:

```
USER: Can you awaken your memory system?

CLAUDE: I'll access my long-term memory system now.

[Claude uses ltm_awaken tool]

I've successfully awakened my memory system. I've loaded my persona and retrieved my most recent and important memories. Is there anything specific from our past conversations you'd like me to recall?

USER: What did we talk about last time?

CLAUDE: Let me check my recent memories.

[Claude uses memories://recent/1 resource]

Based on my memory, in our last conversation we discussed machine learning concepts, particularly neural networks. You asked me to explain how they work, and I provided an explanation about their structure, how they're inspired by the human brain, and how they learn through weighted connections between neurons.

Would you like to continue that discussion, or is there something else you'd like to talk about today?
```

## 🏗️ Architecture

LTM-CLINE consists of the following components:

### Models

- **Persona**: Stores Claude's evolving identity, traits, values, and preferences
- **Conversation**: Manages and records conversations with users
- **Memory**: Summarizes and stores important information from conversations
- **DreamstateUpdate**: Tracks changes to the persona over time

### Services

- **AwakeningService**: Handles the process of loading persona and memories on startup
- **MemoryProcessor**: Converts conversations into summarized memories with importance and tags
- **PersonaEvolver**: Implements the dreamstate process that evolves the persona

### Core

- **LTMSQL**: Main class that coordinates all components and provides the primary API

### MCP Server

- **LTMClineServer**: Exposes the LTM functionality to Claude 3.7 via the Model Context Protocol

## 💾 Database Schema

LTM-CLINE uses a SQLite database with the following tables:

- **persona**: Stores Claude's evolving identity
- **conversations**: Raw conversation data
- **memories**: Stored conversation summaries with importance scores and tags
- **dreamstate_updates**: Records changes to the persona over time

Note: The database schema uses quoted column names for SQLite reserved words, such as "values" in the persona table.

## 🧩 How It Works

### Persona Evolution

The system tracks Claude's personality as a combination of:
- **Traits**: Personality characteristics (openness, conscientiousness, etc.)
- **Values**: Core principles (helpfulness, honesty, etc.)
- **Preferences**: Communication styles and interaction preferences
- **Biography**: A narrative description of Claude's "life story"

As Claude interacts with users, its persona gradually evolves based on experiences.

### Memory Importance

Memories are assigned importance scores (1-10) based on:
- Conversation length and complexity
- Number of participants
- Content analysis (in a full implementation, using Claude 3.7 itself for analysis)

Important memories are prioritized during retrieval to ensure the most significant experiences influence Claude's behavior.

### Memory Tagging

Memories are automatically tagged with:
- Participant names
- Date information
- Keywords from the conversation
- In a full implementation, Claude-generated topical tags

Tags enable efficient retrieval of relevant memories when needed.

## 🔧 Extending LTM-CLINE

### Memory Processing

To improve memory processing, modify the `MemoryProcessor` service to have Claude generate better summaries:

```javascript
// In src/services/MemoryProcessor.js
static async generateSummary(conversation, options = {}) {
  const fullText = conversation.getFullText();
  
  // Call Claude via your preferred API method
  const summary = await callClaudeAPI("Summarize this conversation: " + fullText);
  
  return summary;
}
```

### Persona Evolution

Similarly, enhance persona evolution with Claude's capabilities:

```javascript
// In src/services/PersonaEvolver.js
static async identifyPersonaChanges(persona, memories, options = {}) {
  const memoriesData = memories.map(m => ({
    summary: m.summary,
    importance: m.importance,
    tags: m.tags
  }));
  
  // Ask Claude to analyze the memories and suggest persona changes
  const analysis = await callClaudeAPI(`
    Based on these recent experiences: ${JSON.stringify(memoriesData)}, 
    how should my persona evolve? Current persona: ${JSON.stringify(persona)}
  `);
  
  // Parse Claude's response into a changes object
  return parseChanges(analysis);
}
```

## ⚠️ Troubleshooting

### SQLite Reserved Keywords

If you encounter syntax errors about column names, ensure that SQLite reserved keywords (like "values") are properly quoted in your SQL statements. For example:

```javascript
// Incorrect - will cause a syntax error
db.exec(`CREATE TABLE person (id TEXT, values TEXT)`);

// Correct - uses quotes around the reserved keyword
db.exec(`CREATE TABLE person (id TEXT, "values" TEXT)`);
```

### Async/Await Pattern

This project uses asynchronous database operations with sqlite3. Make sure to properly use `async`/`await` when interacting with database methods:

```javascript
// Correct usage
async function saveData() {
  try {
    await runAsync('INSERT INTO data (key, value) VALUES (?, ?)', ['key1', 'value1']);
    console.log('Data saved successfully');
  } catch (err) {
    console.error('Error saving data:', err);
  }
}
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgements

This project is based on the original LTM-SQL framework, adapted to work with Claude 3.7 via the Model Context Protocol and the Cline VSCode extension.
