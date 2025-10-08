import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

// API qui renvoie un signed URL pour un module (fichier vidéo) uniquement si l'utilisateur a acheté le cours.
// Reçoit en POST { moduleId } et header Authorization: Bearer <access_token>

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
  if (!token) return res.status(401).json({ error: 'Missing access token' });

  const { moduleId } = req.body;
  if (!moduleId) return res.status(400).json({ error: 'moduleId required' });

  try {
    // Vérifier l'utilisateur via access token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token as string);
    if (userErr || !userData?.user) {
      console.error('Auth error', userErr);
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = userData.user;

    // Récupérer le module
    const { data: modData, error: modErr } = await supabaseAdmin.from('modules').select('*').eq('id', moduleId).single();
    if (modErr || !modData) {
      console.error('Module not found', modErr);
      return res.status(404).json({ error: 'Module not found' });
    }
    const module = modData;

    // Vérifier qu'il y a un achat (ou licence) pour ce user et le course_id
    const { data: purchaseData, error: purErr } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', module.course_id)
      .limit(1)
      .single();

    if (purErr || !purchaseData) {
      // pas d'achat => accès refusé
      return res.status(403).json({ error: 'No purchase found for this user and course' });
    }

    // Générer signed URL depuis Supabase Storage (bucket 'videos', durée 1 heure)
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'videos';
    const expiresIn = 60 * 60; // secondes (1h)
    const { data: signed, error: signedErr } = await supabaseAdmin.storage.from(bucket).createSignedUrl(module.content_path, expiresIn);
    if (signedErr) {
      console.error('Signed URL error', signedErr);
      return res.status(500).json({ error: 'Unable to create signed url' });
    }

    return res.status(200).json({ signedUrl: signed.signedUrl });
  } catch (err) {
    console.error('Error get-signed-url', err);
    return res.status(500).json({ error: 'Server error' });
  }
}