// client-side supabase (pour le navigateur)
// client-side supabase (pour le navigateur)

import { createClient } from '@supabase/supabase-js'

// ✅ utilise les variables d'environnement correctes (et sécurisées)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// ✅ exporte le client Supabase pour que Next.js puisse l'importer
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
