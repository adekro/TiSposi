import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEventByPublicId } from "./_lib/events.js";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const publicId =
    typeof req.query.publicId === "string" ? req.query.publicId : "";
  if (!publicId.trim()) {
    return res.status(400).json({ error: "Parametro publicId mancante" });
  }

  try {
    const event = await getEventByPublicId(publicId);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    const body = req.body as Record<string, unknown>;

    const guestName =
      typeof body?.guestName === "string" ? body.guestName.trim() : "";
    const attending =
      typeof body?.attending === "boolean" ? body.attending : null;
    const numGuests =
      typeof body?.numGuests === "number" ? Math.round(body.numGuests) : 1;
    const menuChoice =
      typeof body?.menuChoice === "string" ? body.menuChoice.trim() : null;
    const dietaryRestrictions =
      typeof body?.dietaryRestrictions === "string"
        ? body.dietaryRestrictions.trim()
        : null;
    const notes =
      typeof body?.notes === "string" ? body.notes.trim() : null;
    const guestIdRaw =
      typeof body?.guestId === "string" ? body.guestId.trim() : null;
    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const guestId =
      guestIdRaw && UUID_RE.test(guestIdRaw) ? guestIdRaw : null;

    const ARRIVAL_METHODS = ["auto", "treno", "aereo", "altro"] as const;
    type ArrivalMethod = typeof ARRIVAL_METHODS[number];
    const arrivalMethodRaw =
      typeof body?.arrivalMethod === "string" ? body.arrivalMethod.trim() : null;
    const arrivalMethod: ArrivalMethod | null =
      arrivalMethodRaw && (ARRIVAL_METHODS as readonly string[]).includes(arrivalMethodRaw)
        ? (arrivalMethodRaw as ArrivalMethod)
        : null;
    const needsParking =
      typeof body?.needsParking === "boolean" ? body.needsParking : false;
    const needsShuttle =
      typeof body?.needsShuttle === "boolean" ? body.needsShuttle : false;
    const needsAccommodation =
      typeof body?.needsAccommodation === "boolean" ? body.needsAccommodation : false;
    const accommodationNotes =
      typeof body?.accommodationNotes === "string"
        ? body.accommodationNotes.trim()
        : null;

    if (!guestName || guestName.length < 1 || guestName.length > 200) {
      return res
        .status(400)
        .json({ error: "Il nome è obbligatorio (max 200 caratteri)." });
    }

    if (attending === null) {
      return res
        .status(400)
        .json({ error: "La conferma di presenza è obbligatoria." });
    }

    if (numGuests < 1 || numGuests > 20) {
      return res
        .status(400)
        .json({ error: "Il numero di persone deve essere tra 1 e 20." });
    }

    if (menuChoice && menuChoice.length > 200) {
      return res
        .status(400)
        .json({ error: "La scelta menu non può superare 200 caratteri." });
    }

    if (dietaryRestrictions && dietaryRestrictions.length > 1000) {
      return res
        .status(400)
        .json({ error: "Le intolleranze non possono superare 1000 caratteri." });
    }

    if (notes && notes.length > 1000) {
      return res
        .status(400)
        .json({ error: "Le note non possono superare 1000 caratteri." });
    }

    if (accommodationNotes && accommodationNotes.length > 500) {
      return res
        .status(400)
        .json({ error: "Le note alloggio non possono superare 500 caratteri." });
    }

    const supabase = getServiceSupabaseClient();
    const { error: insertError } = await supabase.from("rsvp_entries").insert({
      event_id: event.id,
      guest_name: guestName,
      attending,
      num_guests: attending ? numGuests : 0,
      menu_choice: attending && menuChoice ? menuChoice : null,
      dietary_restrictions: dietaryRestrictions || null,
      notes: notes || null,
      guest_id: guestId || null,
      arrival_method: attending ? arrivalMethod : null,
      needs_parking: attending ? needsParking : false,
      needs_shuttle: attending ? needsShuttle : false,
      needs_accommodation: attending ? needsAccommodation : false,
      accommodation_notes: attending && needsAccommodation ? accommodationNotes : null,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Se il link RSVP era personalizzato, aggiorna lo stato dell'invitato
    if (guestId) {
      await supabase
        .from("guest_list")
        .update({ rsvp_status: attending ? "confirmed" : "declined" })
        .eq("id", guestId);
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("[rsvp] Errore:", err);
    return res.status(500).json({ error: "Errore interno del server" });
  }
}
