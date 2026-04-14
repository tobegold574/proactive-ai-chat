export const DEFAULT_API_KEY = process.env.DEFAULT_API_KEY || ""

export const FREE_CONVERSATIONS = 10

export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "deepseek-ai/DeepSeek-V3.1"

export const DEFAULT_BASE_URL = process.env.DEFAULT_BASE_URL || "https://api-inference.modelscope.cn/v1"

export const DEFAULT_SETTINGS = {
  importantInfoThreshold: 20,
  proactiveInterval: 60,
  recentMessagesCount: 3,
  proactiveEnabled: true,
}

export const IMPORTANT_INFO_THRESHOLD = DEFAULT_SETTINGS.importantInfoThreshold
