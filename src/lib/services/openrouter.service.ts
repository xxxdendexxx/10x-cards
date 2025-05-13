import { z } from "zod";

// Types and interfaces
interface OpenRouterConfig {
  apiKey: string;
  endpoint: string;
  systemMessage?: string;
  modelName?: string;
  modelParams?: ModelParameters;
  maxRetries?: number;
  initialRetryDelay?: number;
}

interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

// Response schema validation
const OpenRouterChoiceSchema = z.object({
  message: z.object({
    content: z.string(),
    role: z.string(),
  }),
  finish_reason: z.string(),
  index: z.number(),
});

const OpenRouterResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  choices: z.array(OpenRouterChoiceSchema),
  created: z.number(),
});

const ChatResponseSchema = z.object({
  answer: z.string(),
  metadata: z.record(z.unknown()),
});

type ChatResponse = z.infer<typeof ChatResponseSchema>;
//type OpenRouterResponse = z.infer<typeof OpenRouterResponseSchema>;

const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Retry on network errors and 5xx server errors
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return true;
    }
    if (error.message.includes("status: 5")) {
      return true;
    }
  }
  return false;
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export class OpenRouterService {
  private readonly _apiKey: string;
  private readonly _endpoint: string;
  private _defaultSystemMessage: string;
  private _modelName: string;
  private _modelParams: ModelParameters;
  private _lastResponse: ChatResponse | null;
  private readonly _maxRetries: number;
  private readonly _initialRetryDelay: number;

  constructor(config: OpenRouterConfig) {
    this._apiKey = config.apiKey;
    this._endpoint = config.endpoint;
    this._defaultSystemMessage = config.systemMessage || "You are a helpful assistant.";
    //this._modelName = config.modelName || "openai/gpt-4o-mini";
    this._modelName = "openai/gpt-4o-mini";
    this._modelParams = config.modelParams || {
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    };
    this._lastResponse = null;
    this._maxRetries = config.maxRetries || 3;
    this._initialRetryDelay = config.initialRetryDelay || 1000;
  }

  public async sendMessage(userMessage: string, additionalContext?: Record<string, unknown>): Promise<ChatResponse> {
    let lastError: unknown;
    let retryCount = 0;

    while (retryCount <= this._maxRetries) {
      try {
        const payload = this._buildPayload(userMessage, additionalContext);
        console.log("OpenRouter Request Payload:", JSON.stringify(payload, null, 2));

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._apiKey}`,
          //"HTTP-Referer": "https://github.com/pmwaba/10x-cards", // Wymagane przez OpenRouter
          //"X-Title": "10x-cards", // Wymagane przez OpenRouter
        };

        console.log("OpenRouter Request Headers:", JSON.stringify(headers, null, 2));

        const response = await fetch(this._endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Clone the response to be able to read it twice
        const responseClone = response.clone();
        const rawBody = await responseClone.text();
        console.log("OpenRouter Raw Response:", rawBody);

        const data = await response.json();
        console.log("OpenRouter Parsed Response:", data);
        console.log("OpenRouter message:", data.choices[0].message);

        const validatedResponse = this._validateResponse(data);
        this._lastResponse = validatedResponse;
        return validatedResponse;
      } catch (error) {
        lastError = error;

        if (isRetryableError(error) && retryCount < this._maxRetries) {
          const delayMs = this._initialRetryDelay * Math.pow(2, retryCount);
          console.warn(`Attempt ${retryCount + 1} failed, retrying in ${delayMs}ms...`);
          await delay(delayMs);
          retryCount++;
          continue;
        }

        return this._handleError(error);
      }
    }

    return this._handleError(lastError);
  }

  public configure(options: Partial<OpenRouterConfig>): void {
    if (options.systemMessage) {
      this._defaultSystemMessage = options.systemMessage;
    }
    if (options.modelName) {
      this._modelName = options.modelName;
    }
    if (options.modelParams) {
      this._modelParams = {
        ...this._modelParams,
        ...options.modelParams,
      };
    }
  }

  public getLastResponse(): ChatResponse | null {
    return this._lastResponse;
  }

  private _buildPayload(userMessage: string, additionalContext?: Record<string, unknown>): object {
    return {
      messages: [
        { role: "system", content: this._defaultSystemMessage },
        { role: "user", content: userMessage },
      ],
      //model: this._modelName,
      model: "openai/gpt-4o-mini",
      ...this._modelParams,
      response_format: {
        type: "json_schema",

        json_schema: {
          name: "flashcards",
          strict: true,
          schema: {
            type: "object",
            properties: {
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" },
                    source: { type: "string", enum: ["ai-full"] },
                  },
                  required: ["front", "back", "source"],
                  additionalProperties: false,
                },
              },
            },
            required: ["flashcards"],
            additionalProperties: false,
          },
        },
      },
      ...additionalContext,
    };
  }

  private _validateResponse(response: unknown): ChatResponse {
    const parsedResponse = OpenRouterResponseSchema.parse(response);

    // Extract the content from the first choice's message
    const content = parsedResponse.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content found in OpenRouter response");
    }

    // Create the ChatResponse format
    const chatResponse: ChatResponse = {
      answer: content,
      metadata: {
        id: parsedResponse.id,
        model: parsedResponse.model,
        created: parsedResponse.created,
      },
    };

    return ChatResponseSchema.parse(chatResponse);
  }

  private async _handleError(error: unknown): Promise<never> {
    // Log error details (implement proper logging later)
    console.error("OpenRouter API Error:", error);

    if (error instanceof z.ZodError) {
      throw new Error("Nieprawidłowy format odpowiedzi z API OpenRouter");
    }

    if (error instanceof Error) {
      throw new Error(`Błąd API OpenRouter: ${error.message}`);
    }

    throw new Error("Wystąpił nieznany błąd podczas wywoływania API OpenRouter");
  }
}
