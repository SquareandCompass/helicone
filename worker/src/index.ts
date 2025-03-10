import { createClient } from "@supabase/supabase-js";
import { feedbackCronHandler } from "./feedback";
import { RequestWrapper } from "./lib/RequestWrapper";
import { ClickhouseClientWrapper } from "./lib/db/clickhouse";
import { addFeedbackToResponse } from "./lib/dbLogger/clickhouseLog";
import {
  RequestResponseQueuePayload,
  insertIntoRequest,
  insertIntoResponse,
} from "./lib/dbLogger/insertQueue";
import { buildRouter } from "./routers/routerFactory";

const FALLBACK_QUEUE = "fallback-queue";

export type Provider = "OPENAI" | "ANTHROPIC" | "CUSTOM";

export interface Env {
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_URL: string;
  TOKENIZER_COUNT_API: string;
  TOKEN_COUNT_URL: string;
  RATE_LIMIT_KV: KVNamespace;
  CACHE_KV: KVNamespace;
  REQUEST_AND_RESPONSE_QUEUE_KV: KVNamespace;
  CLICKHOUSE_HOST: string;
  CLICKHOUSE_USER: string;
  CLICKHOUSE_PASSWORD: string;
  WORKER_TYPE: "OPENAI_PROXY" | "ANTHROPIC_PROXY" | "HELICONE_API";
  TOKEN_CALC_URL: string;
  VAULT_ENABLED: string;
  STORAGE_URL: string;
}

export async function hash(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashedKey = await crypto.subtle.digest(
    { name: "SHA-256" },
    encoder.encode(key)
  );
  const byteArray = Array.from(new Uint8Array(hashedKey));
  const hexCodes = byteArray.map((value) => {
    const hexCode = value.toString(16);
    const paddedHexCode = hexCode.padStart(2, "0");
    return paddedHexCode;
  });
  return hexCodes.join("");
}

// If the url starts with oai.*.<>.com then we know WORKER_TYPE is OPENAI_PROXY
function modifyEnvBasedOnPath(env: Env, request: RequestWrapper): Env {
  if (env.WORKER_TYPE) {
    return env;
  }
  const url = new URL(request.getUrl());
  const host = url.host;
  const hostParts = host.split(".");
  if (hostParts.length >= 3 && hostParts[0].includes("oai")) {
    return {
      ...env,
      WORKER_TYPE: "OPENAI_PROXY",
    };
  } else if (hostParts.length >= 3 && hostParts[0].includes("anthropic")) {
    return {
      ...env,
      WORKER_TYPE: "ANTHROPIC_PROXY",
    };
  } else if (hostParts.length >= 3 && hostParts[0].includes("api")) {
    return {
      ...env,
      WORKER_TYPE: "HELICONE_API",
    };
  } else {
    throw new Error("Could not determine worker type");
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const requestWrapper = await RequestWrapper.create(request, env);
      if (requestWrapper.error || !requestWrapper.data) {
        return handleError(requestWrapper.error);
      }
      env = modifyEnvBasedOnPath(env, requestWrapper.data);
      const router = buildRouter(env.WORKER_TYPE);
      return router
        .handle(request, requestWrapper.data, env, ctx)
        .catch(handleError);
    } catch (e) {
      return handleError(e);
    }
  },
  async queue(_batch: MessageBatch<string>, env: Env): Promise<void> {
    if (_batch.queue.includes(FALLBACK_QUEUE)) {
      const batch = _batch as MessageBatch<string>;

      let sawError = false;
      for (const message of batch.messages) {
        const payload =
          await env.REQUEST_AND_RESPONSE_QUEUE_KV.get<RequestResponseQueuePayload>(
            message.body
          );
        if (!payload) {
          console.error(`No payload found for ${message.body}`);
          sawError = true;
          continue;
        }
        if (payload._type === "request") {
          insertIntoRequest(
            createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY),
            payload.payload
          );
        } else if (payload._type === "response") {
          insertIntoResponse(
            createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY),
            payload.payload
          );
        }
      }
      if (!sawError) {
        batch.ackAll();
        return;
      }
    } else {
      console.error(`Unknown queue: ${_batch.queue}`);
    }
  },
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    return await feedbackCronHandler(env);
  },
};

function handleError(e: any): Response {
  console.error(e);
  return new Response(
    JSON.stringify({
      "helicone-message":
        "Helicone ran into an error servicing your request: " + e,
      support:
        "Please reach out on our discord or email us at help@helicone.ai, we'd love to help!",
      "helicone-error": JSON.stringify(e),
    }),
    {
      status: 500,
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "helicone-error": "true",
      },
    }
  );
}
