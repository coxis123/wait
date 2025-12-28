-- Wait App Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default now(),
  display_name text,
  total_saved numeric default 0,
  items_skipped integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_decision_date date,
  push_token text
);

-- Wait items table
create table public.wait_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default now(),

  -- Item details
  name text not null,
  price numeric not null,
  url text,
  note text, -- "Why do you want this?" — shown back to them later

  -- Wait period
  wait_days integer not null default 30,
  decision_due_at timestamp with time zone not null,

  -- Outcome
  status text default 'waiting', -- 'waiting', 'skipped', 'bought'
  decided_at timestamp with time zone,

  -- For notifications
  reminder_sent boolean default false
);

-- Row level security
alter table public.profiles enable row level security;
alter table public.wait_items enable row level security;

-- Users can only see/edit their own data
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can view own items" on public.wait_items
  for select using (auth.uid() = user_id);

create policy "Users can insert own items" on public.wait_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update own items" on public.wait_items
  for update using (auth.uid() = user_id);

create policy "Users can delete own items" on public.wait_items
  for delete using (auth.uid() = user_id);

-- Function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Index for faster queries
create index wait_items_user_id_idx on public.wait_items(user_id);
create index wait_items_status_idx on public.wait_items(status);
create index wait_items_decision_due_at_idx on public.wait_items(decision_due_at);
