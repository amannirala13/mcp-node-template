import {GreetingsMCP}from './mcp/examples/greetings.mcp.server.js';

const greetingsMCP = new GreetingsMCP({
    name: 'Greetings MCP',
    version: '1.0.0',
    host: 'localhost',
    port: 3000,
    transportMode: 'stdio',
});

//await greetingsMCP.connect();
await greetingsMCP.connect();
