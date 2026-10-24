// Configurazione Eleventy - USS Afrodite NCC-1863
// Il sito viene generato da src/ in _site/ (cartella pubblicata da Vercel).

const slotNum = (s) => parseFloat(String(s).replace(/[^\d.]/g, "")) || 0;

export default function (eleventyConfig) {
  // ── File copiati così come sono ─────────────────────────────
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });   // favicon, robots…
  eleventyConfig.addPassthroughCopy({ "archive": "archive" }); // sito storico 1999-2005

  // Le pagine .html di contenuto non usano un linguaggio di template:
  // il testo dei diari viene preso alla lettera (layout e front matter sì).
  eleventyConfig.setTemplateFormats(["njk", "html"]);

  // ── Collezioni ──────────────────────────────────────────────
  eleventyConfig.addCollection("diaries", (api) =>
    api.getFilteredByGlob("src/log/*/*.html")
      .filter((p) => !p.inputPath.includes("/reunion/"))
      .sort((a, b) => slotNum(a.data.d.slot) - slotNum(b.data.d.slot)));

  eleventyConfig.addCollection("reunions", (api) =>
    api.getFilteredByGlob("src/log/reunion/*.html"));

  eleventyConfig.addCollection("crew", (api) =>
    api.getFilteredByGlob("src/crew/*.html")
      .sort((a, b) => (a.data.order || 99) - (b.data.order || 99)));

  eleventyConfig.addCollection("padd", (api) =>
    api.getFilteredByGlob("src/padd/*.html")
      .sort((a, b) => (a.data.order || 99) - (b.data.order || 99)));

  // ── Filtri ──────────────────────────────────────────────────
  // Diari pubblicati di una missione
  eleventyConfig.addFilter("ofMission", (items, key) =>
    (items || []).filter((p) => p.data.d.mkey === key));

  // Card dell'indice missione: diari pubblicati + rapporti in arrivo
  eleventyConfig.addFilter("missionCards", (items, mission) => {
    const published = (items || [])
      .filter((p) => p.data.d.mkey === mission.key)
      .map((p) => ({ ...p.data.d, url: p.url }));
    const pending = (mission.pending || []).map((c) => ({ ...c, pending: true }));
    return [...published, ...pending].sort((a, b) => slotNum(a.slot) - slotNum(b.slot));
  });

  // Precedente / successivo all'interno di una lista ordinata
  eleventyConfig.addFilter("neighbours", (items, url) => {
    const i = (items || []).findIndex((p) => p.url === url);
    return {
      prev: i > 0 ? items[i - 1] : null,
      next: i >= 0 && i < items.length - 1 ? items[i + 1] : null,
    };
  });

  // Diario personale di un membro dell'equipaggio: tutti i suoi diari
  // pubblicati, dal più recente al più vecchio (stardate decrescente).
  eleventyConfig.addFilter("personalLog", (items, crewKey) =>
    (items || [])
      .filter((p) => p.data.crew === crewKey && p.data.d.type !== "briefing")
      .sort((a, b) => slotNum(b.data.d.stardate) - slotNum(a.data.d.stardate)));

  eleventyConfig.addFilter("inSection", (items, key) =>
    (items || []).filter((p) => p.data.section === key));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
  };
}
