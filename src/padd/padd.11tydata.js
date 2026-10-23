// Dati comuni ai documenti PADD (src/padd/*.html).
export default {
  layout: "layouts/padd.njk",
  eleventyComputed: {
    crumbs: (data) => data.page.inputPath.endsWith(".njk") ? [] : [{ label: "PADD", url: "/padd/" }, { label: data.code }],
  },
};
