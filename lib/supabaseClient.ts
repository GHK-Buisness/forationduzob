// client-side supabase (pour le navigateur)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qbruvrrhzdabfdtkwulh.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
