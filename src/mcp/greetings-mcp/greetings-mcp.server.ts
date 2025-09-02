import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import z from "zod";
// Import ToolResponse type from the appropriate MCP SDK location
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { extractPdfTextFromFile } from "../../core/utils/pdf-to-text.js";

const GreetingsMCPSchema = z.object({
  name: z.string().min(2).max(100),
  version: z.string().min(1).max(10),
  host: z.string().min(2).max(100),
  port: z.number().min(1).max(65535),
  transportMode: z.enum(["streamable-http", "stdio"]).default("stdio").optional(),
  transport: z.union([z.instanceof(StreamableHTTPServerTransport), z.instanceof(StdioServerTransport)]).optional()
});

class GreetingsMCP extends McpServer {
    // Adding global properties
    private name: z.infer<typeof GreetingsMCPSchema.shape.name>;
    private version: z.infer<typeof GreetingsMCPSchema.shape.version>;
    private transportMode: z.infer<typeof GreetingsMCPSchema.shape.transportMode>;
    private httpTransporter: StreamableHTTPServerTransport | undefined;
    private stdioTransporter: StdioServerTransport | undefined;
    private host: string;
    private port: number;

  constructor(params: z.infer<typeof GreetingsMCPSchema>) {
    super(params);
    this.name = params.name;
    this.version = params.version;
    this.host = params.host;
    this.port = params.port;
    this.transportMode = params.transportMode || "stdio";

    if (this.transportMode === "streamable-http") {
        if (params.transport && params.transport instanceof StreamableHTTPServerTransport) {
            this.httpTransporter = params.transport;
        } else {
            this.httpTransporter = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined
            });
        }
    } else {
        if (params.transport && params.transport instanceof StdioServerTransport) {
            this.stdioTransporter = params.transport;
        } else {
            this.stdioTransporter = new StdioServerTransport();
        }
    }

    // Register MCP tools
    this.registerTool(
        'greet',
        {
            description: 'Greet the user',
            inputSchema: {
                name: z.string().min(2).max(100)
            },
            outputSchema: {
                text: z.string()
            }
        },
        this.greet.bind(this)
    );

    this.registerResource(
        'notice.txt',
        'https://shivajichk.ac.in/pdf/1_International_Yoga_Day_Celebration_ATR.pdf',
        {
            description: 'A sample notice file',
            content: '/Users/aman/Developer/SynergyBoat/content-gen/src/assets/pdf/notice.pdf'
        },
        async () => {
            const pdfURL = '/Users/aman/Developer/SynergyBoat/content-gen/src/assets/pdf/notice.pdf';
            const pdfText = await extractPdfTextFromFile(pdfURL);

            return {
            contents: [
                {
                    text: pdfText,
                    uri: 'notice.txt',
                    mimeType: 'text/plain'
                }
            ]}
        }
    )
  }


  greet(args: {name: string}): CallToolResult {
    return {
      content: [
        {
            type: "text",
            text: `Hello, ${args.name}! Welcome to version ${this.version}.`,
        }
      ],
      structuredContent: {
        text: `Hello, ${args.name}! Welcome to version ${this.version}.`
      }
    };
  }

  getHTTPTransporter(): StreamableHTTPServerTransport | undefined {
    return this.httpTransporter;
  }

  getStdioTransporter(): StdioServerTransport | undefined {
    return this.stdioTransporter;
  }

  async connect(): Promise<void> {
    if (this.transportMode === "streamable-http" && this.httpTransporter) {
      await super.connect(this.httpTransporter);
    }
    else if (this.transportMode === "stdio" && this.stdioTransporter) {
        await super.connect(this.stdioTransporter);
    }
  }

  getTransporter(): StreamableHTTPServerTransport | StdioServerTransport {
    if (this.transportMode === "streamable-http") {
      if (!this.httpTransporter) {
        throw new Error("HTTP transporter is not initialized.");
      }
      return this.httpTransporter;
    } else {
      if (!this.stdioTransporter) {
        throw new Error("Stdio transporter is not initialized.");
      }
      return this.stdioTransporter;
    }
  }
}

export default GreetingsMCP;
