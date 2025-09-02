import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { extractPdfTextFromFile } from "../../core/utils/pdf-to-text.js";
import z from "zod";
import { BaseMCPServer } from "../base-mcp-server.js";
import type { BaseMCPConfig } from "../base-mcp-server.js";

/**
 * Example implementation of a Greetings MCP Server
 */
export class GreetingsMCP extends BaseMCPServer {
  constructor(params: BaseMCPConfig) {
    super(params);
  }

  /**
   * Register all tools and resources for the Greetings server
   */
  protected registerComponents(): void {

    // Register the greet tool
    this.registerToolHelper(
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

    // Register the notice resource
    this.registerResourceHelper(
      'notice.txt',
      'https://shivajichk.ac.in/pdf/1_International_Yoga_Day_Celebration_ATR.pdf',
      {
        description: 'A sample notice file',
        content: '/Users/aman/Developer/SynergyBoat/content-gen/src/assets/pdf/notice.pdf'
      },
      this.getNoticeContent.bind(this)
    );

    this.registerToolHelper(
      'regiter_custom_greeting',
      {
        description: "This tool will register new custom greeting message",
        inputSchema: {},
        outputSchema: {
          text: z.string()
        },
      },
      this.registerCustomGreeting.bind(this)
    )
  }

  private registerCustomGreeting(): CallToolResult  {
    this.registerToolHelper(
      'custom_greet',
      {
        description: 'Greet the user with a custom message',
        inputSchema: {
          name: z.string(),
          message: z.string()
        },
        outputSchema: {
          text: z.string()
        }
      },
      this.customGreet.bind(this)
    );
    return {
      content: [
        {
          type: "text",
          text: `Custom greeting registered successfully!`
        }
      ],
      structuredContent: {
        text: `Custom greeting registered successfully!`
      }
    };
  }

  /**
   * Greet tool implementation
   */
  private greet(args: { name: string }): CallToolResult {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${args.name}! Welcome to ${this.name} version ${this.version}.`,
        }
      ],
      structuredContent: {
        text: `Hello, ${args.name}! Welcome to ${this.name} version ${this.version}.`
      }
    };
  }

  /**
   * Get notice content from PDF
   */
  private async getNoticeContent(): Promise<any> {
    const pdfPath = '/Users/aman/Developer/SynergyBoat/content-gen/src/assets/pdf/notice.pdf';
    const pdfText = await extractPdfTextFromFile(pdfPath);

    return {
      contents: [
        {
          text: pdfText,
          uri: 'notice.txt',
          mimeType: 'text/plain'
        }
      ]
    };
  }

  private async customGreet(args: { name: string; message: string }): Promise<CallToolResult> {
  return {
    content: [
      {
        type: "text",
        text: `Hello, ${args.name}! ${args.message}`,
      }
    ],
    structuredContent: {
      text: `Hello, ${args.name}! ${args.message}`
    }
  };
}
}

// // Example usage
// async function main() {
//   // Create a Greetings MCP server with stdio transport
//   const greetingsServer = new GreetingsMCP({
//     name: "GreetingsMCP",
//     version: "1.0.0",
//     host: "localhost",
//     port: 3000,
//     transportMode: "stdio"
//   });

//   // Start the server
//   await greetingsServer.start();
  
//   // Get server metadata
//   const metadata = greetingsServer.getMetadata();
//   console.log("Server started:", metadata);
// }

// // Run if this is the main module
// if (import.meta.url === `file://${process.argv[1]}`) {
//   main().catch(console.error);
// }