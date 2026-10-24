# Resoconto progetto - USS Afrodite NCC-1863

Aggiornamento: 23 ottobre 2026 - refactoring "Eleventy" (branch `refactor-11ty`)
Base di partenza: commit `2817df9` del repository `ImVinzzzz/ussafrodite`.

## Stato attuale

Il sito è stato riorganizzato in sottocartelle per sezione e viene generato con Eleventy (Node).
Il risultato pubblicato resta HTML statico (cartella `_site/`), costruito da Vercel a ogni push.
Istruzioni operative in `README.md`.

| Sezione | Sorgente | Indirizzo pubblico |
|---|---|---|
| Home | `src/index.njk` | `/` |
| Log | `src/log/index.njk` + `src/_data/missions.json` | `/log/` |
| Missioni | `src/log/mission.njk` (una pagina per missione) | `/log/m1/` … `/log/smc/`, `/log/x01/` |
| Diari | `src/log/<missione>/<NN>.html` | `/log/m1/05/` |
| Reunion | `src/log/reunion/<NNN>.html` | `/log/reunion/001/` |
| Crew | `src/crew/index.njk` + `src/crew/<nome>.html` | `/crew/`, `/crew/tmik/` |
| Diario personale (Ufficiali Superiori) | `src/crew/diario.njk` (generato dai diari con `crew: <nome>`) | `/crew/tmik/diario/` |
| PADD | `src/padd/index.njk` + `src/padd/<id>.html` | `/padd/`, `/padd/4a/` |
| Ship | `src/ship/index.html` | `/ship/` |
| Sito storico | `archive/1999/` | `/archive/1999/index.htm` |

I vecchi URL (`log_mission1_05.html`, `crew_tmik.html`, `padd_4a.html`, `old/…`, `images/…`) hanno un
redirect permanente in `vercel.json`.

## Numeri

- 95 diari/briefing in 9 missioni (M1-M7, SMC-UCSM, X01), 4 reunion, 54 fascicoli, 12 PADD.
- 0 collegamenti interni interrotti (`npm run check`); 5 link già rotti all'interno dell'archivio 1999.
- Testo: confronto parola per parola prima/dopo su tutte le pagine; le uniche differenze sono le
  correzioni volute elencate sotto.

## Cosa è cambiato

### Ripetizioni eliminate
- `<head>`, header, footer, breadcrumb e pulsanti avanti/indietro: un solo layout (`src/_includes/`).
  Header e footer sono inseriti in fase di build: niente più `fetch()`, nessun lampo all'apertura,
  funzionano anche senza server.
- Intestazione dei diari, miniatura, link alla scheda e **firma**: generate da `_data/roster.json`.
  Un diario tipico ha nel front matter solo `crew: <nome>`.
- Card degli indici missione, elenco del Log, indice equipaggio e bacheca PADD: generati dai dati,
  contatori ("ENTRIES", log in home) calcolati automaticamente.
- Colori di reparto: classi `.tone-*` al posto di centinaia di stili inline.

### Codice
- `script.js` → `src/assets/js/site.js`: rimossa la doppia evidenziazione del menu e la tripla
  animazione delle card; il cielo stellato si ferma quando la scheda non è visibile e rispetta
  "riduci movimento"; un'unica gestione delle immagini mancanti al posto dei ~100 `onerror` inline.
- `stylesheet.css` → 16 file in `src/_includes/css/` uniti in `/assets/css/site.css`; unificata la doppia
  definizione di `.diary-header`; font Google caricati con `<link>` + `preconnect` invece di `@import`.
- Rimossi i blocchi di codice commentato (restano nella cronologia Git).

### Correzioni
- Caratteri `�` ricostruiti: 18 nei diari, ~12.100 nell'archivio 1999 (che ora dichiara `charset=utf-8`).
- Refusi: "Comun iazioni", "Sezione >Operazioni", "Tetha Persei"; breadcrumb errato "Mission: 2" negli indici M4/M5.
- HTML non valido corretto in fase di migrazione (`</br>`, `</p>` orfani, `<span span>`, `<p><br /</p>`).
- Percorsi Windows `images\crew\…` (funzionavano solo in locale) e logo `l_ext.gif` → `l_ext.png`.
- Ritratti mancanti (rael, rogers, tanutri, miscia, santagata): segnaposto "FOTO" generato in build.
- Immagini più pesanti ricompresse (≈10,7 MB → 4,4 MB sui file interessati, stessi nomi).

### Uniformati (scelte da verificare)
- Intestazioni SMC: formato standard `REPARTO · sigla/ruolo · Rapporto`.
- Card degli indici missione: stesso nome dell'intestazione del diario.
- Contatore "Log di Missione" in home: numero reale di diari pubblicati (era "99 - UNDER UPDATING").
- Le card dei rapporti non ancora pubblicati sono ora visibilmente attenuate.

## Punti aperti

1. Ritratti mancanti: aggiungere `rael.jpg`, `rogers.jpg`, `tanutri.jpg`, `miscia.jpg`, `santagata.jpg`
   (e le miniature `_l`) in `src/assets/img/crew/`.
2. X01: briefing pubblicato, 9 rapporti in `pending` (missions.json).
3. Missione 8: elencata ma senza pagine.
4. Immagini presenti ma non usate: `afrodite_topview.jpg`, `afrodite_sideview.jpg`, `peppino.jpg`,
   `ateam*.gif`, `l_*.gif`, `l_piz.png`, `l_mus.png`, `crew/*.gif`, `padd/4i_7.jpg`.
5. Font Awesome è ancora caricato intero da CDN: si può ridurre alle sole icone usate.
6. Vercel: verificare al primo deploy che il progetto usi `vercel.json` (build `npm run build`, output `_site`).

## Regole da preservare

- Stile LCARS, variabili e componenti esistenti; nuovi colori come classi `.tone-*`.
- Un diario = un file; dati ripetuti nei file `_data/`, non nelle pagine.
- Nessuna card attiva per contenuti non pubblicati (usare `pending`).
- `archive/1999/` è l'archivio storico: non va modificato se non per correzioni di codifica.
