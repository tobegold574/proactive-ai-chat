import * as zh from "./zh"
import * as en from "./en"

export type PromptLocale = "zh" | "en"

export function normalizePromptLocale(v: string | undefined): PromptLocale {
  return v === "en" ? "en" : "zh"
}

export function getSystemPrompt(locale: PromptLocale): string {
  return locale === "en" ? en.SYSTEM_PROMPT : zh.SYSTEM_PROMPT
}

export function getPromptTemplates(locale: PromptLocale) {
  return locale === "en" ? en.PROMPT_TEMPLATES : zh.PROMPT_TEMPLATES
}

export function getProactivePrompt(locale: PromptLocale): string {
  return locale === "en" ? en.PROACTIVE_PROMPT : zh.PROACTIVE_PROMPT
}

export type PromptTemplateId = keyof typeof zh.PROMPT_TEMPLATES

export function getCompressImportantSystemMessage(locale: PromptLocale): string {
  return locale === "en"
    ? "You compress user notes into a brief summary."
    : "你是一个信息压缩助手。"
}

export function buildCompressImportantUserContent(
  locale: PromptLocale,
  infos: string[]
): string {
  const list = infos.map((info, i) => `${i + 1}. ${info}`).join("\n")
  if (locale === "en") {
    return `Compress the following important user notes into a concise summary (at most 5 bullet points):

${list}

Return JSON:
{"compressed_summary": "Summary under ~100 words"}`
  }
  return `请把以下用户的重要信息压缩成简洁的摘要（不超过5条）：

${list}

返回JSON格式：
{"compressed_summary": "压缩后的摘要（不超过100字）"}`
}
