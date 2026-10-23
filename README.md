# USS Afrodite NCC-1863

Portale LCARS della USS Afrodite: diari di missione, fascicoli dell'equipaggio, specifiche della nave e comunicazioni PADD.

Il sito è statico, ma le pagine vengono **generate** con [Eleventy](https://www.11ty.dev/) a partire da
modelli (layout) e dati. Così intestazioni, firme, card, contatori e pulsanti avanti/indietro si scrivono
una volta sola.

## Avvio rapido

```bash
npm install        # solo la prima volta
npm start          # anteprima locale su http://localhost:8080 (si aggiorna da sola)
npm run build      # genera il sito in _site/
npm run check      # build + controllo dei link interni
```

Vercel esegue `npm run build` a ogni push e pubblica la cartella `_site/` (vedi `vercel.json`).

## Struttura

```
src/
├── index.njk                 home
├── log/
│   ├── index.njk             indice dei log (da _data/missions.json)
│   ├── mission.njk           genera l'indice di ogni missione (/log/m1/, /log/smc/…)
│   ├── log.11tydata.js       logica comune ai diari (reparto, firma, miniatura…)
│   ├── m1/ … m7/, smc/, x01/ un file per diario: 00.html = briefing, 01.html = capitano…
│   └── reunion/              log speciali delle reunion
├── crew/                     un file per fascicolo (alighieri.html…) + index.njk
├── padd/                     un file per documento (4a.html…) + index.njk
├── ship/index.html
├── _data/                    dati condivisi (vedi sotto)
├── _includes/
│   ├── layouts/              base, diary, reunion, crew, padd, page
│   ├── partials/             header, footer, breadcrumb, banner, pager, firma…
│   └── css/                  foglio di stile diviso per sezioni (unito in /assets/css/site.css)
├── assets/                   img/ e js/site.js
└── static/                   favicon (copiati nella radice del sito)
archive/1999/                 sito storico 1999-2005 (pubblicato così com'è su /archive/1999/)
```

Tutti i percorsi sono assoluti dalla radice (`/assets/img/...`, `/crew/tmik/`): funzionano da qualunque
sottocartella. I vecchi indirizzi (`log_mission1_05.html`, `crew_tmik.html`, `old/...`) sono reindirizzati
automaticamente ai nuovi da `vercel.json`.

## Dati condivisi (`src/_data/`)

| File | Contenuto |
|---|---|
| `site.json` | nome, registro, motto, posizione, effettivo |
| `departments.json` | reparti: sigla (COM, SCI, MED…), colore e icona |
| `roster.json` | come appare ogni ufficiale nei diari: nome, sigla, reparto, firma, miniatura |
| `missions.json` | elenco del Log (ordine = ordine di visualizzazione), titoli, stardate, stato, rapporti in arrivo |
| `crewSections.json` | sezioni dell'indice equipaggio |
| `triviatrek.json` | classifica TriviaTrek in home |
| `legend.json`, `statusIcon.json` | legenda e icone dello stato dei log |

## Come fare per…

### Aggiungere un diario a una missione esistente
Crea `src/log/m7/10.html`:

```html
---
crew: jacket
---
<div class="diary-section-title">Diario di Missione</div>
<p>Testo del diario…</p>
```

Intestazione colorata, miniatura, link alla scheda, stardate della missione, firma, breadcrumb,
pulsanti ← → e card nell'indice missione vengono generati da soli. Campi facoltativi nel front matter,
solo se diversi dal solito: `kind` (es. `Diario di Bordo`), `code`, `role`, `name`, `short`, `dept`,
`icon`, `stardate`, `signature: ["GM Nome", "Ruolo"]` oppure `signature: false`.

Se il rapporto era tra i "rapporti in arrivo" (card disattivata), toglilo da `pending` in `missions.json`.

### Aggiungere una nuova missione
1. Aggiungi la voce in `src/_data/missions.json` (copia una missione esistente: `key`, `code`, `title`,
   `status`, `url`, `name`, `label`, `stardate`, `kind`).
2. Crea la cartella `src/log/<key>/` con `00.html` (briefing, `type: "briefing"`) e i diari.
3. Facoltativo: elenca in `pending` i rapporti attesi; compariranno come card disattivate.

### Aggiungere un membro dell'equipaggio
1. Foto in `src/assets/img/crew/` (`nome.jpg` per la scheda, `nome_l.jpg` per la miniatura nei diari).
2. Crea `src/crew/nome.html` copiando un fascicolo simile e modificando il front matter
   (`section` e `order` decidono dove compare nell'indice).
3. Se scriverà diari, aggiungilo a `src/_data/roster.json`.

### Aggiungere un PADD
Crea `src/padd/4j.html` copiando un documento esistente; `order` stabilisce la posizione nella bacheca.

## Stili e script

- `src/_includes/css/` – un file per area, uniti in ordine in `/assets/css/site.css`.
  I colori di reparto sono classi `.tone-cmd`, `.tone-sci`, `.tone-ops`, `.tone-ext`, `.tone-civ`
  (file `16-components.css`).
- `src/assets/js/site.js` – stardate, orologio, cielo stellato, animazioni, lightbox, gestione immagini mancanti.
