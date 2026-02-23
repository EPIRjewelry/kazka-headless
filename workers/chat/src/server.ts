/**
 * EPIR Chat Worker – HTTP API + Agents (AIChatAgent)
 * - POST /api/chat: prosty endpoint dla Hydrogen (fetch) – Workers AI GLM-4.7-Flash
 * - /agents/*: routeAgentRequest dla klientów Agents SDK (WebSocket)
 */
import {AIChatAgent} from '@cloudflare/ai-chat';
import {routeAgentRequest} from 'agents';
import {createWorkersAI} from 'workers-ai-provider';
import {generateText, streamText, convertToModelMessages} from 'ai';

export interface Env {
  AI: unknown;
  ChatAgent: DurableObjectNamespace;
}

const SYSTEM_PROMPT =
  'Jesteś pomocnym asystentem sklepu biżuterii EPIR Art Jewellery. Odpowiadaj po polsku, krótko i rzeczowo.';

const MOCK_PRODUCTS = [
  {id: 'gid://shopify/Product/1234567890', title: 'Przykładowy produkt 1'},
  {id: 'gid://shopify/Product/1234567891', title: 'Przykładowy produkt 2'},
];

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function handleChatApi(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') return corsPreflight();
  if (request.method !== 'POST') {
    return jsonResponse({error: 'Method not allowed'}, 405);
  }

  let body: {message?: string; anonymousId?: string; cartId?: string};
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    return jsonResponse({error: 'Invalid JSON body'}, 400);
  }

  const {message} = body;
  if (!message || typeof message !== 'string') {
    return jsonResponse({error: 'message is required'}, 400);
  }

  try {
    const workersai = createWorkersAI({binding: env.AI});
    const {text: reply} = await generateText({
      model: workersai('@cf/zai-org/glm-4.7-flash'),
      system: SYSTEM_PROMPT,
      messages: [{role: 'user' as const, content: message}],
    });

    return jsonResponse({reply, suggestedProducts: MOCK_PRODUCTS});
  } catch (err) {
    console.error('[chat] Workers AI error:', err);
    return jsonResponse(
      {error: err instanceof Error ? err.message : 'AI error'},
      500,
    );
  }
}

export class ChatAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    const workersai = createWorkersAI({binding: this.env.AI});

    const result = streamText({
      model: workersai('@cf/zai-org/glm-4.7-flash'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(this.messages),
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/chat') {
      return handleChatApi(request, env);
    }
    if (request.method === 'OPTIONS' && url.pathname === '/api/chat') {
      return corsPreflight();
    }
    return (
      (await routeAgentRequest(request, env)) ||
      new Response('Not found', {status: 404})
    );
  },
};
