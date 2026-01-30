-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Customers Table
create table if not exists customers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text,
  phone text,
  notes text
);

-- Visits Table
create table if not exists visits (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id) on delete cascade not null,
  visit_date date not null,
  services text[],
  price integer default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reservations Table (for customer bookings)
create table if not exists reservations (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_email text,
  menu text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  slots_used text[] not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists visits_customer_id_idx on visits(customer_id);
create index if not exists visits_visit_date_idx on visits(visit_date);
create index if not exists reservations_date_idx on reservations(date);

-- Enable RLS
alter table customers enable row level security;
alter table visits enable row level security;
alter table reservations enable row level security;

-- Policies for customers (authenticated only)
create policy "Enable all access to customers" on customers for all using (true) with check (true);

-- Policies for visits (authenticated only)
create policy "Enable all access to visits" on visits for all using (true) with check (true);

-- Policies for reservations (public can read/insert, auth can manage)
create policy "Anyone can read reservations" on reservations for select using (true);
create policy "Anyone can insert reservations" on reservations for insert with check (true);
create policy "Auth can update reservations" on reservations for update using (auth.role() = 'authenticated');
create policy "Auth can delete reservations" on reservations for delete using (auth.role() = 'authenticated');
