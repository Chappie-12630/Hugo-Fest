// app/api/send-invite/route.js
// API Route de Next.js para enviar invitaciones por Email (Resend) y/o WhatsApp (Twilio)
// Ruta: POST /api/send-invite

import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "https://hugo-fest.vercel.app";

// ── Genera el HTML del email ──────────────────────────────────────────────────
function buildEmailHTML({ name, table, guestId }) {
  const inviteUrl = `${BASE_URL}/invitado/${guestId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteUrl)}&color=C9A84C&bgcolor=080C12&margin=12`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitación — Hugo Monroy </title>
</head>
<body style="margin:0;padding:0;background:#07090E;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07090E;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Borde dorado superior -->
        <tr><td style="height:2px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></td></tr>

        <!-- Cuerpo principal -->
        <tr><td style="background:#0E1420;padding:48px 48px 40px;border-left:1px solid #1E2A3A;border-right:1px solid #1E2A3A;">

          <!-- Etiqueta -->
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#C9A84C;font-family:'Arial',sans-serif;font-weight:700;">
            Estás invitado a celebrar
          </p>

          <!-- Nombre del festejado -->
          <h1 style="margin:0 0 4px;font-size:38px;font-weight:300;color:#C9A84C;line-height:1.1;font-family:'Georgia',serif;">
            Hugo
          </h1>
          <h2 style="margin:0 0 32px;font-size:22px;font-weight:300;color:#4A5A70;letter-spacing:0.04em;font-family:'Georgia',serif;">
            Monroy
          </h2>

          <!-- Separador -->
          <div style="height:1px;background:linear-gradient(90deg,transparent,#C9A84C40,transparent);margin-bottom:32px;"></div>

          <!-- Saludo al invitado -->
          <p style="margin:0 0 8px;font-size:13px;color:#7A8BA0;font-family:'Arial',sans-serif;letter-spacing:0.05em;">
            PARA
          </p>
          <p style="margin:0 0 28px;font-size:22px;color:#D4DDE8;font-family:'Georgia',serif;font-weight:400;">
            ${name}
          </p>

          <!-- Mesa -->
          <p style="margin:0 0 36px;font-size:12px;color:#3D4F63;font-family:'Arial',sans-serif;letter-spacing:0.1em;">
            Mesa ${table} &nbsp;·&nbsp; Invitación personal e intransferible
          </p>

          <!-- Separador -->
          <div style="height:1px;background:linear-gradient(90deg,transparent,#C9A84C40,transparent);margin-bottom:36px;"></div>

          <!-- QR + instrucción -->
          <p style="margin:0 0 20px;font-size:11px;color:#5A6B80;font-family:'Arial',sans-serif;letter-spacing:0.12em;text-transform:uppercase;text-align:center;">
            Tu código de acceso
          </p>

          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#080C12;border:1px solid #1E2A3A;border-radius:12px;padding:20px;">
              <img src="${qrUrl}" width="180" height="180" alt="QR Invitación"
                style="display:block;border-radius:6px;" />
            </div>
          </div>

          <p style="margin:0 0 32px;font-size:12px;color:#3D4F63;font-family:'Arial',sans-serif;text-align:center;line-height:1.6;">
            Muestra este QR al llegar al evento para registrar tu entrada
          </p>

          <!-- Botón CTA -->
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${inviteUrl}"
              style="display:inline-block;padding:14px 40px;background:#C9A84C;color:#07090E;font-family:'Arial',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;border-radius:3px;">
              Ver mi invitación completa →
            </a>
          </div>

          <!-- Detalles evento -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr>
              <td width="33%" style="padding:16px;background:#080C12;border:1px solid #1E2A3A;border-radius:6px;text-align:center;">
                <p style="margin:0 0 6px;font-size:18px;">📅</p>
                <p style="margin:0 0 4px;font-size:9px;color:#C9A84C;letter-spacing:0.15em;text-transform:uppercase;font-family:'Arial',sans-serif;">Fecha</p>
                <p style="margin:0;font-size:13px;color:#D4DDE8;font-family:'Georgia',serif;">25 Julio 2026</p>
              </td>
              <td width="4px"></td>
              <td width="33%" style="padding:16px;background:#080C12;border:1px solid #1E2A3A;border-radius:6px;text-align:center;">
                <p style="margin:0 0 6px;font-size:18px;">🕗</p>
                <p style="margin:0 0 4px;font-size:9px;color:#C9A84C;letter-spacing:0.15em;text-transform:uppercase;font-family:'Arial',sans-serif;">Hora</p>
                <p style="margin:0;font-size:13px;color:#D4DDE8;font-family:'Georgia',serif;">Por confirmar</p>
              </td>
              <td width="4px"></td>
              <td width="33%" style="padding:16px;background:#080C12;border:1px solid #1E2A3A;border-radius:6px;text-align:center;">
                <p style="margin:0 0 6px;font-size:18px;">📍</p>
                <p style="margin:0 0 4px;font-size:9px;color:#C9A84C;letter-spacing:0.15em;text-transform:uppercase;font-family:'Arial',sans-serif;">Lugar</p>
                <p style="margin:0;font-size:13px;color:#D4DDE8;font-family:'Georgia',serif;">Por confirmar</p>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#080C12;border:1px solid #1E2A3A;border-top:none;padding:24px 48px;text-align:center;">
          <p style="margin:0 0 4px;font-size:18px;color:#C9A84C;font-family:'Georgia',serif;font-weight:300;">
            Hugo
          </p>
          <p style="margin:0;font-size:10px;color:#2A3A50;letter-spacing:0.18em;text-transform:uppercase;font-family:'Arial',sans-serif;">
            25 · Julio · 2026
          </p>
        </td></tr>

        <!-- Borde dorado inferior -->
        <tr><td style="height:2px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></td></tr>

        <!-- Nota legal -->
        <tr><td style="padding:20px;text-align:center;">
          <p style="margin:0;font-size:10px;color:#2A3A50;font-family:'Arial',sans-serif;line-height:1.6;">
            Esta invitación es personal e intransferible · Mesa ${table}<br/>
            Si tienes problemas para ver este correo,
            <a href="${inviteUrl}" style="color:#C9A84C;">haz clic aquí</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Mensaje de WhatsApp (texto plano) ─────────────────────────────────────────
function buildWhatsAppMessage({ name, table, guestId }) {
  const inviteUrl = `${BASE_URL}/invitado/${guestId}`;
  return `🎂 *¡Hola, ${name}!*

Estás invitado a celebrar el cumpleaños de *Hugo Monroy*.

📅 *Fecha:* 25 de Julio, 2026
🪑 *Mesa:* ${table}
📍 *Lugar:* Por confirmar

Tu invitación personal con código QR de entrada:
👉 ${inviteUrl}

_Muestra el QR al llegar para registrar tu entrada._

_Esta invitación es personal e intransferible._`;
}

// ── Enviar por Email (Resend) ──────────────────────────────────────────────────
async function sendEmail({ name, email, table, guestId }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "invitaciones@resend.dev",
      to: [email],
      subject: `🎂 Tu invitación — Fiesta de Hugo Monroy`,
      html: buildEmailHTML({ name, table, guestId }),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Resend error: ${err.message || res.status}`);
  }
  return await res.json();
}

// ── Enviar por WhatsApp (Twilio) ───────────────────────────────────────────────
async function sendWhatsApp({ name, phone, table, guestId }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

  const toNumber = phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;
  const message  = buildWhatsAppMessage({ name, table, guestId });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To:   toNumber,
        Body: message,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Twilio error: ${err.message || res.status}`);
  }
  return await res.json();
}

// ── Handler principal ─────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { guests, channels } = body;
    // guests: [{ id, name, email, phone, table }]
    // channels: ["email"] | ["whatsapp"] | ["email","whatsapp"]

    if (!guests?.length) {
      return NextResponse.json({ error: "No se proporcionaron invitados" }, { status: 400 });
    }
    if (!channels?.length) {
      return NextResponse.json({ error: "No se seleccionó ningún canal" }, { status: 400 });
    }

    const results = [];

    for (const guest of guests) {
      const result = { id: guest.id, name: guest.name, email: null, whatsapp: null };

      // Email
      if (channels.includes("email")) {
        if (!guest.email) {
          result.email = { success: false, error: "Sin email registrado" };
        } else {
          try {
            await sendEmail({ name: guest.name, email: guest.email, table: guest.table, guestId: guest.id });
            result.email = { success: true };
          } catch (e) {
            result.email = { success: false, error: e.message };
          }
        }
      }

      // WhatsApp
      if (channels.includes("whatsapp")) {
        if (!guest.phone) {
          result.whatsapp = { success: false, error: "Sin teléfono registrado" };
        } else {
          try {
            await sendWhatsApp({ name: guest.name, phone: guest.phone, table: guest.table, guestId: guest.id });
            result.whatsapp = { success: true };
          } catch (e) {
            result.whatsapp = { success: false, error: e.message };
          }
        }
      }

      results.push(result);

      // Pequeña pausa entre envíos para no saturar las APIs
      if (guests.length > 1) await new Promise(r => setTimeout(r, 300));
    }

    const successCount = results.filter(r =>
      (r.email?.success || !channels.includes("email")) &&
      (r.whatsapp?.success || !channels.includes("whatsapp"))
    ).length;

    return NextResponse.json({
      ok: true,
      sent: successCount,
      total: guests.length,
      results,
    });

  } catch (err) {
    console.error("Error en /api/send-invite:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
