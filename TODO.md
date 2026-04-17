# TiSposi — Feature Roadmap

## ✅ Già implementato

- Galleria foto pubblica (upload, lightbox)
- Dediche testuali
- QR Code per condivisione galleria
- Dashboard sposi (configurazione evento)
- Auth (signup/login/reset password)
- PWA installabile
- Storage duale: Supabase DB o Google Drive

---

## 🚧 Fase 1 — Guest-facing (in corso)

- [x] **Countdown** al giorno del matrimonio (GalleryPage, client-side)
- [x] **Informazioni logistiche**: venue, indirizzo, Maps, dress code, programma della giornata
- [x] **Storia della coppia**: testo libero visualizzato nella gallery pubblica
- [x] **Menu matrimonio**: testo visualizzato nella gallery pubblica
- [x] **Richieste musicali**: form pubblico per gli ospiti → tabella `music_requests`
- [x] Nuovi campi nel form dashboard sposi
- [x] Migration SQL (`supabase/schema.sql`)

---

## ✅ Fase 2 — RSVP

- [x] Form RSVP pubblico su pagina dedicata `/:publicId/rsvp` (nome, presenza, n. persone, menu, intolleranze, note)
- [x] Tabella `rsvp_entries` su Supabase (event_id FK, RLS)
- [x] QR Code RSVP scaricabile dalla dashboard sposi
- [x] Dashboard sposi: tab RSVP con lista risposte e conteggi (tot. risposte, presenti + n. persone, assenti)
- [x] Export CSV degli RSVP

---

## 📋 Fase 3 — Wedding Planning (dashboard sposi)

- [x] **Checklist sposi** pre-popolata con scadenze (12 mesi → giorno del matrimonio)
- [x] **Lista invitati**: nome, email/tel, tavolo assegnato, stato RSVP
- [x] **Budget tracker**: voci per categoria (venue, catering, fiori…), previsto vs reale
- [x] **Gestione fornitori**: nome, categoria, contatti, stato pagamento/contratto

---

## ✅ Fase 4 — Platform

- [x] **Statistiche**: visite galleria, foto caricate, dediche, RSVP ricevuti, richieste musicali, invitati
- [x] **Export galleria**: download ZIP di tutte le foto (`GET /api/gallery-export` con JWT)
- [x] **Gestione Media**: eliminare singolarmente foto e dediche dalla dashboard sposi (`DELETE /api/delete-entry` con JWT)

---

## ✅ Fase 5 — Miglioramenti e Fix

- [x] **Export ZIP galleria — includi dediche**: aggiunto campo `author_name` opzionale alle dediche (schema SQL + DedicaDialog + upload API); `gallery-export.ts` genera `dediche.md` nello ZIP con testo, autore e data per ogni dedica (incluso per entrambi i provider storage).

- [x] **Homepage / Landing page**: hero text aggiornato, 9 feature card (Gallery, RSVP, Pagina evento, Lista invitati, Checklist, Budget, Fornitori, Statistiche, Gestione media).

- [x] **Pagine legali**: PrivacyPage e TerminiPage aggiornate con RSVP, lista invitati, fornitori, export dati; data aggiornata a 17 aprile 2026.

- [x] **Configurazione evento — pulizia UI**: rimosso pulsante "Apri gallery pubblica"; URL galleria e RSVP resi cliccabili come link; rimossa selezione provider Google Drive dall'interfaccia (backend Gdrive rimane funzionante).

- [x] **QR Code stabili — redirect per eventId**: nuovo endpoint `GET /api/event-redirect?eventId=` + componente `EventRedirectPage`; rotte `/e/:eventId` e `/e/:eventId/rsvp` in `App.tsx`; i QR code scaricati dalla dashboard usano ora l'URL stabile `/e/{eventId}` invece di `/{publicId}/gallery`.
