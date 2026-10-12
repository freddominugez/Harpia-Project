"""QA do redesign: rolagem horizontal, imagens, links internos, console, interações e SEO/GEO.

Uso (com o site gerado em dist/ e servido localmente):
    npm run build
    python3 -m http.server 4321 --directory dist &
    python3 scripts/qa_redesign.py --base http://localhost:4321 --shots docs/qa

Requer Playwright para Python (pip install playwright) e um Chromium.
Gera docs/qa/relatorio.json e as capturas de tela de referência.
"""
import argparse
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

from playwright.sync_api import sync_playwright

VIEWPORTS = [(1672, 941), (1440, 900), (1280, 800), (1024, 768), (768, 1024), (430, 932), (390, 844), (360, 780), (320, 720)]
DIST = Path("dist")


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs, self.srcs, self.ids = [], [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a" and a.get("href"):
            self.hrefs.append(a["href"])
        if tag in ("img", "source", "script", "link"):
            for k in ("src", "srcset", "href"):
                if a.get(k) and not (tag == "link" and a.get("rel") in ("canonical", "preconnect", "sitemap")):
                    self.srcs.append(a[k].split()[0])


def pages():
    """Rotas HTML do site. O painel /admin/ (Sveltia CMS) fica fora: exige HTTPS e rede."""
    out = []
    for f in sorted(DIST.rglob("*.html")):
        rel = "/" + str(f.relative_to(DIST)).replace("index.html", "")
        if not rel.startswith("/admin/"):
            out.append(rel)
    return out


SITE = "https://www.harpya.org"
ROBOS_IA = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot",
            "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent", "Amazonbot", "DuckAssistBot", "Bingbot"]


def seo_checks():
    """SEO técnico e GEO, direto no HTML gerado: um problema por linha (vazio = passou)."""
    import xml.etree.ElementTree as ET
    prob, titulos, descricoes = [], {}, {}
    sm = ET.parse(DIST / "sitemap.xml").getroot()
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    no_sitemap = {u.find("s:loc", ns).text for u in sm.findall("s:url", ns)}
    for u in sm.findall("s:url", ns):
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", (u.findtext("s:lastmod", "", ns) or "")):
            prob.append(f"sitemap: lastmod inválido em {u.findtext('s:loc', '', ns)}")
    for rota in pages():
        html = (DIST / rota.lstrip("/") / ("" if rota.endswith(".html") else "index.html")).read_text("utf-8")
        head = html.split("</head>", 1)[0]
        meta = lambda attr, nome: (re.search(rf'<meta {attr}="{re.escape(nome)}" content="([^"]*)"', head) or [None, None])[1]
        if rota == "/404.html":
            if 'name="robots" content="noindex' not in head:
                prob.append("404: falta noindex")
            continue
        url = SITE + rota
        t = re.findall(r"<title>(.*?)</title>", head)
        d = meta("name", "description")
        if len(t) != 1:
            prob.append(f"{rota}: {len(t)} <title>")
        else:
            titulos.setdefault(t[0], []).append(rota)
        if not d or not (50 <= len(d) <= 200):
            prob.append(f"{rota}: description ausente ou fora de 50 a 200 caracteres ({len(d or '')})")
        else:
            descricoes.setdefault(d, []).append(rota)
        if f'<link rel="canonical" href="{url}">' not in head:
            prob.append(f"{rota}: canonical diferente de {url}")
        for hl in ("pt-BR", "x-default"):
            if f'hreflang="{hl}" href="{url}"' not in head:
                prob.append(f"{rota}: falta hreflang {hl}")
        if url not in no_sitemap:
            prob.append(f"{rota}: fora do sitemap")
        og = meta("property", "og:image") or ""
        if not og.startswith(SITE) or not (DIST / urlparse(og).path.lstrip("/")).exists():
            prob.append(f"{rota}: og:image ausente ou sem arquivo ({og})")
        for prop in ("og:title", "og:description", "og:url", "og:image:width", "og:image:alt"):
            if not meta("property", prop):
                prob.append(f"{rota}: falta {prop}")
        for nome in ("twitter:card", "twitter:title", "twitter:image"):
            if not meta("name", nome):
                prob.append(f"{rota}: falta {nome}")
        md = re.search(r'<link rel="alternate" type="text/markdown" href="([^"]+)"', head)
        if not md or not (DIST / md.group(1).lstrip("/")).exists():
            prob.append(f"{rota}: gêmeo markdown ausente")
        if len(re.findall(r"<h1[\s>]", html)) != 1:
            prob.append(f"{rota}: precisa de exatamente um <h1>")
        ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', head, re.S)
        try:
            tipos = [n.get("@type") for n in json.loads(ld.group(1))["@graph"]]
        except Exception as erro:  # noqa: BLE001
            prob.append(f"{rota}: JSON-LD inválido ({erro})")
            continue
        for tipo in ("WebSite", "Organization", "Person", "WebPage"):
            if tipo not in tipos:
                prob.append(f"{rota}: JSON-LD sem {tipo}")
        if rota != "/" and "BreadcrumbList" not in tipos:
            prob.append(f"{rota}: JSON-LD sem BreadcrumbList")
        if "VideoObject" in tipos:
            prob.append(f"{rota}: VideoObject não é usado (decisão 4)")
    for valor, rotas_ in {**titulos, **descricoes}.items():
        if len(rotas_) > 1:
            prob.append(f"repetido em {rotas_}: {valor[:60]}")
    for u in no_sitemap:
        alvo = DIST / urlparse(u).path.lstrip("/") / "index.html"
        if not alvo.exists():
            prob.append(f"sitemap aponta para página inexistente: {u}")
        if "/admin" in u:
            prob.append("sitemap inclui /admin")
    robots = (DIST / "robots.txt").read_text("utf-8")
    if "Disallow: /admin/" not in robots or f"Sitemap: {SITE}/sitemap.xml" not in robots:
        prob.append("robots.txt sem Disallow /admin/ ou sem Sitemap")
    for bot in ROBOS_IA:
        if f"User-agent: {bot}\nAllow: /" not in robots:
            prob.append(f"robots.txt sem regra explícita para {bot}")
    for link in re.findall(r"\]\((https://www\.harpya\.org/[^)]+)\)", (DIST / "llms.txt").read_text("utf-8")):
        if not (DIST / urlparse(link).path.lstrip("/")).exists():
            prob.append(f"llms.txt aponta para arquivo inexistente: {link}")
    if (DIST / "llms-full.txt").stat().st_size < 20000:
        prob.append("llms-full.txt pequeno demais")
    try:
        ET.parse(DIST / "rss.xml")
    except ET.ParseError as erro:
        prob.append(f"rss.xml inválido: {erro}")
    admin = (DIST / "admin" / "index.html").read_text("utf-8")
    if 'name="robots" content="noindex' not in admin:
        prob.append("/admin/ sem meta noindex")
    return prob


def static_checks():
    """Links internos e arquivos locais referenciados em todo o build."""
    parsed = {}
    for f in DIST.rglob("*.html"):
        p = Links()
        p.feed(f.read_text("utf-8"))
        parsed[f] = p
    broken, missing = [], []
    for f, p in parsed.items():
        here = "/" + str(f.relative_to(DIST))
        for h in p.hrefs:
            u = urlparse(urljoin("https://x" + here, h))
            if u.netloc != "x" or h.startswith(("mailto:", "tel:")):
                continue
            path = u.path
            target = DIST / path.lstrip("/")
            if path.endswith("/"):
                target = target / "index.html"
            if not target.exists():
                broken.append((here, h))
                continue
            if u.fragment and target.suffix == ".html":
                tp = parsed.get(target)
                if tp and u.fragment not in tp.ids:
                    broken.append((here, h + " (âncora)"))
        for s in p.srcs:
            u = urlparse(urljoin("https://x" + here, s))
            if u.netloc != "x":
                continue
            if not (DIST / u.path.lstrip("/")).exists():
                missing.append((here, s))
    return sorted(set(broken)), sorted(set(missing))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://localhost:4321")
    ap.add_argument("--shots", default="docs/qa")
    args = ap.parse_args()
    Path(args.shots).mkdir(parents=True, exist_ok=True)

    broken, missing = static_checks()
    seo = seo_checks()
    rotas = pages()
    report = {"rotas": rotas, "links_quebrados": broken, "arquivos_faltando": missing, "seo_geo": seo, "viewports": {}, "console": {}, "imagens_quebradas": [], "interacoes": {}}

    proxy = os.environ.get("HTTPS_PROXY")
    host = urlparse(args.base).hostname
    with sync_playwright() as pw:
        browser = pw.chromium.launch(proxy={"server": proxy, "bypass": f"{host},localhost,127.0.0.1"} if proxy else None)

        for w, h in VIEWPORTS:
            ctx = browser.new_context(viewport={"width": w, "height": h})
            pg = ctx.new_page()
            errs = []
            # Erros vindos do iframe do Giscus (ex.: 404 "discussão ainda não criada") são esperados
            # até alguém comentar na página; ficam fora do gate.
            pg.on("console", lambda m, e=errs: e.append(m.text) if m.type == "error" and "giscus.app" not in (m.location or {}).get("url", "") else None)
            pg.on("pageerror", lambda x, e=errs: e.append(str(x)))
            res = {}
            for r in rotas:
                errs.clear()
                resp = pg.goto(args.base + r, wait_until="load")
                pg.evaluate("async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,30))}window.scrollTo(0,0)}")
                pg.wait_for_timeout(150)
                sw, iw = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
                bad = pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.currentSrc||i.src)")
                res[r] = {"scrollWidth": sw, "innerWidth": iw, "ok": sw <= iw}
                if bad:
                    report["imagens_quebradas"].append({"rota": r, "viewport": f"{w}x{h}", "src": bad})
                expected_404 = r == "/404.html"
                real = [e for e in errs if not (expected_404 and "404" in e)]
                if real:
                    report["console"].setdefault(r, []).append({"viewport": f"{w}x{h}", "erros": real})
            report["viewports"][f"{w}x{h}"] = res
            ctx.close()

        # Capturas exigidas pelo contrato.
        shots = [("/", 1672, 941, "home-desktop-1672.png", False), ("/", 1440, 900, "home-desktop-1440.png", True),
                 ("/", 390, 844, "home-mobile-390.png", True), ("/", 1024, 768, "home-tablet-1024.png", True),
                 ("/estudos/caminhos/certificado-inteiro/", 1672, 941, "artigo-desktop-1672.png", False),
                 ("/estudos/caminhos/certificado-inteiro/", 390, 844, "artigo-mobile-390.png", True)]
        for r, w, h, name, full in shots:
            pg = browser.new_page(viewport={"width": w, "height": h})
            pg.goto(args.base + r, wait_until="load")
            pg.evaluate("async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40))}window.scrollTo(0,0)}")
            pg.wait_for_timeout(400)
            pg.screenshot(path=f"{args.shots}/{name}", full_page=full)
            pg.close()

        # Interações: menu móvel, busca e índice lateral.
        it = {}
        pg = browser.new_page(viewport={"width": 390, "height": 844})
        pg.goto(args.base + "/", wait_until="load")
        btn = pg.locator("[data-menu]")
        it["menu_visivel_no_celular"] = btn.is_visible()
        btn.click()
        it["menu_abre_aria_expanded"] = btn.get_attribute("aria-expanded") == "true" and pg.locator("[data-mobile-panel]").is_visible()
        pg.keyboard.press("Escape")
        it["menu_fecha_com_esc"] = btn.get_attribute("aria-expanded") == "false" and not pg.locator("[data-mobile-panel]").is_visible()
        it["foco_volta_ao_botao"] = pg.evaluate("document.activeElement && document.activeElement.hasAttribute('data-menu')")
        btn.click()
        pg.screenshot(path=f"{args.shots}/home-mobile-390-menu.png")
        pg.locator("[data-mobile-panel] a[href='/news/']").click()
        pg.wait_for_load_state("networkidle")
        it["menu_navega_para_news"] = pg.url.endswith("/news/")
        pg.close()

        pg = browser.new_page(viewport={"width": 1440, "height": 900})
        pg.goto(args.base + "/", wait_until="load")
        it["nav_desktop_visivel"] = pg.locator(".nav-links").is_visible()
        pg.keyboard.press("Control+k")
        it["busca_abre_ctrl_k"] = pg.locator("[data-search-overlay]").is_visible()
        pg.fill("[data-search-input]", "bellman")
        pg.wait_for_timeout(400)
        n = pg.locator("[data-search-results] a").count()
        it["busca_resultados_bellman"] = n
        pg.fill("[data-search-input]", "equacoes atencao")
        pg.wait_for_timeout(200)
        it["busca_sem_acento_atencao"] = pg.locator("[data-search-results] a").count()
        pg.fill("[data-search-input]", "bellman")
        pg.wait_for_timeout(200)
        pg.screenshot(path=f"{args.shots}/busca-desktop-1440.png")
        pg.locator("[data-search-results] a").first.click()
        pg.wait_for_load_state("networkidle")
        it["busca_navega"] = pg.url
        pg.keyboard.press("Control+k")
        pg.keyboard.press("Escape")
        it["busca_fecha_com_esc"] = not pg.locator("[data-search-overlay]").is_visible()
        pg.goto(args.base + "/estudos/caminhos/certificado-inteiro/", wait_until="load")
        it["toc_itens"] = pg.locator(".toc a").count()
        it["toc_sticky"] = pg.evaluate("getComputedStyle(document.querySelector('.page-layout > aside')).position")
        it["katex_blocos"] = pg.locator(".katex").count()
        it["katex_erros_no_site"] = sum(f.read_text("utf-8").count("katex-error") for f in DIST.rglob("*.html"))
        pg.keyboard.press("Tab")
        it["skip_link_focavel"] = pg.evaluate("document.activeElement && document.activeElement.classList.contains('skip')")
        pg.close()
        report["interacoes"] = it

        browser.close()

    fails = [(vp, r) for vp, rs in report["viewports"].items() for r, v in rs.items() if not v["ok"]]
    report["resumo"] = {
        "rotas": len(rotas),
        "viewports": len(VIEWPORTS),
        "verificacoes_scroll": len(rotas) * len(VIEWPORTS),
        "rolagem_horizontal": fails,
        "links_quebrados": len(broken),
        "arquivos_faltando": len(missing),
        "imagens_quebradas": len(report["imagens_quebradas"]),
        "rotas_com_erro_console": len(report["console"]),
        "problemas_seo_geo": seo,
    }
    Path(args.shots, "relatorio.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), "utf-8")
    print(json.dumps(report["resumo"], ensure_ascii=False, indent=1))
    print(json.dumps(report["interacoes"], ensure_ascii=False, indent=1))
    ok = not fails and not broken and not missing and not report["imagens_quebradas"] and not report["console"] and not seo
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
