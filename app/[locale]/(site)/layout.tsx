import { CommunitySessionSync } from "@/components/community/community-session-sync"
import { TopDock } from "@/components/top-dock"
import { SiteFooter } from "@/components/site-footer"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommunitySessionSync />
      <TopDock />
      {children}
      <SiteFooter />
    </>
  )
}

