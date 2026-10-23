// Dati comuni a tutte le pagine dentro src/log/.
// Ogni diario indica nel front matter solo ciò che non si ricava altrove:
// il resto (reparto, nome, firma, miniatura, stardate…) arriva da
// _data/roster.json, _data/missions.json e _data/departments.json.

function resolve(data) {
  const [, , mkey, slot] = data.page.filePathStem.split("/");
  const mission = (data.missions || []).find((m) => m.key === mkey) || {};
  const r = (data.roster || {})[data.crew] || {};
  const type = data.type || "diary";
  const deptKey = data.dept || r.dept || (type === "briefing" ? "briefing" : "civ");
  const dept = data.departments[deptKey] || data.departments.civ;
  const code = data.code ?? r.code ?? "";
  const kind = data.kind ?? mission.kind ?? "";
  const name = data.name ?? r.name ?? "";
  // `role` (facoltativo) sostituisce la sigla nell'intestazione, es. "Primo Ufficiale"
  const roleLine = type === "briefing" ? kind : [dept.label, data.role || code, kind].filter(Boolean).join(" · ");
  return {
    mkey, slot, type, mission,
    dept: deptKey,
    tone: dept.tone,
    icon: data.icon || dept.icon,
    code, kind, name,
    short: data.short ?? r.short ?? name,
    roleLine,
    missionLine: data.missionLine ?? (mission.name ? `${mission.name} — ${mission.title}` : ""),
    stardate: data.stardate ?? mission.stardate,
    signature: data.signature === false ? null
      : (data.signature ?? (type === "briefing" ? null : [r.sign || name, code])),
    portrait: data.portrait ?? (r.thumb ? `/assets/img/crew/${r.thumb}` : null),
    crewUrl: data.crew ? `/crew/${data.crew}/` : null,
    // dati della card nell'indice missione
    cardRole: type === "briefing" ? (data.cardKind ?? kind) : [dept.label, code].filter(Boolean).join(" · "),
    cardName: data.cardName ?? name,
    from: data.from,
  };
}

export default {
  layout: "layouts/diary.njk",
  eleventyComputed: {
    d: (data) => resolve(data),
    crumbs: (data) => {
      if (data.page.inputPath.endsWith(".njk")) return [];
      const d = resolve(data);
      return [
        { label: "Log", url: "/log/" },
        { label: d.mission.name, url: d.mission.url },
        { label: d.type === "briefing" ? d.name : `${d.kind} – ${d.name}` },
      ];
    },
    title: (data) => {
      if (data.title) return data.title;
      const d = resolve(data);
      return d.type === "briefing"
        ? `${d.name} – ${d.mission.name}`
        : `${d.kind} ${d.name} – ${d.mission.name}`;
    },
  },
};
