// Box "LOG" della homepage: legge src/_data/registro.txt
// (una voce per riga:  STARDATE | TESTO | LINK  — vedi istruzioni nel file).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FILE = fileURLToPath(new URL("./registro.txt", import.meta.url));

export default function () {
  const entries = [];
  readFileSync(FILE, "utf8").split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const [sd = "", text = "", url = ""] = line.split("|").map((s) => s.trim());
    if (!text) {
      console.warn(`[registro.txt] riga ${i + 1} ignorata (manca il testo): ${line}`);
      return;
    }
    entries.push({ sd, text, url });
  });
  return entries;
}
