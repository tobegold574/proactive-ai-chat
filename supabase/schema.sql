-- Supabase Community schema (posts + nested comments + username profiles)

-- 1) Profiles: only `username` (unique, 3-20 chars), allowing Chinese and most characters.
--    We store a normalized value for uniqueness to avoid look-alike duplicates.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  username_norm text not null unique,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Normalize username (NFKC + trim + lower). Postgres doesn't have full NFKC builtin,
-- but we can approximate with trim + lower and rely on app-side normalization too.
create or replace function public.normalize_username(u text)
returns text
language sql
immutable
as $$
  select lower(trim(u));
$$;

-- Enforce username length constraints (3..20) and forbid obvious path-breaking characters.
create or replace function public.validate_username(u text)
returns boolean
language plpgsql
immutable
as $$
begin
  if u is null then return false; end if;
  if char_length(u) < 3 or char_length(u) > 20 then return false; end if;
  if position('/' in u) > 0 then return false; end if;
  if position('\\' in u) > 0 then return false; end if;
  if position('?' in u) > 0 then return false; end if;
  if position('#' in u) > 0 then return false; end if;
  if u ~ '[\r\n\t]' then return false; end if;
  return true;
end;
$$;

alter table public.profiles
  drop constraint if exists profiles_username_valid;
alter table public.profiles
  add constraint profiles_username_valid check (public.validate_username(username));

-- 2) Posts
create table if not exists public.posts (
  id bigserial primary key,
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  content_md text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);

-- 3) Comments (nested)
create table if not exists public.comments (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  parent_id bigint null references public.comments(id) on delete cascade,
  content_md text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_created_at_idx on public.comments (post_id, created_at asc);
create index if not exists comments_parent_id_created_at_idx on public.comments (parent_id, created_at asc);

-- 4) Auto-create profile on signup (username must be set later by user).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, username_norm)
  values (new.id, 'user_' || substring(new.id::text from 1 for 8), public.normalize_username('user_' || substring(new.id::text from 1 for 8)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 5) RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- profiles: public read, self update
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles
for select using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

-- posts: public read, auth write, self edit/delete
drop policy if exists "posts_read_all" on public.posts;
create policy "posts_read_all" on public.posts
for select using (true);

drop policy if exists "posts_insert_auth" on public.posts;
create policy "posts_insert_auth" on public.posts
for insert with check (auth.uid() = author_id);

drop policy if exists "posts_update_self" on public.posts;
create policy "posts_update_self" on public.posts
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "posts_delete_self" on public.posts;
create policy "posts_delete_self" on public.posts
for delete using (auth.uid() = author_id);

-- comments: public read, auth write, self edit/delete
drop policy if exists "comments_read_all" on public.comments;
create policy "comments_read_all" on public.comments
for select using (true);

drop policy if exists "comments_insert_auth" on public.comments;
create policy "comments_insert_auth" on public.comments
for insert with check (auth.uid() = author_id);

drop policy if exists "comments_update_self" on public.comments;
create policy "comments_update_self" on public.comments
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "comments_delete_self" on public.comments;
create policy "comments_delete_self" on public.comments
for delete using (auth.uid() = author_id);

-- 6) In-app notifications (Realtime + RLS). Rows are inserted only via trigger (security definer).
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('comment_on_post', 'reply_to_comment')),
  title text not null,
  body text,
  link_post_id bigint not null references public.posts(id) on delete cascade,
  read_at timestamptz null,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
for select using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Clients cannot insert/delete notifications; trigger runs as definer and bypasses RLS.

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
  parent_author uuid;
begin
  select author_id into post_author from public.posts where id = new.post_id;
  if post_author is null then
    return new;
  end if;

  if new.parent_id is null then
    if post_author <> new.author_id then
      insert into public.notifications (user_id, type, title, body, link_post_id, actor_id)
      values (
        post_author,
        'comment_on_post',
        'New comment',
        left(new.content_md, 200),
        new.post_id,
        new.author_id
      );
    end if;
  else
    select author_id into parent_author from public.comments where id = new.parent_id;
    if parent_author is not null and parent_author <> new.author_id then
      insert into public.notifications (user_id, type, title, body, link_post_id, actor_id)
      values (
        parent_author,
        'reply_to_comment',
        'New reply',
        left(new.content_md, 200),
        new.post_id,
        new.author_id
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists comments_notify_after_insert on public.comments;
create trigger comments_notify_after_insert
after insert on public.comments
for each row execute function public.notify_on_comment();

-- Realtime: add table to publication (idempotent for re-runs).
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- 7) Plugin marketplace (web catalog; desktop install remains separate)
create table if not exists public.plugin_listings (
  id bigserial primary key,
  slug text not null unique,
  author_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  summary text not null,
  description_md text not null default '',
  repo_url text,
  homepage_url text,
  contact_md text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists plugin_listings_set_updated_at on public.plugin_listings;
create trigger plugin_listings_set_updated_at
before update on public.plugin_listings
for each row execute function public.set_updated_at();

create index if not exists plugin_listings_author_id_idx on public.plugin_listings (author_id);
create index if not exists plugin_listings_published_created_idx
  on public.plugin_listings (is_published, created_at desc);

create table if not exists public.plugin_reviews (
  id bigserial primary key,
  plugin_id bigint not null references public.plugin_listings(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  body_md text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plugin_id, author_id)
);

drop trigger if exists plugin_reviews_set_updated_at on public.plugin_reviews;
create trigger plugin_reviews_set_updated_at
before update on public.plugin_reviews
for each row execute function public.set_updated_at();

create index if not exists plugin_reviews_plugin_id_idx on public.plugin_reviews (plugin_id);

create table if not exists public.plugin_discussions (
  id bigserial primary key,
  plugin_id bigint not null references public.plugin_listings(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  parent_id bigint null references public.plugin_discussions(id) on delete cascade,
  content_md text not null,
  created_at timestamptz not null default now()
);

create index if not exists plugin_discussions_plugin_created_idx
  on public.plugin_discussions (plugin_id, created_at asc);
create index if not exists plugin_discussions_parent_idx
  on public.plugin_discussions (parent_id, created_at asc);

alter table public.plugin_listings enable row level security;
alter table public.plugin_reviews enable row level security;
alter table public.plugin_discussions enable row level security;

drop policy if exists "plugin_listings_select_visible" on public.plugin_listings;
create policy "plugin_listings_select_visible" on public.plugin_listings
for select using (is_published = true or auth.uid() = author_id);

drop policy if exists "plugin_listings_insert_self" on public.plugin_listings;
create policy "plugin_listings_insert_self" on public.plugin_listings
for insert with check (auth.uid() = author_id);

drop policy if exists "plugin_listings_update_self" on public.plugin_listings;
create policy "plugin_listings_update_self" on public.plugin_listings
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "plugin_listings_delete_self" on public.plugin_listings;
create policy "plugin_listings_delete_self" on public.plugin_listings
for delete using (auth.uid() = author_id);

drop policy if exists "plugin_reviews_select" on public.plugin_reviews;
create policy "plugin_reviews_select" on public.plugin_reviews
for select using (
  exists (
    select 1 from public.plugin_listings p
    where p.id = plugin_id and (p.is_published = true or p.author_id = auth.uid())
  )
);

drop policy if exists "plugin_reviews_insert_self" on public.plugin_reviews;
create policy "plugin_reviews_insert_self" on public.plugin_reviews
for insert with check (
  auth.uid() = author_id
  and exists (
    select 1 from public.plugin_listings p
    where p.id = plugin_id and p.is_published = true
  )
);

drop policy if exists "plugin_reviews_update_self" on public.plugin_reviews;
create policy "plugin_reviews_update_self" on public.plugin_reviews
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "plugin_reviews_delete_self" on public.plugin_reviews;
create policy "plugin_reviews_delete_self" on public.plugin_reviews
for delete using (auth.uid() = author_id);

drop policy if exists "plugin_discussions_select" on public.plugin_discussions;
create policy "plugin_discussions_select" on public.plugin_discussions
for select using (
  exists (
    select 1 from public.plugin_listings p
    where p.id = plugin_id and (p.is_published = true or p.author_id = auth.uid())
  )
);

drop policy if exists "plugin_discussions_insert_auth" on public.plugin_discussions;
create policy "plugin_discussions_insert_auth" on public.plugin_discussions
for insert with check (
  auth.uid() = author_id
  and exists (
    select 1 from public.plugin_listings p
    where p.id = plugin_id and p.is_published = true
  )
);

drop policy if exists "plugin_discussions_update_self" on public.plugin_discussions;
create policy "plugin_discussions_update_self" on public.plugin_discussions
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "plugin_discussions_delete_self" on public.plugin_discussions;
create policy "plugin_discussions_delete_self" on public.plugin_discussions
for delete using (auth.uid() = author_id);

