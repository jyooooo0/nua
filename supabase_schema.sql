-- Enable UUID extension (usually enabled by default in Supabase, but good to be sure)
create extension if not exists "uuid-ossp";

-- Create Customers Table
create table if not exists customers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text,
  phone text,
  notes text
);

-- Create Visits Table
create table if not exists visits (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id) on delete cascade not null,
  visit_date date not null,
  services text[], -- Array of strings for services like ['Cut', 'Color']
  price integer default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Indexes for performance
create index if not exists visits_customer_id_idx on visits(customer_id);
create index if not exists visits_visit_date_idx on visits(visit_date);

-- Set up Row Level Security (RLS)
-- For now, we enable read/write for all (public) since we are managing it via Admin
-- In a real app, you'd restrict this to authenticated users
alter table customers enable row level security;
alter table visits enable row level security;

-- Policy to allow all access (since this is an admin tool controlled by the app)
-- Note: You still need the API Key to access.
create policy "Enable all access to customers" on customers for all using (true) with check (true);
create policy "Enable all access to visits" on visits for all using (true) with check (true);
