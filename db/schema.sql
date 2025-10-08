-- SQL minimal pour Supabase (Run dans SQL Editor)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profil utilisateur (Supabase gère auth.users ; nous stockons un profil lié)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Courses
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price_cents integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Modules (le contenu peut être une vidéo stockée en Storage)
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_idx integer DEFAULT 0,
  content_type text DEFAULT 'video', -- video, article, pdf
  content_path text, -- chemin dans Supabase Storage ou URL
  created_at timestamptz DEFAULT now()
);

-- Achats / purchases
CREATE TABLE purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  course_id uuid REFERENCES courses(id),
  stripe_session_id text,
  amount_cents integer,
  paid_at timestamptz,
  license_code text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Licences (séparation pour transfert futur)
CREATE TABLE licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES purchases(id),
  owner_user_id uuid REFERENCES auth.users(id),
  transferable boolean DEFAULT true,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);