import { BaseMCPServer } from "../base-mcp-server.js";
import type { BaseMCPConfig } from "../base-mcp-server.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

/**
 * Example Weather MCP Server to demonstrate the base class flexibility
 */
export class WeatherMCP extends BaseMCPServer {
  private apiKey: string | undefined;

  constructor(params: BaseMCPConfig & { apiKey?: string }) {
    super(params);
    this.apiKey = params.apiKey;
  }

  /**
   * Register weather-related tools and resources
   */
  protected registerComponents(): void {
    // Register get weather tool
    this.registerToolHelper(
      'get_weather',
      {
        description: 'Get current weather for a location',
        inputSchema: {
          location: z.string().min(1).max(100),
          units: z.enum(['celsius', 'fahrenheit']).default('celsius')
        },
        outputSchema: {
          temperature: z.number(),
          description: z.string(),
          humidity: z.number(),
          windSpeed: z.number()
        }
      },
      this.getWeather.bind(this)
    );

    // Register weather forecast tool
    this.registerToolHelper(
      'get_forecast',
      {
        description: 'Get weather forecast for the next few days',
        inputSchema: {
          location: z.string().min(1).max(100),
          days: z.number().min(1).max(7).default(3)
        },
        outputSchema: {
          forecasts: z.array(z.object({
            date: z.string(),
            high: z.number(),
            low: z.number(),
            description: z.string()
          }))
        }
      },
      this.getForecast.bind(this)
    );

    // Register weather alerts resource
    this.registerResourceHelper(
      'weather_alerts.json',
      'weather://alerts/current',
      {
        description: 'Current weather alerts and warnings',
        metadata: {
          updateFrequency: '15 minutes',
          source: 'National Weather Service'
        }
      },
      this.getWeatherAlerts.bind(this)
    );
  }

  /**
   * Get current weather implementation
   */
  private async getWeather(args: { location: string; units: 'celsius' | 'fahrenheit' }): Promise<CallToolResult> {
    // In a real implementation, this would call a weather API
    // For demo purposes, returning mock data
    const mockTemp = args.units === 'celsius' ? 22 : 72;
    
    return {
      content: [
        {
          type: "text",
          text: `Current weather in ${args.location}: ${mockTemp}° ${args.units === 'celsius' ? 'C' : 'F'}, Partly cloudy`
        }
      ],
      structuredContent: {
        temperature: mockTemp,
        description: "Partly cloudy",
        humidity: 65,
        windSpeed: 10
      }
    };
  }

  /**
   * Get weather forecast implementation
   */
  private async getForecast(args: { location: string; days: number }): Promise<CallToolResult> {
    // Mock forecast data
    const forecasts = Array.from({ length: args.days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return {
        date: date.toISOString().split('T')[0],
        high: 25 - i,
        low: 15 - i,
        description: ['Sunny', 'Partly cloudy', 'Cloudy'][i % 3]
      };
    });

    return {
      content: [
        {
          type: "text",
          text: `${args.days}-day forecast for ${args.location}:\n${forecasts.map(f => 
            `${f.date}: ${f.description}, High: ${f.high}°C, Low: ${f.low}°C`
          ).join('\n')}`
        }
      ],
      structuredContent: {
        forecasts
      }
    };
  }

  /**
   * Get weather alerts
   */
  private async getWeatherAlerts(): Promise<any> {
    // Mock weather alerts
    const alerts = [
      {
        type: "warning",
        title: "Heavy Rain Warning",
        description: "Heavy rainfall expected in the next 24 hours",
        severity: "moderate",
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return {
      contents: [
        {
          text: JSON.stringify(alerts, null, 2),
          uri: 'weather_alerts.json',
          mimeType: 'application/json'
        }
      ]
    };
  }
}

/**
 * Example Calculator MCP Server to show another use case
 */
export class CalculatorMCP extends BaseMCPServer {
  protected registerComponents(): void {
    // Basic arithmetic operations
    this.registerToolHelper(
      'calculate',
      {
        description: 'Perform basic arithmetic calculations',
        inputSchema:{
          operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
          a: z.number(),
          b: z.number()
        },
        outputSchema: {
          result: z.number(),
          expression: z.string()
        }
      },
      this.calculate.bind(this)
    );

    // Advanced math operations
    this.registerToolHelper(
      'advanced_math',
      {
        description: 'Perform advanced mathematical operations',
        inputSchema: {
          operation: z.string(),
          value: z.number(),
          exponent: z.number().optional()
        },
        outputSchema: {
          result: z.number()
        }
      },
      this.advancedMath.bind(this)
    );
  }

  private calculate(args: { operation: string; a: number; b: number }): CallToolResult {
    let result: number;
    let expression: string;

    switch (args.operation) {
      case 'add':
        result = args.a + args.b;
        expression = `${args.a} + ${args.b} = ${result}`;
        break;
      case 'subtract':
        result = args.a - args.b;
        expression = `${args.a} - ${args.b} = ${result}`;
        break;
      case 'multiply':
        result = args.a * args.b;
        expression = `${args.a} × ${args.b} = ${result}`;
        break;
      case 'divide':
        if (args.b === 0) {
          return {
            content: [{ type: "text", text: "Error: Division by zero" }],
            structuredContent: { error: "Division by zero" }
          };
        }
        result = args.a / args.b;
        expression = `${args.a} ÷ ${args.b} = ${result}`;
        break;
      default:
        return {
          content: [{ type: "text", text: "Error: Unknown operation" }],
          structuredContent: { error: "Unknown operation" }
        };
    }

    return {
      content: [{ type: "text", text: expression }],
      structuredContent: { result, expression }
    };
  }

  private advancedMath(args: { operation: string; value: number; exponent?: number |  undefined}): CallToolResult {
    let result: number;

    switch (args.operation) {
      case 'sqrt':
        result = Math.sqrt(args.value);
        break;
      case 'pow':
        result = Math.pow(args.value, args.exponent || 2);
        break;
      case 'log':
        result = Math.log(args.value);
        break;
      case 'sin':
        result = Math.sin(args.value);
        break;
      case 'cos':
        result = Math.cos(args.value);
        break;
      case 'tan':
        result = Math.tan(args.value);
        break;
      default:
        return {
          content: [{ type: "text", text: "Error: Unknown operation" }],
          structuredContent: { error: "Unknown operation" }
        };
    }

    return {
      content: [{ type: "text", text: `Result: ${result}` }],
      structuredContent: { result }
    };
  }
}

// Example usage showing how to create different servers
async function examples() {
  // Create a Weather MCP server with HTTP transport
  const weatherServer = new WeatherMCP({
    name: "WeatherMCP",
    version: "2.0.0",
    host: "localhost",
    port: 3001,
    transportMode: "streamable-http",
    apiKey: "your-weather-api-key"
  });

  // Create a Calculator MCP server with stdio transport
  const calculatorServer = new CalculatorMCP({
    name: "CalculatorMCP",
    version: "1.0.0",
    host: "localhost",
    port: 3002,
    transportMode: "stdio"
  });

  // Start both servers
  await Promise.all([
    weatherServer.start(),
    calculatorServer.start()
  ]);

  console.log("All servers started successfully!");
}