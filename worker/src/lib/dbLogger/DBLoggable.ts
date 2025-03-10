import { SupabaseClient } from "@supabase/supabase-js";
import { HeliconeProxyRequest } from "../HeliconeProxyRequest/mapper";
import { ClickhouseClientWrapper } from "../db/clickhouse";
import { ChatPrompt, Prompt } from "../promptFormater/prompt";
import { logInClickhouse } from "./clickhouseLog";
import { logRequest } from "./logResponse";
import { Env, Provider } from "../..";
import { getTokenCount } from "./tokenCounter";
import { Result, mapPostgrestErr } from "../../results";
import { consolidateTextFields, getUsage } from "./responseParserHelpers";
import { Database } from "../../../supabase/database.types";
import { HeliconeHeaders } from "../HeliconeHeaders";
import { RequestWrapper } from "../RequestWrapper";
import { AsyncLogModel } from "../models/AsyncLog";
import { InsertQueue } from "./insertQueue";

export interface DBLoggableProps {
  response: {
    responseId: string;
    getResponseBody: () => Promise<string>;
    status: number;
    responseHeaders: Headers;
    omitLog: boolean;
  };
  request: {
    requestId: string;
    userId?: string;
    heliconeApiKeyAuthHash?: string;
    providerApiKeyAuthHash?: string;
    heliconeProxyKeyId?: string;
    promptId?: string;
    promptFormatter?: {
      prompt: Prompt | ChatPrompt;
      name: string;
    };
    startTime: Date;
    bodyText?: string;
    path: string;
    properties: Record<string, string>;
    isStream: boolean;
    omitLog: boolean;
    provider: Provider;
  };
  timing: {
    startTime: Date;
    endTime?: Date;
  };
  tokenCalcUrl: string;
}

export interface AuthParams {
  organizationId: string;
  userId?: string;
  heliconeApiKeyId?: number;
}

export function dbLoggableRequestFromProxyRequest(
  proxyRequest: HeliconeProxyRequest
): DBLoggableProps["request"] {
  return {
    requestId: proxyRequest.requestId,
    heliconeApiKeyAuthHash: proxyRequest.heliconeAuthHash,
    providerApiKeyAuthHash: proxyRequest.providerAuthHash,
    heliconeProxyKeyId: proxyRequest.heliconeProxyKeyId,
    promptId: proxyRequest.requestWrapper.heliconeHeaders.promptId ?? undefined,
    userId: proxyRequest.userId,
    promptFormatter:
      proxyRequest.formattedPrompt?.prompt && proxyRequest.formattedPrompt?.name
        ? {
            prompt: proxyRequest.formattedPrompt.prompt,
            name: proxyRequest.formattedPrompt.name,
          }
        : undefined,
    startTime: proxyRequest.startTime,
    bodyText: proxyRequest.bodyText ?? undefined,
    path: proxyRequest.requestWrapper.url.href,
    properties: proxyRequest.requestWrapper.heliconeHeaders.heliconeProperties,
    isStream: proxyRequest.isStream,
    omitLog: proxyRequest.omitOptions.omitRequest,
    provider: proxyRequest.provider,
  };
}

interface DBLoggableRequestFromAsyncLogModelProps {
  requestWrapper: RequestWrapper;
  env: Env;
  asyncLogModel: AsyncLogModel;
  providerRequestHeaders: HeliconeHeaders;
  providerResponseHeaders: Headers;
  provider: Provider;
}

function getResponseBody(json: any): string {
  // This will mock the response as if it came from OpenAI
  if (json.streamed_data) {
    const streamedData: any[] = json.streamed_data;
    return streamedData.map((d) => "data: " + JSON.stringify(d)).join("\n");
  }
  return JSON.stringify(json);
}

async function getHeliconeApiKeyRow(
  dbClient: SupabaseClient<Database>,
  heliconeApiKeyHash?: string
): Promise<Result<AuthParams, string>> {
  if (!heliconeApiKeyHash) {
    return { data: null, error: "Helicone api key not found" };
  }

  const { data, error } = await dbClient
    .from("helicone_api_keys")
    .select("*")
    .eq("api_key_hash", heliconeApiKeyHash)
    .eq("soft_delete", false)
    .single();

  if (error !== null) {
    return { data: null, error: error.message };
  }
  return {
    data: {
      organizationId: data?.organization_id,
      userId: data?.user_id,
      heliconeApiKeyId: data?.id,
    },
    error: null,
  };
}

async function getHeliconeProxyKeyRow(
  dbClient: SupabaseClient<Database>,
  proxyKeyId: string
): Promise<Result<AuthParams, string>> {
  const result = await dbClient
    .from("helicone_proxy_keys")
    .select("org_id")
    .eq("id", proxyKeyId)
    .eq("soft_delete", false)
    .single();

  if (result.error || !result.data) {
    return {
      data: null,
      error: result.error.message,
    };
  }

  return {
    data: {
      organizationId: result.data.org_id,
      userId: undefined,
      heliconeApiKeyId: undefined,
    },
    error: null,
  };
}

type UnPromise<T> = T extends Promise<infer U> ? U : T;

export async function dbLoggableRequestFromAsyncLogModel(
  props: DBLoggableRequestFromAsyncLogModelProps
): Promise<DBLoggable> {
  const {
    requestWrapper,
    env,
    asyncLogModel,
    providerRequestHeaders,
    providerResponseHeaders,
    provider,
  } = props;
  return new DBLoggable({
    request: {
      requestId: providerRequestHeaders.requestId ?? crypto.randomUUID(),
      heliconeApiKeyAuthHash: await requestWrapper.getProviderAuthHeader(),
      providerApiKeyAuthHash: "N/A",
      promptId: providerRequestHeaders.promptId ?? undefined,
      userId: providerRequestHeaders.userId ?? undefined,
      promptFormatter: undefined,
      startTime: new Date(
        asyncLogModel.timing.startTime.seconds * 1000 +
          asyncLogModel.timing.startTime.milliseconds
      ),
      bodyText: JSON.stringify(asyncLogModel.providerRequest.json),
      path: asyncLogModel.providerRequest.url,
      properties: providerRequestHeaders.heliconeProperties,
      isStream: asyncLogModel.providerRequest.json?.stream == true ?? false,
      omitLog: false,
      provider,
    },
    response: {
      responseId: crypto.randomUUID(),
      getResponseBody: async () =>
        getResponseBody(asyncLogModel.providerResponse.json),
      responseHeaders: providerResponseHeaders,
      status: asyncLogModel.providerResponse.status,
      omitLog: false,
    },
    timing: {
      startTime: new Date(
        asyncLogModel.timing.startTime.seconds * 1000 +
          asyncLogModel.timing.startTime.milliseconds
      ),
      endTime: new Date(
        asyncLogModel.timing.endTime.seconds * 1000 +
          asyncLogModel.timing.endTime.milliseconds
      ),
    },
    tokenCalcUrl: env.TOKEN_COUNT_URL,
  });
}

// Represents an object that can be logged to the database
export class DBLoggable {
  private response: DBLoggableProps["response"];
  private request: DBLoggableProps["request"];
  private timing: DBLoggableProps["timing"];
  private provider: Provider;
  private tokenCalcUrl: string;

  constructor(props: DBLoggableProps) {
    this.response = props.response;
    this.request = props.request;
    this.timing = props.timing;
    this.provider = props.request.provider;
    this.tokenCalcUrl = props.tokenCalcUrl;
  }

  async waitForResponse(): Promise<string> {
    return await this.response.getResponseBody();
  }

  async tokenCounter(text: string): Promise<number> {
    return getTokenCount(text, this.provider, this.tokenCalcUrl);
  }

  async parseResponse(responseBody: string): Promise<Result<any, string>> {
    const result = responseBody;
    const isStream = this.request.isStream;
    const responseStatus = this.response.status;
    const requestBody = this.request.bodyText;
    const tokenCounter = (t: string) => this.tokenCounter(t);
    if (isStream && this.provider === "ANTHROPIC") {
      return {
        error: null,
        data: {
          error: "Streaming not supported for anthropic yet",
          streamed_data: result,
        },
      };
    }

    try {
      if (
        this.provider === "ANTHROPIC" &&
        responseStatus === 200 &&
        requestBody
      ) {
        const responseJson = JSON.parse(result);
        const prompt = JSON.parse(requestBody)?.prompt ?? "";
        const completion = responseJson?.completion ?? "";
        const completionTokens = await tokenCounter(completion);
        const promptTokens = await tokenCounter(prompt);

        return {
          data: {
            ...responseJson,
            usage: {
              total_tokens: promptTokens + completionTokens,
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              helicone_calculated: true,
            },
          },
          error: null,
        };
      } else if (!isStream || responseStatus !== 200) {
        return {
          data: JSON.parse(result),
          error: null,
        };
      } else {
        const lines = result.split("\n").filter((line) => line !== "");
        const data = lines.map((line, i) => {
          if (i === lines.length - 1) return {};
          return JSON.parse(line.replace("data:", ""));
        });

        try {
          return {
            data: {
              ...consolidateTextFields(data),
              streamed_data: data,
              usage: await getUsage(data, requestBody, tokenCounter),
            },
            error: null,
          };
        } catch (e) {
          console.error("Error parsing response", e);
          return {
            data: {
              streamed_data: data,
            },
            error: null,
          };
        }
      }
    } catch (e) {
      console.log("Error parsing response", e);
      return {
        data: null,
        error: "error parsing response, " + e + ", " + result,
      };
    }
  }

  tryJsonParse(text: string): any {
    try {
      return JSON.parse(text);
    } catch (e) {
      return {
        error: "error parsing response, " + e + ", " + text,
      };
    }
  }

  async readAndLogResponse(
    queue: InsertQueue
  ): Promise<
    Result<Database["public"]["Tables"]["response"]["Insert"], string>
  > {
    const responseBody = await this.response.getResponseBody();

    const endTime = this.timing.endTime ?? new Date();
    const delay_ms = endTime.getTime() - this.timing.startTime.getTime();

    const parsedResponse = await this.parseResponse(responseBody);

    const response =
      parsedResponse.error === null
        ? {
            id: this.response.responseId,
            created_at: endTime.toISOString(),
            request: this.request.requestId,
            body: this.response.omitLog
              ? {
                  usage: parsedResponse.data?.usage,
                }
              : parsedResponse.data,
            status: this.response.status,
            completion_tokens: parsedResponse.data.usage?.completion_tokens,
            prompt_tokens: parsedResponse.data.usage?.prompt_tokens,
            delay_ms,
          }
        : {
            id: this.response.responseId,
            request: this.request.requestId,
            created_at: endTime.toISOString(),
            body: {
              helicone_error: "error parsing response",
              parse_response_error: parsedResponse.error,
              body: this.tryJsonParse(responseBody),
            },
            status: this.response.status,
          };

    const { error } = await queue.updateResponse(
      this.response.responseId,
      this.request.requestId,
      response
    );
    if (error !== null) {
      return {
        data: null,
        error: error,
      };
    }
    return {
      data: response,
      error: null,
    };
  }

  async sendToWebhook(
    dbClient: SupabaseClient<Database>,
    payload: {
      request: UnPromise<ReturnType<typeof logRequest>>["data"];
      response: Database["public"]["Tables"]["response"]["Insert"];
    },
    webhook: Database["public"]["Tables"]["webhooks"]["Row"]
  ): Promise<Result<undefined, string>> {
    // Check FF
    const checkWebhookFF = await dbClient
      .from("feature_flags")
      .select("*")
      .eq("feature", "webhook_beta")
      .eq("org_id", payload.request?.request.helicone_org_id ?? "");
    if (checkWebhookFF.error !== null || checkWebhookFF.data.length === 0) {
      console.error(
        "Error checking webhook ff or webhooks not enabled for user trying to use them",
        checkWebhookFF.error
      );
      return {
        data: undefined,
        error: null,
      };
    }

    const subscriptions =
      (
        await dbClient
          .from("webhook_subscriptions")
          .select("*")
          .eq("webhook_id", webhook.id)
      ).data ?? [];

    const shouldSend =
      subscriptions
        .map((subscription) => {
          return subscription.event === "beta";
        })
        .filter((x) => x).length > 0;

    if (shouldSend) {
      console.log("SENDING", webhook.destination, payload.request?.request.id);
      await fetch(webhook.destination, {
        method: "POST",
        body: JSON.stringify({
          request_id: payload.request?.request.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    return {
      data: undefined,
      error: null,
    };
  }

  async sendToWebhooks(
    dbClient: SupabaseClient<Database>,
    payload: {
      request: UnPromise<ReturnType<typeof logRequest>>["data"];
      response: Database["public"]["Tables"]["response"]["Insert"];
    }
  ): Promise<Result<undefined, string>> {
    if (!payload.request?.request.helicone_org_id) {
      return {
        data: null,
        error: "Org id undefined",
      };
    }

    const webhooks = await dbClient
      .from("webhooks")
      .select("*")
      .eq("org_id", payload.request?.request.helicone_org_id ?? "")
      .eq("is_verified", true);
    if (webhooks.error !== null) {
      return {
        data: null,
        error: webhooks.error.message,
      };
    }
    for (const webhook of webhooks.data ?? []) {
      const res = await this.sendToWebhook(dbClient, payload, webhook);
      if (res.error !== null) {
        return res;
      }
    }

    return {
      data: undefined,
      error: null,
    };
  }

  async _log(
    db: {
      supabase: SupabaseClient<Database>;
      clickhouse: ClickhouseClientWrapper;
      queue: InsertQueue;
    },
    rateLimitKV: KVNamespace
  ): Promise<Result<null, string>> {
    const { data: authParams, error } = this.request.heliconeProxyKeyId
      ? await getHeliconeProxyKeyRow(
          db.supabase,
          this.request.heliconeProxyKeyId
        )
      : await getHeliconeApiKeyRow(
          db.supabase,
          this.request.heliconeApiKeyAuthHash
        );

    if (error || !authParams?.organizationId) {
      return { data: null, error: error ?? "Helicone organization not found" };
    }

    const requestResult = await logRequest(
      this.request,
      this.response.responseId,
      db.supabase,
      db.queue,
      authParams
    );

    // If no data or error, return
    if (!requestResult.data || requestResult.error) {
      return requestResult;
    }

    const responseResult = await this.readAndLogResponse(db.queue);

    // If no data or error, return
    if (!responseResult.data || responseResult.error) {
      return responseResult;
    }

    await logInClickhouse(
      requestResult.data.request,
      responseResult.data,
      requestResult.data.properties,
      db.clickhouse
    );

    // TODO We should probably move the webhook stuff out of dbLogger
    const { error: webhookError } = await this.sendToWebhooks(db.supabase, {
      request: requestResult.data,
      response: responseResult.data,
    });

    if (webhookError !== null) {
      console.error("Error sending to webhooks", webhookError);
      return {
        data: null,
        error: webhookError,
      };
    }

    return {
      data: null,
      error: null,
    };
  }

  async log(
    db: {
      supabase: SupabaseClient<Database>;
      clickhouse: ClickhouseClientWrapper;
      queue: InsertQueue;
    },
    rateLimitKV: KVNamespace
  ): Promise<Result<null, string>> {
    const res = await this._log(db, rateLimitKV);
    if (res.error !== null) {
      console.error("Error logging", res.error);
      const uuid = crypto.randomUUID();
      db.queue.responseAndResponseQueueKV.put(
        uuid,
        JSON.stringify({
          _type: "dbLoggable",
          payload: JSON.stringify(this),
        })
      );

      db.queue.fallBackQueue.send(uuid);
    }
    return res;
  }
}
