import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../lib/stripe';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type Stripe from 'stripe';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const buf = await buffer(req);

  let event: Stripe.Event;
  try {
    if (!sig) throw new Error('Missing signature');
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const courseId = metadata.courseId;
    const userId = metadata.userId;
    const amount = session.amount_total || 0;
    const stripeSessionId = session.id;

    if (!courseId || !userId) {
      console.warn('Missing metadata in session', session.id);
    } else {
      try {
        // Insert purchase
        const licenseCode = `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        const { error: insErr } = await supabaseAdmin.from('purchases').insert([
          {
            user_id: userId,
            course_id: courseId,
            stripe_session_id: stripeSessionId,
            amount_cents: amount,
            paid_at: new Date().toISOString(),
            license_code: licenseCode,
          },
        ]);

        if (insErr) throw insErr;

        // Récupérer l'id du purchase inséré (on peut SELECT)
        const { data: purchase } = await supabaseAdmin
          .from('purchases')
          .select('*')
          .eq('stripe_session_id', stripeSessionId)
          .limit(1)
          .single();

        // Créer une licence liée à l'achat
        if (purchase) {
          await supabaseAdmin.from('licenses').insert([
            {
              purchase_id: purchase.id,
              owner_user_id: userId,
              transferable: true,
              status: 'active',
            },
          ]);
        }

        console.log('Purchase enregistré pour user', userId, 'course', courseId);
      } catch (err) {
        console.error('Erreur DB webhook:', err);
      }
    }
  }

  res.json({ received: true });
}