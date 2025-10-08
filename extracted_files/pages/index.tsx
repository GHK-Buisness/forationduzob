import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      setCourses(data || []);
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Mon-Formation</h1>
      <p>Plateforme de vente de formation — MVP</p>

      <section>
        <h2>Formations</h2>
        {courses.length === 0 && <p>Aucune formation pour l'instant. Ajoute-en via Supabase.</p>}
        <ul>
          {courses.map((c) => (
            <li key={c.id}>
              <strong>{c.title}</strong> — {(c.price_cents / 100).toFixed(2)}€
              {' — '}
              <Link href={`/courses/${c.slug}`}>Voir</Link>
            </li>
          ))}
        </ul>
      </section>

      <p>
        <Link href="/auth/signin">Se connecter / S'inscrire</Link> — <Link href="/dashboard">Mon Dashboard</Link>
      </p>
    </div>
  );
}