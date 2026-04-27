"use client"

import { createBrowserClient } from "@supabase/ssr"

/**
 * Create a browser Supabase client (PKCE + cookie storage).
 * Prefer `useSupabaseBrowser()` in components so SSR/hydration stays safe.
 */
export function createSupabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
