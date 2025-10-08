import { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Props = {
  course: any | null;
  hasAccess: boolean;
};

export default function CoursePage({ course, hasAccess }: Props) {
  const router = useRouter();

  if (!course) {
    return <div style={{ padding: 20 }}>Cours introuvable</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>

      {hasAccess ? (
        <div>
          <h2>Modules</h2>
          {/* Ici tu affiches la liste des modules, avec signed URLs depuis Storage */}
        </div>
      ) : (
        <div>
          <p>Tu n'as pas accès à ce cours.</p>
          <button
            onClick={async () => {
              // créer session checkout côté client
              const user = supabase.auth.getUser; // placeholder
              // En pratique, appelle l'API create-checkout-session en POST avec courseId & userId
              router.push('/');
            }}
          >
            Acheter la formation
          </button>
        </div>
      )}
    </div>
  );
}

// Vérifie côté serveur si l'utilisateur est connecté et s'il a une licence
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { params, req } = ctx;
  const slug = params?.slug as string;

  // Récupérer le cours par slug
  const { data: course } = await supabaseAdmin.from('courses').select('*').eq('slug', slug).single();

  // Vérifier cookie auth (supabase stocke l'access_token dans cookie si tu as configuré)
  // Pour simplifier, on ne vérifie pas l'utilisateur ici. En production, on lit l'auth cookie/supabase session.
  // Ici, renvoie hasAccess=false pour prototype.
  return {
    props: {
      course: course || null,
      hasAccess: false,
    },
  };
};