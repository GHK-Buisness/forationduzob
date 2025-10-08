-- Exemples SQL : créer un cours + modules
-- Exécute dans Supabase SQL editor (ou via psql)

-- 1) Créer un cours
INSERT INTO courses (title, slug, description, price_cents)
VALUES (
  'Ma Formation Exemple',
  'ma-formation-exemple',
  'Description courte de la formation exemple',
  19900 -- 199.00 EUR en centimes
);

-- Récupère l'id du cours inséré si nécessaire (ou regarde la table Courses dans Supabase UI)
-- 2) Créer des modules liés (adapter course_id)
-- Remplace <course_id> par l'UUID réel du cours
INSERT INTO modules (course_id, title, order_idx, content_type, content_path)
VALUES
  ('<course_id>', 'Introduction', 1, 'video', 'videos/ma-formation/intro.mp4'),
  ('<course_id>', 'Module 1 - Partie 1', 2, 'video', 'videos/ma-formation/mod1.mp4');

-- Exemple : créer un test utilisateur (en plus de Supabase Auth)
-- Si tu veux un user de test (note : la table profiles est liée à auth.users,
-- crée l'utilisateur via l'UI Auth -> Users ou via supabase.auth.admin.createUser)