import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return alert(error.message);
    alert('Vérifie ton email pour confirmer (si activé) ou connecte-toi.');
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return alert(error.message);
    router.push('/dashboard');
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Connexion / Inscription</h1>

      <div style={{ maxWidth: 400 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
        <input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button onClick={signIn}>Se connecter</button>{' '}
        <button onClick={signUp}>S'inscrire</button>
      </div>
    </div>
  );
}