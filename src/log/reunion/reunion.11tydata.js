// Log delle reunion: una sola pagina per incontro, intestazione propria.
export default {
  layout: "layouts/reunion.njk",
  eleventyComputed: {
    crumbs: (data) => [{ label: "Log", url: "/log/" }, { label: `${data.code} – ${data.heading}` }],
    title: (data) => data.heading ? `${data.code} – ${data.heading}` : data.code,
  },
};
