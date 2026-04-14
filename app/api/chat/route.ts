import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { DEFAULT_API_KEY, FREE_CONVERSATIONS, DEFAULT_MODEL, IMPORTANT_INFO_THRESHOLD, DEFAULT_BASE_URL } from "@/lib/config"
import {
  normalizePromptLocale,
  getPromptTemplates,
  getCompressImportantSystemMessage,
  buildCompressImportantUserContent,
  type PromptLocale,
} from "@/lib/prompts"
import { callAI } from "@/lib/openai"
import type { ChatRequest, ChatResponse } from "@/lib/types"

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

const conversationUsage = {
  used: 0,
  records: [] as Array<{ conversationId: string; usedAt: number }>,
}

async function compressImportantInfo(
  infos: string[],
  apiKey: string,
  model: string,
  baseURL: string,
  locale: PromptLocale
): Promise<string> {
  if (infos.length < IMPORTANT_INFO_THRESHOLD) {
    return infos.join("; ")
  }

  const compressPrompt = buildCompressImportantUserContent(locale, infos)

  const openai = new OpenAI({ apiKey, baseURL })

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: getCompressImportantSystemMessage(locale) },
      { role: "user", content: compressPrompt },
    ],
    response_format: { type: "json_object" },
  })

  const raw = response.choices[0]?.message?.content || "{}"
  let summary: string | undefined
  try {
    const parsed = JSON.parse(raw) as { compressed_summary?: unknown }
    summary =
      typeof parsed.compressed_summary === "string"
        ? parsed.compressed_summary
        : undefined
  } catch {
    summary = undefined
  }
  return summary || infos.join("; ")
}

function deduplicateImportantInfo(
  existingInfo: string[],
  newInfo: string[]
): string[] {
  const combined = [...existingInfo, ...newInfo]
  const seen = new Set<string>()
  return combined.filter((info) => {
    const normalized = info.trim().toLowerCase()
    if (seen.has(normalized)) {
      return false
    }
    seen.add(normalized)
    return true
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history, importantInfo, config } = body
    const locale = normalizePromptLocale(body.locale)
    const promptTemplates = getPromptTemplates(locale)

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "消息不能为空" },
        { status: 400 }
      )
    }

    const userApiKey = config?.apiKey
    const userModel = config?.model || DEFAULT_MODEL
    const userBaseURL = config?.baseURL || DEFAULT_BASE_URL
    const userSettings = config?.settings
    const templateName = userSettings?.templateName

    const isUsingDefault = !userApiKey || userApiKey === ""

    if (isUsingDefault) {
      const totalUsed = conversationUsage.used

      if (totalUsed >= FREE_CONVERSATIONS) {
        return NextResponse.json(
          {
            error: "FREE_TOKENS_EXHAUSTED",
            message: "免费额度已用完",
            usedConversations: totalUsed,
            limit: FREE_CONVERSATIONS,
          },
          { status: 403 }
        )
      }
    }

    const apiKey = userApiKey || DEFAULT_API_KEY
    const baseURL = userBaseURL
    const threshold = userSettings?.importantInfoThreshold || IMPORTANT_INFO_THRESHOLD

    let currentImportantInfo = importantInfo || []

    if (currentImportantInfo.length >= threshold) {
      const compressed = await compressImportantInfo(
        currentImportantInfo,
        apiKey,
        userModel,
        baseURL,
        locale
      )
      currentImportantInfo = [compressed]
    }

    let finalSettings = userSettings
    if (templateName && promptTemplates[templateName as keyof typeof promptTemplates]) {
      const template = promptTemplates[templateName as keyof typeof promptTemplates]
      finalSettings = {
        ...userSettings,
        systemPrompt: template.systemPrompt,
      }
    }

    const result: ChatResponse = await callAI(
      message,
      history,
      currentImportantInfo,
      apiKey,
      userModel,
      baseURL,
      finalSettings,
      locale
    )

    if (isUsingDefault) {
      conversationUsage.used += 1
      conversationUsage.records.push({
        conversationId: generateId(),
        usedAt: Date.now(),
      })
    }

    const newImportantInfo = deduplicateImportantInfo(
      currentImportantInfo,
      result.important_info
    )

    return NextResponse.json({
      ...result,
      importantInfo: newImportantInfo,
      usedConversations: conversationUsage.used,
      limit: FREE_CONVERSATIONS,
    })
  } catch (error) {
    console.error("Chat API Error:", error)

    const errorMessage = error instanceof Error ? error.message : "未知错误"

    if (errorMessage.includes("API key")) {
      return NextResponse.json(
        { error: "API_KEY_INVALID", message: "API Key 无效" },
        { status: 401 }
      )
    }

    if (errorMessage.includes("insufficient_quota")) {
      return NextResponse.json(
        {
          error: "QUOTA_EXHAUSTED",
          message: "API 额度已用完，请输入自己的 API Key",
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "API_ERROR", message: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    usedConversations: conversationUsage.used,
    limit: FREE_CONVERSATIONS,
    remaining: Math.max(0, FREE_CONVERSATIONS - conversationUsage.used),
  })
}
