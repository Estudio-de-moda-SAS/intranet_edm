/**
 * @module ChatBotRoute
 * Ruta API para orquestar conversaciones con el asistente corporativo.
 *
 * @remarks
 * Este archivo implementa un endpoint `POST` que recibe mensajes de chat
 * y los enruta hacia uno de los proveedores configurados:
 *
 * - Azure OpenAI
 * - GitHub Copilot Studio (Direct Line)
 *
 * La selección del proveedor se controla mediante la variable de entorno:
 *
 * - `AI_PROVIDER=azure`
 * - `AI_PROVIDER=copilot`
 *
 * El endpoint devuelve una respuesta en streaming para permitir
 * una experiencia de chat progresiva en el cliente.
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Provider ─────────────────────────────────────────────────────────────────
// Set AI_PROVIDER in your .env.local:
//   AI_PROVIDER=azure    → Azure OpenAI
//   AI_PROVIDER=copilot  → GitHub Copilot Studio (Direct Line)

/**
 * Proveedor de IA activo para la ruta.
 *
 * @remarks
 * Si no se define `AI_PROVIDER`, se utiliza `azure` por defecto.
 */
const PROVIDER = process.env.AI_PROVIDER ?? "azure";

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Representa un mensaje dentro del historial de conversación.
 *
 * @property role Rol del mensaje dentro del chat.
 * @property content Contenido textual del mensaje.
 */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Azure OpenAI ─────────────────────────────────────────────────────────────

/**
 * Envía mensajes al proveedor Azure OpenAI y devuelve una respuesta en streaming.
 *
 * @param messages Historial de mensajes de la conversación.
 * @returns Stream de texto con la respuesta generada por el modelo.
 *
 * @remarks
 * Esta función:
 *
 * - construye la solicitud al deployment configurado en Azure OpenAI
 * - inyecta un mensaje `system` inicial
 * - consume la respuesta SSE (`stream: true`)
 * - extrae los `delta.content` emitidos por el modelo
 * - transforma el flujo en un `ReadableStream` plano de texto
 *
 * Variables requeridas:
 *
 * - `AZURE_OPENAI_ENDPOINT`
 * - `AZURE_OPENAI_API_KEY`
 * - `AZURE_OPENAI_DEPLOYMENT`
 * - `AZURE_OPENAI_API_VERSION` (opcional)
 * - `BOT_SYSTEM_PROMPT` (opcional)
 *
 * @throws Error si la respuesta HTTP del proveedor no es exitosa.
 */
async function callAzureOpenAI(messages: ChatMessage[]): Promise<ReadableStream> {
  const endpoint   = process.env.AZURE_OPENAI_ENDPOINT!;
  const apiKey     = process.env.AZURE_OPENAI_API_KEY!;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-02-01";

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            process.env.BOT_SYSTEM_PROMPT ??
            "Eres el asistente corporativo interno. Responde siempre en español de forma concisa y profesional.",
        },
        ...messages,
      ],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Azure OpenAI error ${response.status}: ${error}`);
  }

  const reader  = response.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data:"));

        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") { controller.close(); return; }
          try {
            const json  = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(new TextEncoder().encode(delta));
          } catch {
            // skip malformed chunks
          }
        }
      }
      controller.close();
    },
  });
}

// ─── Copilot Studio (Direct Line) ─────────────────────────────────────────────

/**
 * Envía mensajes a GitHub Copilot Studio mediante Direct Line
 * y devuelve la respuesta del bot como stream.
 *
 * @param messages Historial de mensajes de la conversación.
 * @returns Stream de texto con la respuesta del bot.
 *
 * @remarks
 * Flujo general:
 *
 * 1. Crea una conversación nueva en Direct Line
 * 2. Extrae el último mensaje del usuario
 * 3. Envía dicho mensaje como actividad
 * 4. Consulta periódicamente las actividades del bot
 * 5. Cuando encuentra una respuesta, la emite en el stream
 *
 * Variables requeridas:
 *
 * - `COPILOT_DIRECT_LINE_SECRET`
 * - `COPILOT_BOT_ENDPOINT`
 *
 * Esta implementación usa polling simple con un máximo de 15 intentos.
 */
async function callCopilotStudio(messages: ChatMessage[]): Promise<ReadableStream> {
  const secret      = process.env.COPILOT_DIRECT_LINE_SECRET!;
  const botEndpoint = process.env.COPILOT_BOT_ENDPOINT!;

  const convRes = await fetch(`${botEndpoint}/conversations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  const { conversationId, token } = await convRes.json();

  /**
   * Último mensaje emitido por el usuario dentro del historial recibido.
   */
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  await fetch(`${botEndpoint}/conversations/${conversationId}/activities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: "message",
      from: { id: "user" },
      text: lastUserMessage?.content ?? "",
    }),
  });

  return new ReadableStream({
    async start(controller) {
      let watermark: string | null = null;

      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 1000));

        const url: string = watermark
          ? `${botEndpoint}/conversations/${conversationId}/activities?watermark=${watermark}`
          : `${botEndpoint}/conversations/${conversationId}/activities`;

        const actRes = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await actRes.json();
        watermark  = data.watermark;

        const botActivities = data.activities?.filter(
          (a: { type: string; from: { role?: string; id?: string }; text?: string }) =>
            a.type === "message" &&
            (a.from?.role === "bot" || a.from?.id === "bot")
        );

        if (botActivities?.length > 0) {
          const text = botActivities[botActivities.length - 1].text ?? "";
          controller.enqueue(new TextEncoder().encode(text));
          break;
        }
      }
      controller.close();
    },
  });
}

// ─── Route handler ────────────────────────────────────────────────────────────

/**
 * Handler `POST` del endpoint de chat.
 *
 * @param req Request HTTP entrante con el historial de mensajes.
 * @returns Respuesta HTTP en streaming con la salida del proveedor seleccionado.
 *
 * @remarks
 * Este endpoint:
 *
 * - valida que existan mensajes
 * - selecciona el proveedor según `PROVIDER`
 * - delega la ejecución al adaptador correspondiente
 * - devuelve la respuesta como `text/plain` en streaming
 *
 * Encabezados de respuesta:
 *
 * - `Content-Type: text/plain; charset=utf-8`
 * - `X-Provider: <provider>`
 *
 * Errores:
 *
 * - `400` si no se reciben mensajes
 * - `500` si ocurre un error interno o del proveedor
 */
export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const stream = PROVIDER === "copilot"
      ? await callCopilotStudio(messages)
      : await callAzureOpenAI(messages);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Provider": PROVIDER,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ChatBot API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}