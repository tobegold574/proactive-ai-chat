import type { ReactNode } from "react"
import { CommunityLayoutShell } from "@/components/community/community-layout-shell"

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return <CommunityLayoutShell>{children}</CommunityLayoutShell>
}
