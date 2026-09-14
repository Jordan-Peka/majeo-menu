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



alter table plats enable row level security;
alter table boissons enable row level security;

create policy "Lecture publique plats" on plats for select to anon, authenticated using (true);
create policy "Ajout plats par admin" on plats for insert to authenticated with check (true);
create policy "Modif plats par admin" on plats for update to authenticated using (true);
create policy "Suppr plats par admin" on plats for delete to authenticated using (true);

create policy "Lecture publique boissons" on boissons for select to anon, authenticated using (true);
create policy "Ajout boissons par admin" on boissons for insert to authenticated with check (true);
create policy "Modif boissons par admin" on boissons for update to authenticated using (true);
create policy "Suppr boissons par admin" on boissons for delete to authenticated using (true);
