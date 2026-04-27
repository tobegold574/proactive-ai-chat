import { Sparkles, Brain, Shield, Zap } from "lucide-react"

export type FeatureItem = {
  icon: typeof Sparkles
  title: string
  description: string
  gradient: string
}

export const featuresByLocale: Record<"zh" | "en", FeatureItem[]> = {
  zh: [
    {
      icon: Sparkles,
      title: "主动对话",
      description:
        "AI不再只是被动响应。它会主动关心你，在合适的时机发起对话，像真实的朋友一样。",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "智能记忆",
      description:
        "强大的记忆系统记住你的偏好、习惯和重要事项。信息自动压缩，高效且不丢失关键。",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "本地运行",
      description: "所有数据本地处理，隐私优先。无需服务器，API Key 永不离开你的设备。",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      icon: Zap,
      title: "双层触发",
      description: "基于时间戳和重要信息双层触发机制，精准把握对话时机。",
      gradient: "from-cyan-500 to-sky-500",
    },
  ],
  en: [
    {
      icon: Sparkles,
      title: "Proactive chat",
      description:
        "Not just reactive Q&A. The AI checks in proactively and starts conversations at the right time—like a real friend.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "Smart memory",
      description:
        "A strong memory system that learns your preferences, habits, and key facts. It compresses information automatically without losing what matters.",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "Local-first",
      description:
        "All data is processed locally with privacy first. No server required, and your API key never leaves your device.",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      icon: Zap,
      title: "Dual triggers",
      description:
        "Triggering based on both time and important signals—so the AI reaches out precisely when it should.",
      gradient: "from-cyan-500 to-sky-500",
    },
  ],
}

export function getFeatures(locale: string): FeatureItem[] {
  return (locale === "zh" ? featuresByLocale.zh : featuresByLocale.en).slice()
}