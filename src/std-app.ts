import {GreetingsMCP}from './mcp/examples/greetings.mcp.server.js';
import { WeatherMCP } from './mcp/examples/weater.mcp.server.js';


const greetingsMCP = new GreetingsMCP({
    name: 'Greetings MCP',
    version: '1.0.0',
    host: 'localhost',
    port: 3000,
    transportMode: 'stdio',
});

const weatherMCP = new WeatherMCP({
    name: 'Weather MCP',
    version: '1.0.0',
    host: 'localhost',
    port: 3001,
    transportMode: 'stdio',
    apiKey: 'your-api-key'
});

//await greetingsMCP.connect();
await weatherMCP.connect();
