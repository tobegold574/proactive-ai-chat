import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "聊天 | Proactive AI",
  description: "与主动 AI 对话",
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
