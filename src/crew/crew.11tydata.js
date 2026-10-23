// Dati comuni ai fascicoli dell'equipaggio (src/crew/*.html).
export default {
  layout: "layouts/crew.njk",
  eleventyComputed: {
    crumbs: (data) => data.page.inputPath.endsWith(".njk") ? [] : [{ label: "Crew", url: "/crew/" }, { label: data.crumb }],
    title: (data) => data.title || data.crumb || data.rankName,
  },
};
