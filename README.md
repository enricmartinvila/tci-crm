# TCI Sponsor CRM

CRM privado para gestionar sponsors de **The Cartel Insider**.

## Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS + shadcn/ui
- Deploy listo para Vercel

## Setup

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).
3. En **Authentication → Users**, crea un usuario admin (email/password).
4. (Opcional) Ajusta el seed en [`supabase/seed.sql`](supabase/seed.sql) con tu `user_id`.
5. En Auth settings, desactiva el signup público si quieres solo acceso admin.

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Rellena:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) e inicia sesión.

### 4. Importar datos Attio

Orden: **Companies → Contacts → Deals**

1. Extrae `Companies.csv`, `People.csv`, `Deals.csv` de [`data/The_Cartel_Insider_Attio_Import_Pack.zip`](data/The_Cartel_Insider_Attio_Import_Pack.zip).
2. Ve a **/import** y sube cada archivo.
3. El mapeo de columnas viene preconfigurado para el pack Attio.
4. En Contacts, deja activado “Omitir placeholders” si solo quieres personas reales.

Stages CSV `Not contacted` se mapean a deal stage `Researching`.

## Vercel

1. Conecta el repo.
2. Añade las mismas env vars.
3. Deploy.

## Secciones

- **Dashboard** — estados, follow-ups, deals activos, won, prioritarias
- **Companies** — tabla + ficha con contactos, deals, activities
- **Contacts / Deals** — lista; deals con kanban drag & drop
- **Follow-ups** — hoy/overdue y próximos
- **Import** — CSV con mapeo de columnas
