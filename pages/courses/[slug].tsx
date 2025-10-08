import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function CoursePublicPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [course, setCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // charger user supabase
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      setLoading(true);
      // récupérer le cours par slug
      const { data: courses } = await supabase.from('courses').select('*').eq('slug', slug).limit(1);
      const c = courses?.[0] ?? null;
      setCourse(c);
      if (c) {
        const { data: mods } = await supabase.from('modules').select('*').eq('course_id', c.id).order('order_idx', { ascending: true });
        setModules(mods || []);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => {
    // si user connecté, vérifier accès (via table purchases)
    async function check() {
      if (!user || !course) return setHasAccess(false);
      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .limit(1);
      setHasAccess((data && data.length > 0) ?? false);
    }
    check();
  }, [user, course]);

  async function handleBuy() {
    if (!user) {
      alert('Connecte-toi ou inscris-toi pour acheter.');
      router.push('/auth/signin');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, userId: user.id }),
      });
      const body = await res.json();
      if (body.url) {
        // rediriger vers Stripe Checkout
        window.location.href = body.url;
      } else {
        alert('Erreur lors de la création du paiement');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  async function openModule(mod: any) {
    if (!user) {
      alert('Connecte-toi pour accéder au module.');
      return;
    }
    if (!hasAccess) {
      alert('Tu n\'as pas accès à ce cours. Achète-le pour voir le contenu.');
      return;
    }
    // appeler l'API serveur pour obtenir signed URL
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/get-signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ moduleId: mod.id }),
      });
      if (!res.ok) {
        const text = await res.text();
        alert('Erreur : ' + text);
        return;
      }
      const { signedUrl } = await res.json();
      // ouvrir dans une nouvelle fenêtre ou insérer player
      window.open(signedUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la récupération de la vidéo.');
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>;
  if (!course) return <div style={{ padding: 20 }}>Cours introuvable</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Prix : {(course.price_cents / 100).toFixed(2)}€</p>

      {hasAccess ? (
        <div>
          <h2>Modules</h2>
          <ul>
            {modules.map((m) => (
              <li key={m.id}>
                {m.title} {' '}
                <button onClick={() => openModule(m)}>Ouvrir</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button onClick={handleBuy}>Acheter la formation</button>
        </div>
      )}
    </div>
  );
}