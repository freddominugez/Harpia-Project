// Interações do site, sem dependências: menu móvel, busca e índice lateral.

type Item = { title: string; url: string; section: string; description?: string };

// ---------- menu móvel ----------
const menuBtn = document.querySelector<HTMLButtonElement>("[data-menu]");
const panel = document.querySelector<HTMLElement>("[data-mobile-panel]");

function setMenu(open: boolean, focusButton = false) {
  if (!menuBtn || !panel) return;
  panel.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  menuBtn.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
  if (open) panel.querySelector<HTMLAnchorElement>("a")?.focus();
  else if (focusButton) menuBtn.focus();
}
menuBtn?.addEventListener("click", () => setMenu(!panel?.classList.contains("is-open")));
panel?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("click", (e) => {
  if (!panel?.classList.contains("is-open")) return;
  const t = e.target as Node;
  if (!panel.contains(t) && !menuBtn?.contains(t)) setMenu(false);
});
window.matchMedia("(min-width: 1101px)").addEventListener("change", (m) => { if (m.matches) setMenu(false); });

// ---------- busca ----------
const overlay = document.querySelector<HTMLElement>("[data-search-overlay]");
const input = document.querySelector<HTMLInputElement>("[data-search-input]");
const results = document.querySelector<HTMLElement>("[data-search-results]");
let index: Item[] | null = null;
let lastFocus: HTMLElement | null = null;

const norm = (v = "") => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

async function loadIndex(): Promise<Item[]> {
  if (index) return index;
  try {
    const r = await fetch("/busca.json");
    index = r.ok ? ((await r.json()) as Item[]) : [];
  } catch {
    index = [];
  }
  return index;
}

function draw(q: string) {
  if (!results) return;
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const items = (index ?? [])
    .filter((x) => {
      const hay = norm(`${x.title} ${x.description ?? ""} ${x.section}`);
      return terms.every((t) => hay.includes(t));
    })
    .slice(0, 18);
  results.replaceChildren();
  if (!items.length) {
    const p = document.createElement("p");
    p.textContent = index && index.length ? "Nenhum resultado. Tente outro termo." : "Carregando o índice...";
    results.append(p);
    return;
  }
  for (const x of items) {
    const a = document.createElement("a");
    a.href = x.url;
    const strong = document.createElement("strong");
    strong.textContent = x.title;
    const span = document.createElement("span");
    span.textContent = x.section + (x.description ? ` · ${x.description}` : "");
    a.append(strong, span);
    results.append(a);
  }
}

async function openSearch() {
  if (!overlay || !input) return;
  lastFocus = document.activeElement as HTMLElement | null;
  setMenu(false);
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  input.focus();
  draw(input.value);
  await loadIndex();
  draw(input.value);
}

function closeSearch() {
  if (!overlay || !overlay.classList.contains("is-open")) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastFocus?.focus();
}

document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", openSearch));
document.querySelectorAll("[data-search-close]").forEach((b) => b.addEventListener("click", closeSearch));
overlay?.addEventListener("click", (e) => { if (e.target === overlay) closeSearch(); });
input?.addEventListener("input", () => draw(input.value));

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); return; }
  if (e.key === "Escape") {
    if (overlay?.classList.contains("is-open")) closeSearch();
    else if (panel?.classList.contains("is-open")) setMenu(false, true);
    return;
  }
  // Mantém o foco dentro do diálogo de busca.
  if (e.key === "Tab" && overlay?.classList.contains("is-open")) {
    const f = [...overlay.querySelectorAll<HTMLElement>("input, button, a[href]")];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// ---------- índice lateral: marca a seção visível ----------
const anchors = [...document.querySelectorAll<HTMLAnchorElement>(".toc a[href^='#']")];
const heads = anchors
  .map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))
  .filter((h): h is HTMLElement => !!h);
if (heads.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) anchors.forEach((a) => a.classList.toggle("active", decodeURIComponent(a.hash.slice(1)) === e.target.id));
      }
    },
    { rootMargin: "-90px 0px -65% 0px" },
  );
  heads.forEach((h) => io.observe(h));
}
