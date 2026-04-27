export type StepItem = {
  number: string
  title: string
  description: string
}

export const stepsByLocale: Record<"zh" | "en", StepItem[]> = {
  zh: [
    {
      number: "01",
      title: "开始对话",
      description: "点击立即体验进入聊天，AI 会主动与你交流",
    },
    {
      number: "02",
      title: "自定义配置",
      description: "在设置中配置你自己的 API Key 或调整参数",
    },
  ],
  en: [
    {
      number: "01",
      title: "Start chatting",
      description: "Click Try now to open chat. The AI will proactively engage with you.",
    },
    {
      number: "02",
      title: "Customize settings",
      description: "Configure your API key and tune parameters in Settings.",
    },
  ],
}

export function getSteps(locale: string): StepItem[] {
  return (locale === "zh" ? stepsByLocale.zh : stepsByLocale.en).slice()
}