const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const logoutLink = document.getElementById("logout-link");

let currentTable = "plats";
let allDishes = [];
let allCategories = [];

async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showDashboard();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.style.display = "block";
  dashboardView.style.display = "none";
  logoutLink.style.display = "none";
}

function showDashboard() {
  loginView.style.display = "none";
  dashboardView.style.display = "block";
  logoutLink.style.display = "inline";
  loadCategories();
  loadDishes();
}

function setActiveTab(tab) {
  const isCategoriesTab = tab === "categories";
  const tabPlats = document.getElementById("tab-plats");
  const tabBoissons = document.getElementById("tab-boissons");
  const tabCategories = document.getElementById("tab-categories");
  const dishModule = document.getElementById("dish-module");
  const categoriesModule = document.getElementById("categories-module");

  tabPlats.classList.toggle("active", currentTable === "plats" && !isCategoriesTab);
  tabBoissons.classList.toggle("active", currentTable === "boissons" && !isCategoriesTab);
  tabCategories.classList.toggle("active", isCategoriesTab);

  dishModule.style.display = isCategoriesTab ? "none" : "block";
  categoriesModule.style.display = isCategoriesTab ? "block" : "none";
}

function switchTable(table) {
  currentTable = table;
  setActiveTab("dishes");
  document.getElementById("dish-nom").placeholder = table === "boissons" ? "Vin Rouge Bordeaux" : "";
  resetForm();
  loadCategories();
  loadDishes();
}

function switchCategoriesTab() {
  setActiveTab("categories");
  loadCategories();
}

// --- Connexion / déconnexion ---
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    errorEl.textContent = "Email ou mot de passe incorrect.";
    return;
  }
  showDashboard();
});

logoutLink.addEventListener("click", async (e) => {
  e.preventDefault();
  await supabaseClient.auth.signOut();
  showLogin();
});

async function loadCategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("id, nom, type, ordre")
    .eq("type", currentTable)
    .order("ordre", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  allCategories = data || [];
  renderCategoryOptions();
  renderCategoryOrderTable();
}

async function loadDishes() {
  const { data, error } = await supabaseClient
    .from(currentTable)
    .select("id, nom, prix, categorie, categorie_id")
    .order("categorie", { ascending: true })
    .order("nom", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  allDishes = data || [];
  renderTable();
}

function renderTable() {
  const body = document.getElementById("dish-table-body");
  if (allDishes.length === 0) {
    body.innerHTML = `<tr><td colspan="4">Rien pour l'instant dans "${currentTable === "boissons" ? "Boissons" : "Plats"}". Ajoute le premier ci-dessus.</td></tr>`;
    return;
  }
  body.innerHTML = allDishes
    .map(
      (d) => `
      <tr>
        <td>${d.nom}</td>
        <td>${d.categorie || "-"}</td>
        <td>${d.prix}</td>
        <td class="actions">
          <button class="btn-ghost" onclick="editDish('${d.id}')">Modifier</button>
          <button class="btn-danger" onclick="deleteDish('${d.id}')">Supprimer</button>
        </td>
      </tr>`
    )
    .join("");
}

function renderCategoryOptions() {
  const select = document.getElementById("dish-categorie-select");
  if (!select) return;

  if (!allCategories.length) {
    select.innerHTML = '<option value="">Aucune catégorie</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  select.innerHTML = allCategories
    .map((category) => `<option value="${category.id}">${category.nom}</option>`)
    .join("");

  const currentCategoryField = document.getElementById("dish-categorie");
  if (currentCategoryField.value) {
    const match = allCategories.find((category) => category.nom === currentCategoryField.value);
    if (match) {
      select.value = match.id;
    }
  }
}

function renderCategoryOrderTable() {
  const body = document.getElementById("category-order-body");
  if (!body) return;

  if (!allCategories.length) {
    body.innerHTML = '<tr><td colspan="3">Aucune catégorie pour ce type.</td></tr>';
    return;
  }

  body.innerHTML = allCategories
    .map(
      (category) => `
      <tr>
        <td>${category.nom}</td>
        <td>
          <input type="number" min="0" step="10" value="${category.ordre ?? 999}" data-category-id="${category.id}">
        </td>
        <td>
          <button type="button" class="btn-ghost" data-save-category="${category.id}">Enregistrer</button>
        </td>
      </tr>`
    )
    .join("");
}

async function saveCategoryOrder(categoryId) {
  const input = document.querySelector(`input[data-category-id="${categoryId}"]`);
  if (!input) return;

  const ordre = Number(input.value);
  if (!Number.isFinite(ordre)) return;

  const { error } = await supabaseClient
    .from("categories")
    .update({ ordre })
    .eq("id", categoryId);

  if (error) {
    console.error(error);
    return;
  }

  loadCategories();
}

// --- Ajout / modification ---
const dishForm = document.getElementById("dish-form");
const submitBtn = document.getElementById("dish-submit-btn");

dishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("dish-error");
  errorEl.textContent = "";

  const id = document.getElementById("dish-id").value;
  const selectedCategoryId = document.getElementById("dish-categorie-select").value;
  const selectedCategory = allCategories.find((category) => category.id === selectedCategoryId);
  const categoryName = selectedCategory ? selectedCategory.nom : document.getElementById("dish-categorie").value.trim();

  const payload = {
    nom: document.getElementById("dish-nom").value.trim(),
    prix: document.getElementById("dish-prix").value.trim(),
    categorie: categoryName,
    categorie_id: selectedCategoryId || null,
  };

  const query = id
    ? supabaseClient.from(currentTable).update(payload).eq("id", id)
    : supabaseClient.from(currentTable).insert(payload);

  const { error } = await query;
  if (error) {
    errorEl.textContent = "Erreur lors de l'enregistrement. Vérifie ta connexion admin.";
    console.error(error);
    return;
  }

  resetForm();
  loadCategories();
  loadDishes();
});

function editDish(id) {
  const dish = allDishes.find((d) => d.id === id);
  if (!dish) return;
  document.getElementById("dish-id").value = dish.id;
  document.getElementById("dish-nom").value = dish.nom;
  document.getElementById("dish-prix").value = dish.prix;
  document.getElementById("dish-categorie").value = dish.categorie || "";

  const match = allCategories.find((category) => category.id === dish.categorie_id || category.nom === dish.categorie);
  const categorySelect = document.getElementById("dish-categorie-select");
  categorySelect.value = match ? match.id : "";

  submitBtn.textContent = "Enregistrer";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteDish(id) {
  if (!confirm("Supprimer définitivement ?")) return;
  const { error } = await supabaseClient.from(currentTable).delete().eq("id", id);
  if (error) {
    console.error(error);
    return;
  }
  loadCategories();
  loadDishes();
}

function resetForm() {
  dishForm.reset();
  document.getElementById("dish-id").value = "";
  document.getElementById("dish-categorie").value = "";
  const select = document.getElementById("dish-categorie-select");
  if (select && allCategories.length) {
    select.value = allCategories[0].id;
  }
  submitBtn.textContent = "Ajouter";
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-save-category]");
  if (!button) return;
  await saveCategoryOrder(button.dataset.saveCategory);
});

checkSession();
