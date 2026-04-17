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

## 📋 Fase 2 — RSVP

- [ ] Form RSVP pubblico (nome, presenti Sì/No, numero persone, menu, intolleranze, note)
- [ ] Tabella `rsvp_entries` su Supabase (event_id FK, RLS)
- [ ] Dashboard sposi: lista RSVP con conteggi (tot. presenti, preferenze menu)
- [ ] Export CSV degli RSVP

---

## 📋 Fase 3 — Wedding Planning (dashboard sposi)

- [ ] **Checklist sposi** pre-popolata con scadenze (12 mesi → giorno del matrimonio)
- [ ] **Lista invitati**: nome, email/tel, tavolo assegnato, stato RSVP
- [ ] **Budget tracker**: voci per categoria (venue, catering, fiori…), previsto vs reale
- [ ] **Gestione fornitori**: nome, categoria, contatti, stato pagamento/contratto

---

## 📋 Fase 4 — Platform

- [ ] **Notifiche email** (Resend): nuova foto, nuovo RSVP, nuova dedica → email agli sposi
- [ ] **Statistiche**: visite galleria, foto caricate, RSVP ricevuti
- [ ] **Export galleria**: download ZIP di tutte le foto
- [ ] **Multi-evento**: più matrimoni per account (rimuovere `UNIQUE(owner_user_id)`)
