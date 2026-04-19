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

## ✅ Fase 11 — Gestione tavoli (dashboard sposi)

- [x] **Schema SQL**: nuova tabella `tables` (`id`, `event_id FK`, `name`, `capacity int nullable`, `notes`, `order`, `created_at`); indice su `(event_id, "order", name)`; RLS policy "Owners can manage tables" (stesso pattern degli altri); migration `ALTER TABLE guest_list ADD COLUMN IF NOT EXISTS table_id uuid REFERENCES public.tables(id) ON DELETE SET NULL`
- [x] **Dashboard sposi — sotto-tab "Tavoli"** dentro la tab "Invitati": sotto-tab "Lista" e "Tavoli" (stesso pattern di RSVP → Risposte/Logistica); form dialog per creare/rinominare/eliminare i tavoli (nome obbligatorio, capienza opzionale, note); vista a colonne con card per ogni tavolo (nome, chip `assegnati / capienza`, lista ospiti con ✕ per rimuovere, bottone "Aggiungi ospite"); card "Senza tavolo" con bottone assegna inline per ogni ospite non assegnato; dialog conferma eliminazione tavolo
- [x] **Assegnazione ospiti — doppio percorso**: select "Tavolo" nel dialog Add/Edit ospite (dropdown con nomi dei tavoli, se presenti; fallback al campo testo libero se non ci sono tavoli strutturati); vista colonne nel sotto-tab Tavoli con assign/unassign in tempo reale
- [x] **Filtro invitati per tavolo**: nella sotto-tab "Lista" aggiunto Select filtro (Tutti / Senza tavolo / per tavolo specifico); export CSV aggiornato con colonna "Tavolo" basata su `table_id` → nome tavolo (con fallback a `table_number` legacy)
- [x] **`TableEntry` e `TableFormData`** in `src/types.ts`; `GuestEntry.table_id: string | null` aggiunto; nuovi `src/hooks/useTables.ts` e `src/components/TablesTab.tsx`
- [x] **Migration SQL** idempotente

---

## ✅ Fase 12 — Attività e giochi (dashboard sposi)

- [x] **Schema SQL**: nuova tabella `activities` (`id`, `event_id FK`, `title`, `description`, `materials`, `order`, `done`, `created_at`); indice su `(event_id, "order", created_at)`; RLS policy `"Owners can manage activities"` (stesso pattern degli altri tavoli); migration idempotente con `CREATE TABLE IF NOT EXISTS` e `DROP POLICY IF EXISTS`
- [x] **Dashboard sposi — tab Attività**: lista card con checkbox "completata" (strikethrough sul titolo), chip-list dei materiali per ogni attività; form dialog Add/Edit (titolo obbligatorio, descrizione, materiali textarea, ordine); bottoni ▲/▼ per il riordino (swap `order` tra record adiacenti); pulsante "Elimina" con dialog di conferma
- [x] **Visualizzazione materiali**: ogni attività mostra l'elenco dei materiali come chip-list (split su newline e virgola); accordion in fondo alla tab con riepilogo materiali aggregato per tutte le attività + pulsante "Stampa" (`window.print()`) e "Esporta TXT" (download blob)
- [x] **Migration SQL** idempotente

---

## ✅ Fase 14 — Inviti via WhatsApp dalla lista invitati

- [x] **Schema SQL**: aggiunta colonna `guest_id` (UUID FK → `guest_list.id`, nullable) a `rsvp_entries`; migration idempotente (`ALTER TABLE … ADD COLUMN IF NOT EXISTS`)
- [x] **Link RSVP personalizzato**: ogni invitato ha un link RSVP nel formato `/{publicId}/rsvp?guest_id={guestListId}&name={encodedName}`; la pagina RSVP carica con il `name` pre-compilato (read-only) e passa il `guest_id` alla chiamata `POST /api/rsvp`
- [x] **`rsvp.ts` API**: accetta e salva il campo `guest_id` (UUID opzionale validato) in `rsvp_entries`; se valorizzato, aggiorna automaticamente `rsvp_status` dell'invitato in `guest_list` (`confirmed` se presente, `declined` se assente)
- [x] **GuestListTab — bottoni WhatsApp**: per ogni riga aggiunto **"Invia link RSVP"** (icona WhatsApp verde, apre `wa.me/?text=...` con link personalizzato) e **"Invia link Galleria"** (icona galleria, apre `wa.me/?text=...`); link pre-codificati con `encodeURIComponent`

---

## ✅ Fase 16 — Modifica RSVP dalla scheda invitati

- [x] **Tipo `RsvpFormData`** in `src/types.ts`: `Omit<RsvpEntry, "id" | "event_id" | "guest_id" | "created_at">` — include tutti i campi editabili (presenza, n. persone, menu, intolleranze, note, logistica Fase 13)
- [x] **Migration RLS** in `supabase/schema.sql`: policy idempotente `"Owners can manage rsvp entries"` (`for all` su `rsvp_entries`) — sblocca INSERT e UPDATE dal client autenticato (in precedenza solo SELECT era permesso)
- [x] **`upsertRsvp(guestId, data)`** in `src/hooks/useGuestList.ts`: se esiste `rsvpByGuestId[guestId]` fa UPDATE, altrimenti `resolveEventId()` + INSERT; aggiorna `rsvpByGuestId` nello stato; chiama `updateGuest` per sincronizzare `guest_list.rsvp_status` (`confirmed` / `declined`)
- [x] **Dialog "RSVP"** in `GuestListTab.tsx`: campi Presenza (Switch), N. persone, Menu, Intolleranze, Note; sezione Logistica condizionale (Mezzo di trasporto RadioGroup, Parcheggio/Navetta/Alloggio Checkbox, Note alloggio condizionale); `attending = false` resetta automaticamente la logistica; pulsante "Aggiungi RSVP" (grigio) o "Modifica RSVP" (verde) nella colonna Azioni per ogni ospite; bottone "Modifica RSVP" anche nella riga espansa
- [x] **Riga espansa aggiornata**: mostra i nuovi campi logistica (arrivo, chip parcheggio/navetta/alloggio, note alloggio)

---

## ✅ Fase 15 — Pannello admin (solo e.croce88@gmail.com)

- [x] **Riconoscimento admin**: all'avvio dell'app, se `user.email === "e.croce88@gmail.com"` viene visualizzato un banner/sezione "Admin" nella dashboard (non visibile ad altri utenti); nessuna tabella extra necessaria, la verifica è puramente client-side sul campo email dell'utente autenticato
- [x] **Lista utenti attivi**: la sezione admin mostra una tabella con tutti gli eventi (e i relativi owner) senza filtro per `owner_user_id`; colonne: email proprietario, nome evento, sposi, data matrimonio, data creazione; dati caricati con una query Supabase senza RLS tramite la service-role key (API route dedicata `GET /api/admin/events` con verifica email admin lato server)
- [x] **Impersonazione**: ogni riga ha un bottone "Gestisci" che imposta `impersonatedUserId` nel contesto (`AuthContext`); tutti gli hook ricevono `effectiveUserId` (`impersonatedUserId ?? user?.id`) al posto dell'id reale; banner persistente in alto ("Stai gestendo: {email}") con tasto "Torna al tuo account"
- [x] **Protezione API**: `GET /api/admin/events` verifica che il JWT nel header appartenga a `e.croce88@gmail.com` prima di rispondere (401 senza token, 403 per non-admin); restituisce la lista completa degli eventi con email owner

---

## ✅ Fase 13 — Logistica ospiti nel RSVP

- [x] **Schema SQL**: aggiunto `arrival_method` (testo con check `IN ('auto','treno','aereo','altro')`), `needs_parking`, `needs_shuttle`, `needs_accommodation` (boolean `DEFAULT false`), `accommodation_notes` (testo libero) a `rsvp_entries`; migration idempotente (`ADD COLUMN IF NOT EXISTS`)
- [x] **Form RSVP pubblico — sezione Logistica**: nuova sezione "Come arrivi?" visibile solo se l'ospite conferma la presenza; RadioGroup per il mezzo di trasporto, 3 Checkbox (parcheggio, navetta, alloggio), TextField note alloggio (condizionale a `needsAccommodation`); reset automatico dei campi se l'ospite cambia la risposta a "No"
- [x] **Dashboard sposi — resoconto logistica**: nella tab RSVP aggiunti due sotto-tab "Risposte" (tabella attuale invariata) e "Logistica" con Chips aggregate per mezzo/parcheggio/navetta/alloggio e tabella dettaglio ospiti presenti
- [x] **Export CSV RSVP**: aggiornate le colonne con i nuovi campi (Mezzo di trasporto, Parcheggio, Navetta, Alloggio, Note alloggio)
- [x] **Migration SQL** idempotente

---

## 🔲 Fase 17 — Schema SQL sito ospite

Aggiungere i nuovi campi e tabelle necessari al sito ospite, senza toccare ancora il frontend.

- [ ] **Migration idempotente su `events`**:
  - `ALTER TABLE public.events ADD COLUMN IF NOT EXISTS landing_bg_url text`
  - `ALTER TABLE public.events ADD COLUMN IF NOT EXISTS wedding_list_description text`
- [ ] **Nuova tabella `wedding_list_items`**: `id uuid PK`, `event_id uuid FK → events(id) ON DELETE CASCADE`, `title text NOT NULL`, `description text`, `url text NOT NULL`, `"order" int NOT NULL DEFAULT 0`, `created_at timestamptz NOT NULL DEFAULT now()`; index su `(event_id, "order", created_at)`
- [ ] **RLS** su `wedding_list_items`: policy `"Owners can manage wedding list items"` (`for all` con `owner_user_id` check, stesso pattern degli altri)
- [ ] **Aggiornare `supabase/schema.sql`** con le migration idempotenti

---

## 🔲 Fase 18 — Pagina Landing ospite (`/:publicId/landing`)

Nuova pagina pubblica di benvenuto; nessuna modifica alla dashboard in questa fase.

- [ ] **`src/pages/GuestLandingPage.tsx`**: carica l'evento via `publicId` (stesso pattern di `GalleryPage`); mostra intestazione "Benvenuti" con nome sposi e data matrimonio; immagine di sfondo da `landing_bg_url` (con fallback a gradiente tema); overlay semi-trasparente per leggibilità
- [ ] **Navigazione**: pulsanti/link verso `/:publicId/gallery`, `/:publicId/rsvp`, `/:publicId/listanozze`
- [ ] **Rotta** `/:publicId/landing` in `App.tsx`
- [ ] **`/e/:eventId/landing`** — redirect stabile via `EventRedirectPage` (stesso pattern `/e/:eventId`)

---

## 🔲 Fase 19 — Dashboard: configurazione landing bg

Aggiungere alla dashboard sposi il campo per l'immagine di sfondo della landing.

- [ ] **`EventSettingsForm.tsx`**: nuova sezione "Pagina di benvenuto ospiti"; campo URL testuale `landing_bg_url` con anteprima miniatura (`<img>` condizionale sotto il campo); salvataggio tramite `useEventSettings` (già gestisce update generici)
- [ ] **`useEventSettings`** / tipi: aggiungere `landing_bg_url` all'interfaccia `EventSettings` / `EventFormData`

---

## 🔲 Fase 20 — Lista nozze: schema lato backend e hook

Creare hook e API per la gestione degli item della lista nozze (solo logica dati, nessuna UI pubblica ancora).

- [ ] **`WeddingListItem` e `WeddingListFormData`** in `src/types.ts`
- [ ] **`src/hooks/useWeddingList.ts`**: `useQuery` su `wedding_list_items` filtrato per `event_id`; mutation `addItem`, `updateItem`, `deleteItem`, `reorderItem` (swap `order` tra adiacenti); stesso pattern di `useTables`

---

## 🔲 Fase 21 — Dashboard: gestione lista nozze

Nuova tab nella dashboard sposi per gestire gli item della lista nozze.

- [ ] **`src/components/WeddingListTab.tsx`**: lista card con titolo, descrizione, URL (link esterno), pulsanti ▲/▼ riordino; form dialog Add/Edit (titolo obbligatorio, descrizione, URL obbligatorio); dialog conferma eliminazione
- [ ] **`DashboardPage.tsx`**: aggiungere tab "Lista Nozze" con `<WeddingListTab />`
- [ ] **`EventSettingsForm.tsx`**: aggiungere campo `wedding_list_description` (multiline) nella sezione "Lista Nozze"

---

## 🔲 Fase 22 — Pagina Lista Nozze ospite (`/:publicId/listanozze`)

Nuova pagina pubblica con la lista nozze; richiede Fase 20 completata.

- [ ] **`src/pages/GuestWeddingListPage.tsx`**: carica evento + items tramite `useWeddingList(publicId)`; mostra descrizione testuale degli sposi; griglia di card cliccabili (titolo, descrizione, pulsante "Scopri" che apre l'URL in `_blank`); empty state se lista vuota
- [ ] **Rotta** `/:publicId/listanozze` in `App.tsx`
- [ ] **`/e/:eventId/listanozze`** — redirect stabile via `EventRedirectPage`

---

## 🔲 Fase 23 — Layout condiviso sito ospite

Unificare le pagine ospite con una navigation bar comune.

- [ ] **`src/components/Guestnavbar.tsx`**: `AppBar` leggero (logo TiSposi + link `Landing`, `Galleria`, `RSVP`, `Lista Nozze`); link attivi evidenziati; link assenti se la pagina corrispondente non ha dati (es. lista nozze vuota)
- [ ] **Adottare `GuestNavbar`** in `GuestLandingPage`, `GalleryPage`, `RsvpPage`, `GuestWeddingListPage`
- [ ] Verificare che le rotte `/e/:eventId/*` coprano tutte le nuove pagine del sito ospite
