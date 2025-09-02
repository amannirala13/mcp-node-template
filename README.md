# MCP Server Framework Documentation

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Transport Modes](#transport-modes)
- [Creating Your First MCP Server](#creating-your-first-mcp-server)
- [Registering Tools](#registering-tools)
- [Registering Resources](#registering-resources)
- [Advanced Configuration](#advanced-configuration)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

The MCP (Model Context Protocol) Server Framework is a TypeScript-based abstraction layer that simplifies the creation of MCP servers. It provides a robust base class that handles transport configuration, tool registration, and resource management, allowing you to focus on implementing your business logic.

### Key Features
- 🚀 **Multiple Transport Modes**: Support for stdio and HTTP streaming
- 🛠️ **Easy Tool Registration**: Simple API for registering tools with validation
- 📦 **Resource Management**: Built-in support for serving resources
- 🔒 **Type Safety**: Full TypeScript support with Zod schema validation
- 🎯 **Minimal Boilerplate**: Focus on your logic, not infrastructure
- 🔄 **Extensible Architecture**: Easy to extend and customize

## Installation

```bash
# Install required dependencies
npm install @modelcontextprotocol/sdk zod

# Or using yarn
yarn add @modelcontextprotocol/sdk zod

# Or using pnpm
pnpm add @modelcontextprotocol/sdk zod
```

### Project Structure
```
your-project/
├── src/
│   ├── mcp/
│   │   ├── BaseMCPServer.ts       # Base class
│   │   ├── examples/
│   │   │   ├── greetings.mcp.server.ts         # Example implementation
│   │   │   └── weather.mcp.server.ts           # Example implementation
│   │   └── you-server/
│   │       └── your-custom.mcp.server.ts       # Your implementation
│   └── app.ts                                  # Entry point
├── package.json
└── tsconfig.json
```

## Quick Start

### 1. Basic Server Implementation

```typescript
import { BaseMCPServer, BaseMCPConfig } from "./base/BaseMCPServer";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types";
import z from "zod";

export class HelloWorldMCP extends BaseMCPServer {
  protected registerComponents(): void {
    // Register a simple tool
    this.registerToolHelper(
      'say_hello',
      {
        description: 'Say hello to someone',
        inputSchema: z.object({
          name: z.string()
        }),
        outputSchema: z.object({
          message: z.string()
        })
      },
      this.sayHello.bind(this)
    );
  }

  private sayHello(args: { name: string }): CallToolResult {
    return {
      content: [{
        type: "text",
        text: `Hello, ${args.name}!`
      }],
      structuredContent: {
        message: `Hello, ${args.name}!`
      }
    };
  }
}

// Start the server
const server = new HelloWorldMCP({
  name: "HelloWorldMCP",
  version: "1.0.0",
  transportMode: "stdio"
});

await server.start();
```

## Core Concepts

### BaseMCPServer Class

The `BaseMCPServer` is an abstract class that provides the foundation for all MCP servers. It handles:

- Transport initialization and management
- Configuration validation
- Tool and resource registration helpers
- Connection lifecycle management

### Configuration Schema

Every MCP server requires a configuration object:

```typescript
interface BaseMCPConfig {
  name: string;           // Server name (2-100 chars)
  version: string;        // Server version (1-10 chars)
  host?: string;          // Host for HTTP mode (default: "localhost")
  port?: number;          // Port for HTTP mode (default: 3000)
  transportMode: "stdio" | "streamable-http";  // Transport mode
  transport?: Transport;  // Optional custom transport instance
}
```

## Transport Modes

### When to Use Each Transport Mode

#### STDIO (Standard Input/Output)
```typescript
transportMode: "stdio"
```

**Use Cases:**
- ✅ CLI tools and command-line applications
- ✅ Local development and testing
- ✅ Simple integrations with shell scripts
- ✅ Single-user, single-session applications
- ✅ Pipe-based communication between processes
- ✅ Integration with system tools

**Advantages:**
- Simple setup, no network configuration
- Low latency for local communication
- Works well with Unix philosophy (pipes, redirection)
- No firewall or network security concerns
- Ideal for subprocess communication

**Disadvantages:**
- Cannot handle multiple simultaneous connections
- Limited to local machine communication
- Not suitable for web applications
- No built-in session management

**Example Use Case:**
```bash
# Using stdio MCP server in a pipeline
echo '{"method": "greet", "params": {"name": "Alice"}}' | node your-stdio-server.js
```

#### Streamable HTTP (streamable-http)
```typescript
transportMode: "streamable-http"
```

**Use Cases:**
- ✅ Web applications and APIs
- ✅ Multi-user applications
- ✅ Remote access scenarios
- ✅ Microservices architecture
- ✅ Cloud deployments
- ✅ Applications requiring session management
- ✅ Real-time streaming applications

**Advantages:**
- Supports multiple concurrent connections
- Can be accessed remotely over network
- Built-in session management
- Works with standard HTTP infrastructure
- Can integrate with load balancers and proxies
- Supports streaming responses

**Disadvantages:**
- Requires network configuration
- Higher latency than stdio
- May require firewall configuration
- More complex setup

**Example Configuration:**
```typescript
const server = new YourMCP({
  name: "WebMCP",
  version: "1.0.0",
  host: "0.0.0.0",  // Listen on all interfaces
  port: 8080,
  transportMode: "streamable-http"
});
```

### Transport Mode Decision Tree

```
Is your application...
│
├─ A CLI tool or script?
│  └─ Use STDIO ✓
│
├─ A web service or API?
│  └─ Use Streamable HTTP ✓
│
├─ Used by multiple users simultaneously?
│  └─ Use Streamable HTTP ✓
│
├─ Part of a microservices architecture?
│  └─ Use Streamable HTTP ✓
│
├─ A local development tool?
│  └─ Use STDIO ✓
│
├─ Integrated with shell scripts?
│  └─ Use STDIO ✓
│
└─ Deployed in the cloud?
   └─ Use Streamable HTTP ✓
```

## Creating Your First MCP Server

### Step-by-Step Guide

#### Step 1: Define Your Server Class

```typescript
import { BaseMCPServer, BaseMCPConfig } from "./base/BaseMCPServer";
import z from "zod";

export class MyCustomMCP extends BaseMCPServer {
  // Add any custom properties
  private apiKey?: string;
  
  constructor(params: BaseMCPConfig & { apiKey?: string }) {
    super(params);
    this.apiKey = params.apiKey;
  }
  
  protected registerComponents(): void {
    // This method is called during construction
    // Register all your tools and resources here
  }
}
```

#### Step 2: Implement the registerComponents Method

```typescript
protected registerComponents(): void {
  // Register tools
  this.registerToolHelper(
    'tool_name',
    {
      description: 'What this tool does',
      inputSchema: z.object({
        param1: z.string(),
        param2: z.number().optional()
      }),
      outputSchema: z.object({
        result: z.string()
      })
    },
    this.toolHandler.bind(this)
  );
  
  // Register resources
  this.registerResourceHelper(
    'resource_name',
    'resource://uri',
    {
      description: 'What this resource provides',
      metadata: { /* optional metadata */ }
    },
    this.resourceHandler.bind(this)
  );
}
```

#### Step 3: Implement Tool Handlers

```typescript
private async toolHandler(args: { param1: string; param2?: number }): Promise<CallToolResult> {
  // Your tool logic here
  const result = await this.processData(args);
  
  return {
    content: [{
      type: "text",
      text: `Processed: ${result}`
    }],
    structuredContent: {
      result: result,
      metadata: { processed: true }
    }
  };
}
```

#### Step 4: Start Your Server

```typescript
async function main() {
  const server = new MyCustomMCP({
    name: "MyCustomMCP",
    version: "1.0.0",
    transportMode: "stdio", // or "streamable-http"
    apiKey: process.env.API_KEY
  });
  
  await server.start();
  console.log("Server started successfully!");
}

main().catch(console.error);
```

## Registering Tools

### Tool Registration API

Tools are the primary way MCP servers expose functionality. Each tool has:
- A unique name
- A description
- Input schema (validation)
- Output schema (validation)
- A handler function

### Basic Tool Registration

```typescript
this.registerToolHelper(
  'calculate_sum',
  {
    description: 'Calculate the sum of two numbers',
    inputSchema: z.object({
      a: z.number(),
      b: z.number()
    }),
    outputSchema: z.object({
      sum: z.number()
    })
  },
  (args) => ({
    content: [{
      type: "text",
      text: `The sum is ${args.a + args.b}`
    }],
    structuredContent: {
      sum: args.a + args.b
    }
  })
);
```

### Advanced Tool with Async Handler

```typescript
this.registerToolHelper(
  'fetch_data',
  {
    description: 'Fetch data from an API',
    inputSchema: z.object({
      endpoint: z.string().url(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
      body: z.record(z.any()).optional()
    }),
    outputSchema: z.object({
      status: z.number(),
      data: z.any()
    })
  },
  async (args) => {
    const response = await fetch(args.endpoint, {
      method: args.method,
      body: args.body ? JSON.stringify(args.body) : undefined,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    return {
      content: [{
        type: "text",
        text: `Response: ${JSON.stringify(data)}`
      }],
      structuredContent: {
        status: response.status,
        data: data
      }
    };
  }
);
```

### Tool with Complex Validation

```typescript
this.registerToolHelper(
  'process_user',
  {
    description: 'Process user information',
    inputSchema: z.object({
      name: z.string().min(2).max(50),
      email: z.string().email(),
      age: z.number().int().min(0).max(120),
      preferences: z.object({
        newsletter: z.boolean().default(false),
        notifications: z.enum(['all', 'important', 'none']).default('important')
      }).optional(),
      tags: z.array(z.string()).max(10).optional()
    }),
    outputSchema: z.object({
      userId: z.string(),
      status: z.enum(['created', 'updated', 'error'])
    })
  },
  async (args) => {
    // Process user data
    const userId = await this.createOrUpdateUser(args);
    
    return {
      content: [{
        type: "text",
        text: `User ${args.name} processed successfully`
      }],
      structuredContent: {
        userId,
        status: 'created'
      }
    };
  }
);
```

## Registering Resources

Resources provide static or dynamic content that can be accessed by clients.

### Basic Resource Registration

```typescript
this.registerResourceHelper(
  'config.json',
  'config://settings',
  {
    description: 'Application configuration',
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }
  },
  async () => {
    const config = await this.loadConfiguration();
    
    return {
      contents: [{
        text: JSON.stringify(config, null, 2),
        uri: 'config.json',
        mimeType: 'application/json'
      }]
    };
  }
);
```

### Resource with File Reading

```typescript
this.registerResourceHelper(
  'document.pdf',
  'file://documents/important.pdf',
  {
    description: 'Important document',
    content: '/path/to/document.pdf'
  },
  async () => {
    const pdfContent = await extractPdfTextFromFile('/path/to/document.pdf');
    
    return {
      contents: [{
        text: pdfContent,
        uri: 'document.txt',
        mimeType: 'text/plain'
      }]
    };
  }
);
```

### Dynamic Resource Generation

```typescript
this.registerResourceHelper(
  'status.json',
  'status://current',
  {
    description: 'Current system status',
    metadata: {
      refreshInterval: 30000  // 30 seconds
    }
  },
  async () => {
    const status = {
      timestamp: new Date().toISOString(),
      health: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeConnections: this.getActiveConnections()
    };
    
    return {
      contents: [{
        text: JSON.stringify(status, null, 2),
        uri: 'status.json',
        mimeType: 'application/json'
      }]
    };
  }
);
```

## Advanced Configuration

### Custom Transport Configuration

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";

// Create custom HTTP transport with session management
const customTransport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => `session_${Date.now()}_${Math.random()}`,
  cors: {
    origin: '*',
    credentials: true
  }
});

const server = new YourMCP({
  name: "CustomMCP",
  version: "1.0.0",
  transportMode: "streamable-http",
  transport: customTransport
});
```

### Environment-Based Configuration

```typescript
const config: BaseMCPConfig = {
  name: process.env.MCP_NAME || "DefaultMCP",
  version: process.env.MCP_VERSION || "1.0.0",
  host: process.env.MCP_HOST || "localhost",
  port: parseInt(process.env.MCP_PORT || "3000"),
  transportMode: (process.env.MCP_TRANSPORT || "stdio") as "stdio" | "streamable-http"
};

const server = new YourMCP(config);
```

### Multi-Server Setup

```typescript
async function startMultipleServers() {
  const servers = [
    new GreetingsMCP({
      name: "GreetingsMCP",
      version: "1.0.0",
      port: 3001,
      transportMode: "streamable-http"
    }),
    new WeatherMCP({
      name: "WeatherMCP",
      version: "1.0.0",
      port: 3002,
      transportMode: "streamable-http"
    }),
    new CalculatorMCP({
      name: "CalculatorMCP",
      version: "1.0.0",
      transportMode: "stdio"
    })
  ];
  
  await Promise.all(servers.map(server => server.start()));
  console.log("All servers started!");
}
```

## Best Practices

### 1. Error Handling

Always implement proper error handling in your tools:

```typescript
private async riskyOperation(args: any): Promise<CallToolResult> {
  try {
    const result = await this.performOperation(args);
    return {
      content: [{
        type: "text",
        text: `Success: ${result}`
      }],
      structuredContent: { result }
    };
  } catch (error) {
    console.error('Operation failed:', error);
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      structuredContent: {
        error: true,
        message: error.message
      }
    };
  }
}
```

### 2. Input Validation

Use Zod schemas for comprehensive validation:

```typescript
const EmailSchema = z.string().email().toLowerCase().trim();
const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
const DateSchema = z.string().datetime();

inputSchema: z.object({
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  birthDate: DateSchema
})
```

### 3. Logging and Monitoring

Implement logging for debugging and monitoring:

```typescript
export class MonitoredMCP extends BaseMCPServer {
  private logger: Logger;
  
  constructor(params: BaseMCPConfig) {
    super(params);
    this.logger = new Logger(this.name);
  }
  
  protected registerComponents(): void {
    this.logger.info('Registering components...');
    // Register tools
  }
  
  private async toolHandler(args: any): Promise<CallToolResult> {
    const startTime = Date.now();
    this.logger.debug('Tool called with args:', args);
    
    try {
      const result = await this.process(args);
      this.logger.info(`Tool completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      this.logger.error('Tool failed:', error);
      throw error;
    }
  }
}
```

### 4. Resource Caching

Implement caching for frequently accessed resources:

```typescript
export class CachedMCP extends BaseMCPServer {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 60000; // 1 minute
  
  private async getCachedResource(key: string, loader: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    const data = await loader();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

### 5. Graceful Shutdown

Implement cleanup on server shutdown:

```typescript
export class GracefulMCP extends BaseMCPServer {
  private cleanup?: () => Promise<void>;
  
  async shutdown(): Promise<void> {
    console.log('Shutting down server...');
    
    if (this.cleanup) {
      await this.cleanup();
    }
    
    // Close connections, save state, etc.
    await this.disconnect();
    console.log('Server shutdown complete');
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  await server.shutdown();
  process.exit(0);
});
```

## API Reference

### BaseMCPServer

#### Constructor
```typescript
constructor(params: BaseMCPConfig)
```

#### Protected Methods
```typescript
protected abstract registerComponents(): void
protected registerToolHelper<TInput, TOutput>(
  name: string,
  config: ToolConfig<TInput, TOutput>,
  handler: ToolHandler<TInput>
): void
protected registerResourceHelper(
  name: string,
  uri: string,
  config: ResourceConfig,
  handler: ResourceHandler
): void
```

#### Public Methods
```typescript
public async connect(): Promise<void>
public async start(): Promise<void>
public getHTTPTransporter(): StreamableHTTPServerTransport | undefined
public getStdioTransporter(): StdioServerTransport | undefined
public getTransporter(): Transport
public getMetadata(): ServerMetadata
```

### Types

```typescript
interface BaseMCPConfig {
  name: string;
  version: string;
  host?: string;
  port?: number;
  transportMode: "stdio" | "streamable-http";
  transport?: Transport;
}

interface CallToolResult {
  content: Array<{ type: string; text: string }>;
  structuredContent?: any;
}

interface ToolConfig<TInput, TOutput> {
  description: string;
  inputSchema: ZodSchema<TInput>;
  outputSchema: ZodSchema<TOutput>;
}

interface ResourceConfig {
  description: string;
  content?: string;
  metadata?: Record<string, any>;
}

interface ServerMetadata {
  name: string;
  version: string;
  transportMode: TransportMode;
  host: string;
  port: number;
}
```

## Examples

### Complete Database Query Server

```typescript
import { BaseMCPServer, BaseMCPConfig } from "./base/BaseMCPServer";
import { Database } from 'your-database-library';
import z from "zod";

export class DatabaseMCP extends BaseMCPServer {
  private db: Database;
  
  constructor(params: BaseMCPConfig & { databaseUrl: string }) {
    super(params);
    this.db = new Database(params.databaseUrl);
  }
  
  protected registerComponents(): void {
    // Query tool
    this.registerToolHelper(
      'query',
      {
        description: 'Execute a database query',
        inputSchema: z.object({
          sql: z.string(),
          params: z.array(z.any()).optional()
        }),
        outputSchema: z.object({
          rows: z.array(z.record(z.any())),
          rowCount: z.number()
        })
      },
      async (args) => {
        const result = await this.db.query(args.sql, args.params);
        return {
          content: [{
            type: "text",
            text: `Query returned ${result.rows.length} rows`
          }],
          structuredContent: {
            rows: result.rows,
            rowCount: result.rows.length
          }
        };
      }
    );
    
    // Schema inspection resource
    this.registerResourceHelper(
      'schema.json',
      'db://schema',
      {
        description: 'Database schema information'
      },
      async () => {
        const schema = await this.db.getSchema();
        return {
          contents: [{
            text: JSON.stringify(schema, null, 2),
            uri: 'schema.json',
            mimeType: 'application/json'
          }]
        };
      }
    );
  }
}
```

### File Processing Server

```typescript
import { BaseMCPServer, BaseMCPConfig } from "./base/BaseMCPServer";
import fs from 'fs/promises';
import path from 'path';
import z from "zod";

export class FileProcessorMCP extends BaseMCPServer {
  private workDir: string;
  
  constructor(params: BaseMCPConfig & { workDir: string }) {
    super(params);
    this.workDir = params.workDir;
  }
  
  protected registerComponents(): void {
    // Read file tool
    this.registerToolHelper(
      'read_file',
      {
        description: 'Read a file from the work directory',
        inputSchema: z.object({
          filename: z.string(),
          encoding: z.enum(['utf8', 'base64', 'hex']).default('utf8')
        }),
        outputSchema: z.object({
          content: z.string(),
          size: z.number()
        })
      },
      async (args) => {
        const filepath = path.join(this.workDir, args.filename);
        const content = await fs.readFile(filepath, args.encoding);
        const stats = await fs.stat(filepath);
        
        return {
          content: [{
            type: "text",
            text: `File read successfully (${stats.size} bytes)`
          }],
          structuredContent: {
            content: content.toString(),
            size: stats.size
          }
        };
      }
    );
    
    // Write file tool
    this.registerToolHelper(
      'write_file',
      {
        description: 'Write content to a file',
        inputSchema: z.object({
          filename: z.string(),
          content: z.string(),
          encoding: z.enum(['utf8', 'base64', 'hex']).default('utf8')
        }),
        outputSchema: z.object({
          success: z.boolean(),
          bytesWritten: z.number()
        })
      },
      async (args) => {
        const filepath = path.join(this.workDir, args.filename);
        await fs.writeFile(filepath, args.content, args.encoding);
        const stats = await fs.stat(filepath);
        
        return {
          content: [{
            type: "text",
            text: `File written successfully`
          }],
          structuredContent: {
            success: true,
            bytesWritten: stats.size
          }
        };
      }
    );
    
    // Directory listing resource
    this.registerResourceHelper(
      'directory.json',
      'file://directory/listing',
      {
        description: 'List files in work directory'
      },
      async () => {
        const files = await fs.readdir(this.workDir, { withFileTypes: true });
        const listing = await Promise.all(
          files.map(async (file) => {
            const stats = await fs.stat(path.join(this.workDir, file.name));
            return {
              name: file.name,
              type: file.isDirectory() ? 'directory' : 'file',
              size: stats.size,
              modified: stats.mtime.toISOString()
            };
          })
        );
        
        return {
          contents: [{
            text: JSON.stringify(listing, null, 2),
            uri: 'directory.json',
            mimeType: 'application/json'
          }]
        };
      }
    );
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Transport Not Initialized
**Error:** "HTTP transporter is not initialized"

**Solution:**
```typescript
// Ensure transport mode is set correctly
const server = new YourMCP({
  transportMode: "streamable-http", // Must match the transport you're trying to use
  // ...
});
```

#### 2. Tool Registration Fails
**Error:** "Tool registration failed"

**Solution:**
```typescript
// Ensure handler is bound correctly
this.registerToolHelper(
  'tool_name',
  config,
  this.handler.bind(this)  // Don't forget .bind(this)
);
```

#### 3. Schema Validation Errors
**Error:** "Invalid input schema"

**Solution:**
```typescript
// Use proper Zod schemas
inputSchema: z.object({
  field: z.string()  // Correct
})

// Not:
inputSchema: {
  field: z.string()  // Missing z.object()
}
```

#### 4. Connection Issues (HTTP Mode)
**Error:** "EADDRINUSE: address already in use"

**Solution:**
```typescript
// Use a different port or kill the process using the port
const server = new YourMCP({
  port: 3001,  // Try a different port
  // ...
});
```

#### 5. Async Handler Not Awaited
**Error:** "Promise returned instead of result"

**Solution:**
```typescript
// Mark handler as async and use await
private async myHandler(args: any): Promise<CallToolResult> {
  const result = await someAsyncOperation();  // Don't forget await
  return {
    content: [{ type: "text", text: result }],
    structuredContent: { result }
  };
}
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
export class DebugMCP extends BaseMCPServer {
  private debug = process.env.DEBUG === 'true';
  
  protected registerComponents(): void {
    if (this.debug) {
      console.log('[DEBUG] Registering components');
    }
    // ...
  }
  
  private async handler(args: any): Promise<CallToolResult> {
    if (this.debug) {
      console.log('[DEBUG] Handler called:', JSON.stringify(args, null, 2));
    }
    // ...
  }
}
```

### Performance Monitoring

```typescript
class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
      
      if (duration > 1000) {
        console.warn(`[PERF] ${name} took ${duration.toFixed(2)}ms`);
      }
    }
  }
  
  getStats(name: string) {
    const times = this.metrics.get(name) || [];
    if (times.length === 0) return null;
    
    return {
      count: times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length
    };
  }
}
```

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
5. Start development: `npm run dev`

### Testing Your MCP Server

```typescript
// test/YourMCP.test.ts
import { YourMCP } from '../src/servers/YourMCP';

describe('YourMCP', () => {
  let server: YourMCP;
  
  beforeEach(() => {
    server = new YourMCP({
      name: "TestMCP",
      version: "1.0.0",
      transportMode: "stdio"
    });
  });
  
  test('should register tools', () => {
    const metadata = server.getMetadata();
    expect(metadata.name).toBe("TestMCP");
  });
  
  test('tool should return expected result', async () => {
    // Test your tool handlers
  });
});
```

## License

MIT License - See LICENSE file for details
<!-- 
## Support

For issues, questions, or contributions:
- GitHub Issues: [your-repo/issues](https://github.com/your-repo/issues)
- Documentation: [your-docs-site](https://docs.your-site.com)
- Discord: [your-discord](https://discord.gg/your-server)

--- -->

