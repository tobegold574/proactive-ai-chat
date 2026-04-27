"use client"

import { useEffect, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseBrowser } from "@/lib/supabase/client"

/**
 * Browser Supabase client (cookie session via @supabase/ssr).
 * Returns null until mounted — only use after client is non-null.
 */
export function useSupabaseBrowser(): SupabaseClient | null {
  const [client, setClient] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    // Must be created after mount (no `window` / cookies on the server pass).
    queueMicrotask(() => setClient(createSupabaseBrowser()))
  }, [])

  return client
}

