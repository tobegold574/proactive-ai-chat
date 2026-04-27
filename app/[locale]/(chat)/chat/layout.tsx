import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat | Proactive AI",
  description: "Chat with proactive AI",
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children
}

