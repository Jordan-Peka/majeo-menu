# Majeo Restaurant — Carte de menu

Site statique (HTML/CSS/JS) + base de données Supabase (gratuite).
**Deux tables distinctes : `plats` et `boissons`**, chacune avec (nom, prix, catégorie).
Le filtrage par catégorie se fait dynamiquement à l'intérieur de chaque table.

## 1. Créer la base de données (5 min, gratuit)

1. Va sur https://supabase.com → crée un compte → **New Project**.
2. Onglet **SQL Editor** → colle le contenu de `supabase-schema.sql` → **Run**.
   Cela crée les tables `plats` ET `boissons`, avec les règles de sécurité (lecture publique, écriture réservée à l'admin connecté).
3. **Project Settings → API** → note ton `Project URL` et ta clé `anon public`.
4. Ouvre `js/supabase-client.js` et remplace :
   ```js
   const SUPABASE_URL = "https://qnwxtzwsflylhcxserfw.supabase.co/rest/v1/";
   const SUPABASE_ANON_KEY = "sb_publishable_o8Hq5qZk6hLjxZQRFR0qsQ_qxMlCHcG";
   ```

## 2. Créer ton compte admin

Dans Supabase : **Authentication → Users → Add user** (email + mot de passe). C'est ce compte que tu utiliseras sur `admin.html`.

## 3. Tester en local

Ouvre `index.html` dans ton navigateur (ou `npx serve .`).
Sur `admin.html`, connecte-toi, puis utilise les onglets **Plats** / **Boissons** en haut du formulaire pour choisir dans quelle table tu ajoutes un article.

## 4. Déployer gratuitement

**Netlify (le plus simple)** : glisse le dossier entier sur https://app.netlify.com/drop → site en ligne immédiatement.
**Vercel** : mets le dossier dans un repo GitHub → **New Project** sur vercel.com → importe le repo → Deploy (aucune config nécessaire).

## Structure du projet

```
index.html                → Accueil : carte "Menu" + carte "Boissons"
categorie-plats.html      → Catégories de la table "plats"
menu.html                  → Plats d'une catégorie (?cat=slug)
categorie-boissons.html   → Catégories de la table "boissons"
boisson-menu.html          → Boissons d'une catégorie (?cat=slug)
admin.html                  → Connexion + gestion (onglets Plats/Boissons)
css/style.css               → Design
js/supabase-client.js       → Connexion à la base (à configurer)
js/app.js                   → Logique publique, générique aux deux tables
js/admin.js                 → Logique admin, bascule entre les deux tables
supabase-schema.sql         → À exécuter une fois dans Supabase
```

## Comment ça choisit la bonne table ?

Chaque page publique porte un attribut `data-table` sur sa balise `<body>` :
- `categorie-plats.html` / `menu.html` → `data-table="plats"`
- `categorie-boissons.html` / `boisson-menu.html` → `data-table="boissons"`

`js/app.js` lit cet attribut et interroge la bonne table — le même code sert aux deux sections.
Dans l'admin, les onglets font la même chose côté écriture.

## Ajouter une nouvelle catégorie

Rien à configurer : tape un nouveau nom de catégorie dans le formulaire admin
(dans l'onglet Plats ou Boissons selon le cas) en ajoutant un article. La page de catégories
correspondante la fera apparaître automatiquement.
