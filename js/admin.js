const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const logoutLink = document.getElementById("logout-link");

let currentTable = "plats"; // "plats" ou "boissons"
let allDishes = [];

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
  loadDishes();
}

// --- Bascule entre la table "plats" et la table "boissons" ---
function switchTable(table) {
  currentTable = table;
  document.getElementById("tab-plats").classList.toggle("active", table === "plats");
  document.getElementById("tab-boissons").classList.toggle("active", table === "boissons");
  document.getElementById("dish-nom").placeholder = table === "boissons" ? "Vin Rouge Bordeaux" : "";
  resetForm();
  loadDishes();
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

// --- Chargement + affichage ---
async function loadDishes() {
  const { data, error } = await supabaseClient
    .from(currentTable)
    .select("id, nom, prix, categorie")
    .order("categorie", { ascending: true })
    .order("nom", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  allDishes = data || [];
  renderTable();
  renderCategoryOptions();
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
        <td>${d.categorie}</td>
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
  const datalist = document.getElementById("categorie-options");
  const categories = [...new Set(allDishes.map((d) => d.categorie))];
  datalist.innerHTML = categories.map((c) => `<option value="${c}">`).join("");
}

// --- Ajout / modification ---
const dishForm = document.getElementById("dish-form");
const submitBtn = document.getElementById("dish-submit-btn");

dishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("dish-error");
  errorEl.textContent = "";

  const id = document.getElementById("dish-id").value;
  const payload = {
    nom: document.getElementById("dish-nom").value.trim(),
    prix: document.getElementById("dish-prix").value.trim(),
    categorie: document.getElementById("dish-categorie").value.trim(),
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
  loadDishes();
});

function editDish(id) {
  const dish = allDishes.find((d) => d.id === id);
  if (!dish) return;
  document.getElementById("dish-id").value = dish.id;
  document.getElementById("dish-nom").value = dish.nom;
  document.getElementById("dish-prix").value = dish.prix;
  document.getElementById("dish-categorie").value = dish.categorie;
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
  loadDishes();
}

function resetForm() {
  dishForm.reset();
  document.getElementById("dish-id").value = "";
  submitBtn.textContent = "Ajouter";
}

checkSession();
