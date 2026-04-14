import OpenAI from "openai"
import { DEFAULT_BASE_URL } from "./config"
import { getSystemPrompt, type PromptLocale } from "./prompts"
import type { ChatMessage, ChatResponse, UserSettings } from "./types"

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
  
  const result = JSON.parse(resultText)

  return {
    reply: result.reply || "",
    triggers: result.triggers || [],
    next_api_call_seconds: result.next_api_call_seconds || settings?.proactiveInterval || 60,
    important_info: result.important_info || [],
  }
}
