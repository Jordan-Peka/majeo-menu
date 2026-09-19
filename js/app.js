// Ces deux fonctions marchent pour n'importe quelle table (plats OU boissons) :
// la table à interroger est lue depuis l'attribut data-table du <body>.

// --- Pages catégorie-plats.html / catégorie-boissons.html ---
async function renderCategories() {
  const grid = document.getElementById("category-grid");
  if (!grid) return;

  const table = document.body.dataset.table;
  const target = document.body.dataset.target;

  const { data, error } = await supabaseClient.from(table).select("categorie");

  if (error) {
    grid.innerHTML = `<p class="empty-state">Impossible de charger les catégories pour le moment.</p>`;
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    grid.innerHTML = `<p class="empty-state">Rien n'a encore été ajouté ici. Rendez-vous sur la page Admin pour commencer.</p>`;
    return;
  }

  const counts = {};
  data.forEach((row) => {
    counts[row.categorie] = (counts[row.categorie] || 0) + 1;
  });

  const categories = Object.keys(counts).sort((a, b) => a.localeCompare(b, "fr"));

  const cardsMarkup = categories
    .map((cat) => {
      const slug = slugify(cat);
      const n = counts[cat];
      return `
        <a class="category-card" href="${target}?cat=${encodeURIComponent(slug)}">
          <span class="name">${cat}</span>
          <span class="count">${n} article${n > 1 ? "s" : ""}</span>
          <span class="category-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </a>`;
    })
    .join("");

  grid.innerHTML = `${cardsMarkup}
    <a class="menu-return" href="index.html">
      <span>Retour à l'accueil</span>
    </a>`;
}

// --- Pages menu.html / boisson-menu.html ---
async function renderMenu() {
  const list = document.getElementById("menu-list");
  if (!list) return;

  const table = document.body.dataset.table;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("cat");
  const titleEl = document.getElementById("category-title");

  if (!slug) {
    titleEl.textContent = "Catégorie introuvable";
    list.innerHTML = `<p class="empty-state">Aucune catégorie sélectionnée.</p>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from(table)
    .select("nom, prix, categorie")
    .order("nom", { ascending: true });

  if (error) {
    list.innerHTML = `<p class="empty-state">Impossible de charger la liste pour le moment.</p>`;
    console.error(error);
    return;
  }

  const items = (data || []).filter((row) => slugify(row.categorie) === slug);
  titleEl.textContent = items.length > 0 ? items[0].categorie : slug.replace(/-/g, " ");

  if (items.length === 0) {
    list.innerHTML = `<p class="empty-state">Rien dans cette catégorie pour le moment.</p>`;
    return;
  }

  const backLink = document.body.dataset.back || "categorie-plats.html";

  list.innerHTML = items
    .map(
      (d) => `
      <div class="dish-row">
        <span class="name">${d.nom}</span>
        <span class="leader"></span>
        <span class="price">${d.prix}</span>
      </div>`
    )
    .join("") + `
      <a class="menu-return" href="${backLink}">
        <span>Retour page précédente</span>
      </a>`;
}

renderCategories();
renderMenu();
