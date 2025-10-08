import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../lib/stripe';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { courseId, userId } = req.body;
  if (!courseId || !userId) return res.status(400).json({ error: 'courseId & userId required' });

  // Récupérer le price depuis la table courses
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .select('id, title, price_cents')
    .eq('id', courseId)
    .single();

  if (error || !course) return res.status(400).json({ error: 'Course not found' });

  try {
    // Crée une session Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: course.title,
            },
            unit_amount: course.price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course.id,
        userId: userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe create session error', err);
    return res.status(500).json({ error: 'Stripe error' });
  }
}