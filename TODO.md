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

---

## ✅ Fase 6 — Playlist pubblica nei Media

- [x] **Campo `approved`** su `music_requests` (migration SQL idempotente + index)
- [x] **GET `/api/music`**: restituisce solo canzoni con `approved = true`, ordinate per data; nessuna auth richiesta (pubblica)
- [x] **PATCH `/api/music-approve`**: nuovo endpoint; verifica JWT + ownership; imposta `approved = true` sulla richiesta musicale
- [x] **DELETE `/api/delete-entry?type=music`**: esteso con param `type=music` per cancellare da `music_requests` con check ownership
- [x] **`MusicRequest` interface** in `src/types.ts` (`id, song, artist, requestedBy, createdAt, approved`)
- [x] **Hook `useMusicRequests`**: `useQuery` con polling 30s su `GET /api/music?publicId=...` (solo canzoni approvate)
- [x] **Estensione `useDashboardGallery`**: fetch di tutte le richieste musicali (via Supabase client + RLS), `approveMusicEntry`, `deleteMusicEntry`
- [x] **Componente `PlaylistSection`**: lista card con canzone, artista, "suggerita da", link "Spotify" deep-link (`open.spotify.com/search/...`), empty state
- [x] **`GalleryPage`**: sezione "🎵 Playlist" sotto PhotoGrid con `PlaylistSection` (solo canzoni approvate); contatore Hero aggiornato
- [x] **`MediaTab`**: 3° sub-tab "Richieste" con `MusicCard` (badge "In playlist" se approved, pulsante "Aggiungi alla playlist" verde + "Elimina" rosso) e dialog conferma eliminazione

---

## ✅ Fase 7 — Menu strutturato a portate

- [x] **Schema SQL**: aggiunte colonne `menu_antipasto`, `menu_primo`, `menu_secondo`, `menu_contorno`, `menu_dolce`, `menu_bevande` (text) a `public.events` con migration idempotente; campo `menu` mantenuto per retrocompatibilità
- [x] **Dashboard sposi — form menu**: il campo testo unico `menu` sostituito con un template a portate (Antipasto, Primo piatto, Secondo piatto, Contorno, Dolce, Bevande e vini, Note); ciascuno con campo multiline dedicato
- [x] **GalleryPage — visualizzazione menu**: `WeddingInfoSection` mostra il menu come elenco di portate formattate per sezione; fallback al testo libero se le portate strutturate sono tutte vuote
- [x] **Migration SQL** idempotente (`alter table … add column if not exists`) per i nuovi campi

---

## ✅ Fase 8 — Info logistiche multi-luogo

- [x] **Schema SQL**: aggiungere campi dedicati per il luogo della cerimonia (`ceremony_venue_name`, `ceremony_venue_address`, `ceremony_venue_maps_url`, `ceremony_time`) e per il luogo del ricevimento (`reception_venue_name`, `reception_venue_address`, `reception_venue_maps_url`, `reception_time`), mantenendo i campi generici `venue_*` esistenti per retrocompatibilità
- [x] **Dashboard sposi — form logistica**: suddividere la sezione "Informazioni evento" in due schede/blocchi distinti: "Cerimonia" e "Ricevimento", ciascuno con nome luogo, indirizzo, link Maps e orario
- [x] **GalleryPage — visualizzazione logistica**: mostrare le due location come card/sezioni separate nell'`WeddingInfoSection`, con mappa/link dedicati per ciascuna; fallback al vecchio blocco generico "Location" per eventi già configurati con solo `venue_name`
- [x] **Migration SQL** per i nuovi campi

---

## 🔲 Fase 9 — Icona app

- [ ] **Cambio icona PWA / favicon**: sostituire le icone attuali in `public/icons/` con una nuova grafica (formato PNG, dimensioni 192×192 e 512×512 + favicon 32×32 e 180×180 per Apple); aggiornare `manifest.json` e `index.html` di conseguenza

---

## ✅ Fase 10 — Playlist nello ZIP di esportazione

- [x] **`gallery-export.ts` — includi `playlist.md`**: in fase di generazione ZIP leggere tutte le `music_requests` con `approved = true` relative all'evento; generare un file `playlist.md` con titolo, artista e "suggerita da" per ogni canzone approvata; aggiungere il file allo ZIP accanto alle foto e a `dediche.md`

---

## 🔲 Fase 11 — Gestione tavoli (dashboard sposi)

- [ ] **Schema SQL**: nuova tabella `tables` (`id`, `event_id FK`, `name`, `capacity`, `notes`); eventuale colonna `table_id FK` su `guest_list` per associare gli invitati al tavolo
- [ ] **Dashboard sposi — tab Tavoli** (o sezione interna a Lista Invitati): form per creare/rinominare/eliminare i tavoli (nome, capienza opzionale); vista a colonne o drag-and-drop per assegnare gli invitati ai tavoli; contatore posti per tavolo (assegnati / totale)
- [ ] **Filtro invitati per tavolo**: nella tab "Lista Invitati" aggiungere filtro per tavolo; export CSV aggiornato con colonna `tavolo`
- [ ] **Migration SQL** idempotente

---

## 🔲 Fase 12 — Attività e giochi (dashboard sposi)

- [ ] **Schema SQL**: nuova tabella `activities` (`id`, `event_id FK`, `title`, `description`, `materials`, `order`, `done`)
- [ ] **Dashboard sposi — tab Attività**: lista delle attività/giochi pianificate; form per aggiungere/modificare (titolo, descrizione, elenco materiali necessari, ordine); check-box "completata"; pulsante elimina con conferma
- [ ] **Visualizzazione materiali**: ogni attività mostra l'elenco dei materiali in una chip-list o elenco puntato; possibilità di stampare / esportare l'elenco completo dei materiali (tutti i giochi in un colpo)
- [ ] **Migration SQL** idempotente

---

## ✅ Fase 14 — Inviti via WhatsApp dalla lista invitati

- [x] **Schema SQL**: aggiunta colonna `guest_id` (UUID FK → `guest_list.id`, nullable) a `rsvp_entries`; migration idempotente (`ALTER TABLE … ADD COLUMN IF NOT EXISTS`)
- [x] **Link RSVP personalizzato**: ogni invitato ha un link RSVP nel formato `/{publicId}/rsvp?guest_id={guestListId}&name={encodedName}`; la pagina RSVP carica con il `name` pre-compilato (read-only) e passa il `guest_id` alla chiamata `POST /api/rsvp`
- [x] **`rsvp.ts` API**: accetta e salva il campo `guest_id` (UUID opzionale validato) in `rsvp_entries`; se valorizzato, aggiorna automaticamente `rsvp_status` dell'invitato in `guest_list` (`confirmed` se presente, `declined` se assente)
- [x] **GuestListTab — bottoni WhatsApp**: per ogni riga aggiunto **"Invia link RSVP"** (icona WhatsApp verde, apre `wa.me/?text=...` con link personalizzato) e **"Invia link Galleria"** (icona galleria, apre `wa.me/?text=...`); link pre-codificati con `encodeURIComponent`

---

## 🔲 Fase 13 — Logistica ospiti nel RSVP

- [ ] **Schema SQL**: aggiungere colonne alla tabella `rsvp_entries`: `arrival_method` (enum o testo: auto, treno, aereo, altro), `needs_parking` (boolean), `needs_shuttle` (boolean), `needs_accommodation` (boolean), `accommodation_notes` (testo libero)
- [ ] **Form RSVP pubblico — sezione Logistica**: nuova sezione opzionale "Come arrivi?" con campi: mezzo di trasporto (radio/select), casella "Ho bisogno di un posto auto", casella "Ho bisogno della navetta", casella "Ho bisogno di un alloggio" + note libere; i campi appaiono solo se l'ospite conferma la presenza
- [ ] **Dashboard sposi — resoconto logistica**: nella tab RSVP aggiungere una vista "Logistica" con contatori aggregati (quanti arrivano in auto / treno / aereo, quanti chiedono parcheggio, quanti navetta, quanti alloggio) e lista dettaglio per ciascun ospite con la relativa richiesta
- [ ] **Export CSV RSVP**: aggiornare le colonne con i nuovi campi logistici
- [ ] **Migration SQL** idempotente
