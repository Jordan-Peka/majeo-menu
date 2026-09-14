// ⚠️ Remplace ces deux valeurs par celles de TON projet Supabase
// (Supabase → Project Settings → API)
const SUPABASE_URL = "https://qnwxtzwsflylhcxserfw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_o8Hq5qZk6hLjxZQRFR0qsQ_qxMlCHcG";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Transforme "Petits Déjeuners" en "petits-dejeuners" pour les URLs
function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
