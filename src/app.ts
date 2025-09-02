import express from 'express';
import { metricsHandler } from './core/metrics';
import { errorHandler } from './middleware/error';
import { logger } from './core/logger';
import e from 'cors';
import { env } from './core/env';
import {GreetingsMCP} from './mcp/examples/greetings.mcp.server.js';
import { transport } from 'pino';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const greetingMCP = new GreetingsMCP({
    name: 'Greetings MCP',
    version: '1.0.0',
    host: 'localhost',
    port: 3000,
    transportMode: 'streamable-http',
});

app.post('/greet', async (req, res, next) => {
    logger.warn(`Received request to /greet with body: ${JSON.stringify(req.body)}`);
    const httpTransporter = greetingMCP.getHTTPTransporter();
    if (!httpTransporter) {
        return res.status(500).json({ error: 'HTTP transporter is not available' });
    }
    await httpTransporter.handleRequest(req, res, req.body);
    await next();
});

app.get('/metrics', metricsHandler);

app.use(errorHandler);

function startServer() {
    const PORT = env.PORT || 3000;
    app.listen(PORT, () => {
        greetingMCP.start();
        //greetingMCP.connect();
        logger.info(`Server is running on port ${PORT}`);
    });
}

startServer();
