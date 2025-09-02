// src/metrics.ts
import { Counter, Histogram, register } from 'prom-client';
export const toolCalls = new Counter({ name: 'tool_calls_total', help: 'Count of tool calls', labelNames: ['tool'] });
export const toolLatency = new Histogram({ name: 'tool_latency_ms', help: 'Tool latency', buckets: [10, 50, 100, 300, 1000] });

/**
 * Metrics handler for exposing Prometheus metrics
 * @param _req - The request object
 * @param res - The response object
 * 
 * @example - Basic usage
 * ```ts
 * import { metricsHandler } from './metrics';
 * app.get('/metrics', metricsHandler);
 * ```
 */
export function metricsHandler(_req: any, res: any) {
  res.set('Content-Type', register.contentType);
  register.metrics().then(m => res.end(m));
}