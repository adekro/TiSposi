import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!,
  );

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const body = await request.json() as Record<string, unknown>;
    const publicId = typeof body.publicId === "string" ? body.publicId.trim().toLowerCase() : "";
    const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
    const attending = typeof body.attending === "boolean" ? body.attending : null;
    const numGuests = typeof body.numGuests === "number" ? Math.round(body.numGuests) : 1;
    const guestIdRaw = typeof body.guestId === "string" ? body.guestId.trim() : "";
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const guestId = uuid.test(guestIdRaw) ? guestIdRaw : null;
    const menuChoice = typeof body.menuChoice === "string" ? body.menuChoice.trim() || null : null;
    const dietaryRestrictions = typeof body.dietaryRestrictions === "string" ? body.dietaryRestrictions.trim() || null : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
    const arrivalMethod = ["auto", "treno", "aereo", "altro"].includes(String(body.arrivalMethod))
      ? String(body.arrivalMethod)
      : null;
    const needsParking = body.needsParking === true;
    const needsShuttle = body.needsShuttle === true;
    const needsAccommodation = body.needsAccommodation === true;
    const accommodationNotes = typeof body.accommodationNotes === "string" ? body.accommodationNotes.trim() || null : null;

    if (!publicId || !guestName || guestName.length > 200 || attending === null || numGuests < 1 || numGuests > 20) {
      return Response.json({ error: "Dati RSVP non validi." }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, owner_user_id")
      .eq("public_id", publicId)
      .maybeSingle();
    if (eventError) throw eventError;
    if (!event) return Response.json({ error: "Evento non trovato" }, { status: 404, headers: corsHeaders });

    if (guestId) {
      const { data: guest, error: guestError } = await supabase
        .from("guest_list")
        .select("id")
        .eq("id", guestId)
        .eq("event_id", event.id)
        .maybeSingle();
      if (guestError) throw guestError;
      if (!guest) return Response.json({ error: "Invitato non valido per questo evento." }, { status: 400, headers: corsHeaders });
    }

    const { error: insertError } = await supabase.from("rsvp_entries").insert({
      event_id: event.id,
      guest_name: guestName,
      attending,
      num_guests: attending ? numGuests : 0,
      menu_choice: attending ? menuChoice : null,
      dietary_restrictions: dietaryRestrictions,
      notes,
      guest_id: guestId,
      arrival_method: attending ? arrivalMethod : null,
      needs_parking: attending ? needsParking : false,
      needs_shuttle: attending ? needsShuttle : false,
      needs_accommodation: attending ? needsAccommodation : false,
      accommodation_notes: attending && needsAccommodation ? accommodationNotes : null,
    });
    if (insertError) throw insertError;

    if (guestId) {
      await supabase.from("guest_list").update({ rsvp_status: attending ? "confirmed" : "declined" }).eq("id", guestId).eq("event_id", event.id);
    }

    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY")?.trim();
      if (resendApiKey) {
        const { data: ownerData } = await supabase.auth.admin.getUserById(event.owner_user_id);
        const recipient = ownerData.user?.email;
        if (recipient) {
          const status = attending ? "Presente" : "Non presente";
          const timestamp = new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Rome" }).format(new Date());
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: Deno.env.get("RESEND_FROM")?.trim() || "TiSposi <onboarding@resend.dev>",
              to: [recipient],
              subject: `RSVP: ${guestName} — ${status}`,
              html: `<h1>Nuova conferma RSVP</h1><p><strong>Evento:</strong> ${escapeHtml(event.title)}</p><p><strong>Nome:</strong> ${escapeHtml(guestName)}</p><p><strong>Stato:</strong> ${status}</p><p><strong>Partecipanti:</strong> ${attending ? numGuests : 0}</p><p><strong>Note:</strong> ${escapeHtml(notes || "Nessuna nota")}</p><p><strong>Ricevuta il:</strong> ${timestamp}</p>`,
            }),
          });
          if (!response.ok) console.error("Resend error:", response.status);
        }
      }
    } catch (notificationError) {
      console.error("RSVP notification error:", notificationError);
    }

    return Response.json({ ok: true }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error("RSVP error:", error);
    return Response.json({ error: "Errore interno del server" }, { status: 500, headers: corsHeaders });
  }
});
