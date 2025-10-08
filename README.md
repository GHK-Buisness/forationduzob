```markdown
# Mon-Formation (MVP gratuit / Stripe Checkout)

But : vendre une formation en ligne avec modules consultables, accès unique par compte, paiement via Stripe (seuls frais de transaction).

Résumé technique :
- Front + API : Next.js (TypeScript)
- Auth & BDD & Storage : Supabase (free tier)
- Paiement : Stripe Checkout + webhook
- Hébergement : Vercel (free)

Comptes à créer (gratuits) :
1. GitHub (pour versionner)
2. Supabase (https://supabase.com) — projet gratuit
3. Stripe (https://stripe.com) — pour accepter les paiements (pas d'abonnement, seulement frais par transaction)
4. Vercel (https://vercel.com) — hébergement gratuit pour Next.js

Étapes rapides (locale) :
1. Créer le projet Next.js
   npx create-next-app@latest mon-formation --typescript
   cd mon-formation

2. Installer dépendances
   npm install @supabase/supabase-js stripe swr

3. Copier les fichiers fournis (lib/, pages/api/, pages/..., db/schema.sql, .env.example)

4. Créer le projet Supabase, puis exécuter le SQL dans `db/schema.sql` (SQL Editor -> Run)

5. Dans Supabase : créer un bucket "videos" (Storage) pour héberger les modules vidéo (keep private).

6. Configurer les variables d'environnement (remplir .env selon .env.example)

7. Lancer en local :
   npm run dev

8. Dans Stripe : créer un produit / price correspondant à chaque course, ou la route serveur peut lire le price depuis la table `courses` si tu préfères.

Déploiement :
- Déployer sur Vercel et ajouter les mêmes variables d'environnement (STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, etc.). Pour le webhook Stripe, ajoute l'URL de `https://your-site.vercel.app/api/stripe-webhook` dans le dashboard Stripe.

Notes importantes :
- Supabase Storage : stocke les vidéos dans un bucket privé et génère des signed URLs côté serveur pour l'affichage.
- Stripe Checkout : on crée une session Checkout et on récupère l'évènement `checkout.session.completed` via webhook pour marquer l'achat payé dans la BDD.
- Sécurité : la route webhook vérifie la signature Stripe. Le service_role key de Supabase **doit rester secret** (utiliser en server-side uniquement, pas exposé au client).
- Revente : pour commencer, fais plutôt un système d’affiliation ou transfert manuel (voir roadmap plus tard). La revente P2P complète nécessite Stripe Connect + KYC.

Si tu veux, je continue immédiatement et :
- je t’aide à exécuter chaque commande localement,
- ou je te fournis le scaffold complet prêt à coller dans ton repo (je viens de le faire ci‑dessous).
```