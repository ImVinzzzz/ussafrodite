// Controllo link e risorse interne del sito generato (_site/).
// Uso: npm run check   (esegue prima la build)
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const ROOT = resolve("_site");
const SKIP = /^(https?:|mailto:|tel:|data:|javascript:|#)/i;
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.html?$/i.test(name)) files.push(p);
  }
})(ROOT);

const exists = (url, from) => {
  const clean = decodeURIComponent(url.split("#")[0].split("?")[0]);
  if (!clean) return true;
  const target = clean.startsWith("/") ? join(ROOT, clean) : resolve(dirname(from), clean);
  if (existsSync(target) && statSync(target).isFile()) return true;
  return existsSync(join(target, "index.html")) || existsSync(join(target, "index.htm"));
};

let broken = 0;
const isArchive = (f) => f.includes(`${join(ROOT, "archive")}`);
for (const file of files) {
  const html = readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  for (const m of html.matchAll(/\s(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const url = m[1].trim();
    if (SKIP.test(url) || exists(url, file)) continue;
    if (isArchive(file) && !process.argv.includes("--archive")) continue;
    broken++;
    console.log(`✗ ${file.replace(ROOT, "")} → ${url}`);
  }
}
console.log(broken ? `\n${broken} collegamenti interrotti.` : `Nessun collegamento interrotto (${files.length} pagine).`);
process.exit(broken ? 1 : 0);
