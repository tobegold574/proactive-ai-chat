export type Profile = {
  id: string
  username: string
  username_norm: string
  created_at: string
  updated_at: string
}

export type Post = {
  id: number
  author_id: string
  title: string
  content_md: string
  created_at: string
  updated_at: string
}

export type Comment = {
  id: number
  post_id: number
  author_id: string
  parent_id: number | null
  content_md: string
  created_at: string
}

export type Notification = {
  id: number
  user_id: string
  type: "comment_on_post" | "reply_to_comment"
  title: string
  body: string | null
  link_post_id: number
  read_at: string | null
  actor_id: string | null
  created_at: string
}

export type PluginListing = {
  id: number
  slug: string
  author_id: string
  name: string
  summary: string
  description_md: string
  repo_url: string | null
  homepage_url: string | null
  contact_md: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export type PluginReview = {
  id: number
  plugin_id: number
  author_id: string
  rating: number
  body_md: string
  created_at: string
  updated_at: string
}

export type PluginDiscussion = {
  id: number
  plugin_id: number
  author_id: string
  parent_id: number | null
  content_md: string
  created_at: string
}

