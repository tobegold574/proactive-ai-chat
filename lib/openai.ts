import OpenAI from "openai"
import { DEFAULT_BASE_URL } from "./config"
import { getSystemPrompt, type PromptLocale } from "./prompts"
import type { ChatMessage, ChatResponse, UserSettings } from "./types"

const DEFAULT_INTERVAL = 60

function parseModelContentToChatResponse(
  resultText: string,
  fallbackInterval: number
): ChatResponse {
  const fallback = (): ChatResponse => ({
    reply: resultText,
    triggers: [],
    next_api_call_seconds: fallbackInterval,
    important_info: [],
  })

  const tryParseJson = (text: string): unknown => {
    try {
      return JSON.parse(text)
    } catch {
      /* ignore */
    }
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1 || end <= start) return null
    try {
      return JSON.parse(text.slice(start, end + 1))
    } catch {
      return null
    }
  }

  const raw = tryParseJson(resultText)
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return fallback()
  }

  const o = raw as Record<string, unknown>

  let reply = ""
  if (typeof o.reply === "string") {
    reply = o.reply
  } else if (o.reply != null) {
    reply = String(o.reply)
  }

  const triggers: ChatResponse["triggers"] = []
  if (Array.isArray(o.triggers)) {
    for (const t of o.triggers) {
      if (
        t !== null &&
        typeof t === "object" &&
        !Array.isArray(t) &&
        typeof (t as { seconds?: unknown }).seconds === "number" &&
        typeof (t as { message?: unknown }).message === "string"
      ) {
        triggers.push({
          seconds: (t as { seconds: number }).seconds,
          message: (t as { message: string }).message,
        })
      }
    }
  }

  const important_info = Array.isArray(o.important_info)
    ? o.important_info.filter((x): x is string => typeof x === "string")
    : []

  const nextRaw = o.next_api_call_seconds
  const next_api_call_seconds =
    typeof nextRaw === "number" &&
    Number.isFinite(nextRaw) &&
    nextRaw > 0
      ? Math.floor(nextRaw)
      : fallbackInterval

  return {
    reply,
    triggers,
    next_api_call_seconds,
    important_info,
  }
}

function buildMessages(
  systemPrompt: string,
  history: ChatMessage[],
  importantInfo: string[],
  recentMessagesCount: number = 3,
  locale: PromptLocale = "zh"
) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  messages.push({ role: "system", content: systemPrompt })

  if (importantInfo.length > 0) {
    const tag = locale === "en" ? "[User important notes]" : "[用户重要信息]"
    messages.push({
      role: "system",
      content: `${tag} ${importantInfo.join("; ")}`,
    })
  }

  const recentCount = recentMessagesCount || 3
  for (const msg of history.slice(-recentCount)) {
    messages.push({
      role: msg.role,
      content: msg.content,
    })
  }

  return messages
}

export async function callAI(
  userMessage: string,
  history: ChatMessage[],
  importantInfo: string[],
  apiKey: string,
  modelId: string,
  baseURL: string = DEFAULT_BASE_URL,
  settings?: UserSettings,
  locale: PromptLocale = "zh"
): Promise<ChatResponse> {
  const client = new OpenAI({
    apiKey,
    baseURL,
  })

  const systemPrompt = (settings?.systemPrompt && settings.systemPrompt.trim()) 
    ? settings.systemPrompt 
    : getSystemPrompt(locale)
  const recentMessagesCount = settings?.recentMessagesCount || 3

  const messages = buildMessages(
    systemPrompt, 
    history, 
    importantInfo,
    recentMessagesCount,
    locale
  )
  messages.push({ role: "user", content: userMessage })

  const response = await client.chat.completions.create({
    model: modelId,
    messages,
  })

  let resultText = response.choices[0]?.message?.content || "{}"
  
  resultText = resultText.trim()
  if (resultText.startsWith("```")) {
    const firstLineEnd = resultText.indexOf("\n")
    if (firstLineEnd !== -1) {
      resultText = resultText.substring(firstLineEnd + 1)
    }
  }
  if (resultText.endsWith("```")) {
    resultText = resultText.substring(0, resultText.length - 3)
  }
  resultText = resultText.trim()

  const interval = settings?.proactiveInterval ?? DEFAULT_INTERVAL
  return parseModelContentToChatResponse(resultText, interval)
}
