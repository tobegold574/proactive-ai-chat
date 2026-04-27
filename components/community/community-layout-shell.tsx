"use client"

import type { ReactNode } from "react"
import { CommunitySidebar } from "@/components/community/community-sidebar"

export function CommunityLayoutShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-20 pt-28 [background-image:radial-gradient(ellipse_85%_55%_at_50%_-18%,rgb(45_212_191/0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_0%,rgb(6_182_212/0.06),transparent)]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_308px] lg:items-start lg:gap-12">
          <div className="min-w-0">{children}</div>
          <aside className="min-w-0 lg:sticky lg:top-28">
            <CommunitySidebar />
          </aside>
        </div>
      </div>
    </>
  )
}
