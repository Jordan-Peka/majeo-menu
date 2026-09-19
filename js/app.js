// Ces deux fonctions marchent pour n'importe quelle table (plats OU boissons) :
// la table à interroger est lue depuis l'attribut data-table du <body>.

function getNestedCount(row, tableName) {
  const nested = row?.[tableName];
  if (Array.isArray(nested)) {
    return Number(nested[0]?.count ?? 0);
  }
  if (nested && typeof nested === "object") {
    return Number(nested.count ?? 0);
  }
  return 0;
}

// --- Pages catégorie-plats.html / catégorie-boissons.html ---
async function renderCategories() {
  const grid = document.getElementById("category-grid");
  if (!grid) return;

  const table = document.body.dataset.table;
  const target = document.body.dataset.target;

  const { data, error } = await supabaseClient
    .from("categories")
    .select(`id, nom, ordre, ${table}(count)`)
    .eq("type", table)
    .order("ordre", { ascending: true });

  if (error) {
    grid.innerHTML = `<p class="empty-state">Impossible de charger les catégories pour le moment.</p>`;
    console.error(error);
    return;
  }

  const categories = (data || []).map((category) => ({
    ...category,
    count: getNestedCount(category, table),
  }));

  if (!categories.length) {
    grid.innerHTML = `<p class="empty-state">Rien n'a encore été ajouté ici. Rendez-vous sur la page Admin pour commencer.</p>`;
    return;
  }

  const cardsMarkup = categories
    .map((category) => {
      const slug = slugify(category.nom);
      const n = category.count;
      return `
        <a class="category-card" href="${target}?cat=${encodeURIComponent(slug)}">
          <span class="name">${category.nom}</span>
          <span class="count">${n} article${n > 1 ? "s" : ""}</span>
          <span class="category-icon" aria-hidden="true">
          <svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
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

  const backButton = list.querySelector(".menu-return");
  if (backButton) {
    backButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    });
  }
}

renderCategories();
renderMenu();
