import { registerWorker, Logger } from 'iii-sdk';
import { PLAYGROUND_HTML } from './playground.js';

const iii = registerWorker(process.env.III_URL ?? 'ws://localhost:49134');
const logger = new Logger();

iii.registerFunction(
  'startup::evaluate_pitch',
  async (payload: { idea: string; buzzwords: string[] }) => {
    logger.info('Forwarding pitch request to Python Inference Worker...', payload);

    const result = await iii.trigger({
      function_id: 'startup::calculate_valuation',
      payload: {
        idea: payload.idea || 'a generic business idea',
        buzzwords: payload.buzzwords || []
      },
    }) as any;

    return {
      ...result,
      interoperability_note:
        "Success! This payload was processed by a TypeScript worker, routed over the private VPC subnet via RPC, analyzed by a Python worker, saved to a central state DB, and returned back seamlessly.",
    };
  },
);

iii.registerFunction(
  'http::evaluate_pitch',
  async (payload: { body: { idea: string; buzzwords: string[] } }) => {
    logger.info('HTTP Gateway received dynamic pitch request', payload.body);
    
    const result = await iii.trigger({
      function_id: 'startup::evaluate_pitch',
      payload: payload.body,
    }) as any;
    
    return {
      status_code: 200,
      body: result,
      headers: { 'Content-Type': 'application/json' },
    };
  },
);

iii.registerFunction(
  'http::serve_playground',
  async () => {
    logger.info('HTTP Gateway serving interactive playground UI');
    return {
      status_code: 200,
      body: PLAYGROUND_HTML,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    };
  },
);

iii.registerTrigger({
  type: 'http',
  function_id: 'http::evaluate_pitch',
  config: { api_path: '/startup/pitch', http_method: 'POST' },
});

iii.registerTrigger({
  type: 'http',
  function_id: 'http::serve_playground',
  config: { api_path: '/', http_method: 'GET' },
});

console.log('TS Hype Caller worker started - listening for pitches and serving playground on GET /!');

