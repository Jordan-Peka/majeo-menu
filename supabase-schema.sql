create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('plats', 'boissons')),
  nom text not null,
  ordre integer not null default 999,
  created_at timestamptz not null default now(),
  unique (type, nom)
);

create table if not exists plats (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prix text not null,
  categorie text not null,
  created_at timestamptz default now()
);

create table if not exists boissons (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prix text not null,
  categorie text not null,
  created_at timestamptz default now()
);

alter table plats add column if not exists categorie_id uuid references categories(id) on update cascade;
alter table boissons add column if not exists categorie_id uuid references categories(id) on update cascade;

alter table categories enable row level security;
alter table plats enable row level security;
alter table boissons enable row level security;

drop policy if exists "Lecture publique categories" on categories;
drop policy if exists "Ajout categories par admin" on categories;a
drop policy if exists "Modif categories par admin" on categories;
drop policy if exists "Suppr categories par admin" on categories;

drop policy if exists "Lecture publique plats" on plats;
drop policy if exists "Ajout plats par admin" on plats;
drop policy if exists "Modif plats par admin" on plats;
drop policy if exists "Suppr plats par admin" on plats;

drop policy if exists "Lecture publique boissons" on boissons;
drop policy if exists "Ajout boissons par admin" on boissons;
drop policy if exists "Modif boissons par admin" on boissons;
drop policy if exists "Suppr boissons par admin" on boissons;

create policy "Lecture publique categories" on categories for select to anon, authenticated using (true);
create policy "Ajout categories par admin" on categories for insert to authenticated with check (true);
create policy "Modif categories par admin" on categories for update to authenticated using (true);
create policy "Suppr categories par admin" on categories for delete to authenticated using (true);

create policy "Lecture publique plats" on plats for select to anon, authenticated using (true);
create policy "Ajout plats par admin" on plats for insert to authenticated with check (true);
create policy "Modif plats par admin" on plats for update to authenticated using (true);
create policy "Suppr plats par admin" on plats for delete to authenticated using (true);

create policy "Lecture publique boissons" on boissons for select to anon, authenticated using (true);
create policy "Ajout boissons par admin" on boissons for insert to authenticated with check (true);
create policy "Modif boissons par admin" on boissons for update to authenticated using (true);
create policy "Suppr boissons par admin" on boissons for delete to authenticated using (true);

insert into categories (type, nom, ordre)
values
  ('plats', 'Nos Petits Déjeuners', 10),
  ('plats', 'Nos entrées', 20),
  ('plats', 'Nos Poulets', 30),
  ('plats', 'Porc', 40),
  ('plats', 'Nos Viandes', 50),
  ('plats', 'Nos Poissons', 60),
  ('plats', 'Nos Fruits de Mer', 70),
  ('plats', 'Nos Plats du Terroir', 80),
  ('plats', 'Nos Pâtes', 90),
  ('plats', 'Nos Sandwiches', 100),
  ('plats', 'Nos Grillades', 110),
  ('plats', 'Nos Desserts', 120)
  on conflict (type, nom) do update set ordre = excluded.ordre;

update plats
set categorie_id = c.id
from categories c
where c.type = 'plats'
  and c.nom = plats.categorie;

update boissons
set categorie_id = c.id
from categories c
where c.type = 'boissons'
  and c.nom = boissons.categorie;
