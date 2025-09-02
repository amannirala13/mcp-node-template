import { McpServer, type ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z, { type ZodRawShape } from "zod";

// Base configuration schema that all MCP servers will share
export const BaseMCPConfigSchema = z.object({
  name: z.string().min(2).max(100),
  version: z.string().min(1).max(10),
  host: z.string().min(2).max(100).default("localhost"),
  port: z.number().min(1).max(65535).default(3000),
  transportMode: z.enum(["streamable-http", "stdio"]).default("stdio"),
  transport: z.union([
    z.instanceof(StreamableHTTPServerTransport), 
    z.instanceof(StdioServerTransport)
  ]).optional()
});

export type BaseMCPConfig = z.infer<typeof BaseMCPConfigSchema>;
export type TransportMode = "streamable-http" | "stdio";

/**
 * Abstract base class for creating MCP servers with configurable transport modes
 *
 * @example
 *
 * ```ts
 * 
 * class YourMCP extends BaseMCPServer {
 *   protected registerComponents(): void {
 *     // Register your tools and resources here
 *   }
 *
 *   // Add your tool implementations
 * }

 * Create and start
 * const server = new YourMCP(config);
 * await server.start();
 *
 * ```
 */
export abstract class BaseMCPServer extends McpServer {
  protected readonly name: string;
  protected readonly version: string;
  protected readonly host: string;
  protected readonly port: number;
  protected readonly transportMode: TransportMode;
  private httpTransporter?: StreamableHTTPServerTransport;
  private stdioTransporter?: StdioServerTransport;

  constructor(params: BaseMCPConfig) {
    super(params);
    
    // Validate configuration
    const validatedParams = BaseMCPConfigSchema.parse(params);
    
    this.name = validatedParams.name;
    this.version = validatedParams.version;
    this.host = validatedParams.host;
    this.port = validatedParams.port;
    this.transportMode = validatedParams.transportMode;

    // Initialize transport based on mode
    this.initializeTransport(validatedParams.transport);
    
    // Allow subclasses to register their tools and resources
    this.registerComponents();
  }

  /**
   * Initialize the appropriate transport based on the configured mode
   */
  private initializeTransport(customTransport?: StreamableHTTPServerTransport | StdioServerTransport): void {
    if (this.transportMode === "streamable-http") {
      if (customTransport && customTransport instanceof StreamableHTTPServerTransport) {
        this.httpTransporter = customTransport;
      } else {
        this.httpTransporter = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined
        });
      }
    } else {
      if (customTransport && customTransport instanceof StdioServerTransport) {
        this.stdioTransporter = customTransport;
      } else {
        this.stdioTransporter = new StdioServerTransport();
      }
    }
  }

  /**
   * Abstract method that subclasses must implement to register their tools and resources
   */
  protected abstract registerComponents(): void;

  /**
   * Helper method to register a tool with proper typing
   */
  protected registerToolHelper<TInput extends ZodRawShape, TOutput extends ZodRawShape>(
    name: string,
    config: {
      description: string;
      inputSchema: TInput;
      outputSchema: TOutput;
    },
    handler: ToolCallback<TInput>
  ): void {
    this.registerTool(name, config, handler);
  }

  /**
   * Helper method to register a resource
   */
  protected registerResourceHelper(
    name: string,
    uri: string,
    config: {
      description: string;
      content?: string;
      metadata?: Record<string, any>;
    },
    handler: () => Promise<any>
  ): void {
    this.registerResource(name, uri, config, handler);
  }

  /**
   * Get the HTTP transporter if available
   */
  public getHTTPTransporter(): StreamableHTTPServerTransport | undefined {
    return this.httpTransporter;
  }

  /**
   * Get the Stdio transporter if available
   */
  public getStdioTransporter(): StdioServerTransport | undefined {
    return this.stdioTransporter;
  }

  /**
   * Get the active transporter based on the current transport mode
   */
  public getTransporter(): StreamableHTTPServerTransport | StdioServerTransport {
    if (this.transportMode === "streamable-http") {
      if (!this.httpTransporter) {
        throw new Error("HTTP transporter is not initialized");
      }
      return this.httpTransporter;
    } else {
      if (!this.stdioTransporter) {
        throw new Error("Stdio transporter is not initialized");
      }
      return this.stdioTransporter;
    }
  }

  /**
   * Connect the server using the configured transport
   */
  public async connect(): Promise<void> {
    const transporter = this.getTransporter();
    await super.connect(transporter);
  }

  /**
   * Start the server (HTTP mode only)
   */
  public async start(): Promise<void> {
    if (this.transportMode === "streamable-http" && this.httpTransporter) {
      console.log(`Starting ${this.name} v${this.version} on http://${this.host}:${this.port}`);
      // Additional HTTP server startup logic can go here
    } else if (this.transportMode === "stdio") {
      console.log(`Starting ${this.name} v${this.version} in stdio mode`);
    }
    
    await this.connect();
  }

  /**
   * Get server metadata
   */
  public getMetadata(): {
    name: string;
    version: string;
    transportMode: TransportMode;
    host: string;
    port: number;
  } {
    return {
      name: this.name,
      version: this.version,
      transportMode: this.transportMode,
      host: this.host,
      port: this.port
    };
  }
}