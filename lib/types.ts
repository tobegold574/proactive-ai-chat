export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: number
  extra?: {
    is_proactive?: boolean
    isTrigger?: boolean
    triggers?: Array<{ seconds: number; message: string }>
    next_api_call_seconds?: number
  }
}

export interface ImportantInfo {
  id: string
  content: string
  createdAt: number
}

export interface UserSettings {
  importantInfoThreshold?: number
  systemPrompt?: string
  proactiveInterval?: number
  recentMessagesCount?: number
  proactiveEnabled?: boolean
  templateName?: string
}

export interface UserConfig {
  apiKey: string
  model: string
  baseURL?: string
  settings?: UserSettings
}

export interface ChatRequest {
  message: string
  history: ChatMessage[]
  importantInfo: string[]
  /** UI language: selects built-in system prompts (zh | en) */
  locale?: string
  config?: {
    model?: string
    apiKey?: string
    baseURL?: string
    settings?: UserSettings
    templateName?: string
  }
}

export interface ChatResponse {
  reply: string
  triggers: Array<{ seconds: number; message: string }>
  next_api_call_seconds: number
  important_info: string[]
}
