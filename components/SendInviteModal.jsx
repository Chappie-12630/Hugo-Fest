"use client";
// components/SendInviteModal.jsx
// Modal para elegir canal y enviar invitación(es)

import { useState } from "react";

const C = {
  bg: "#080C12", surface: "#0E1420", surfaceAlt: "#131B28",
  border: "#1E2A3A", gold: "#C9A84C", goldLight: "#E8C97A",
  text: "#E8EDF5", textMuted: "#7A8BA0", textDim: "#3D4F63",
  green: "#2ECC8A", greenDim: "#0D3D28",
  red: "#E05555", redDim: "#2A0A0A",
  amber: "#E0A855",
};

// ── Canal toggle button ───────────────────────────────────────────────────────
function ChannelToggle({ id, emoji, label, desc, selected, onToggle }) {
  return (
    <div onClick={() => onToggle(id)} style={{
      display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px",
      borderRadius: 10, cursor: "pointer",
      background: selected ? C.gold + "12" : C.surfaceAlt,
      border: `2px solid ${selected ? C.gold : C.border}`,
      transition: "all 0.2s",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: selected ? C.gold + "25" : C.border + "40",
        border: `1px solid ${selected ? C.gold + "60" : C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, transition: "all 0.2s",
      }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700,
          color: selected ? C.goldLight : C.text, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{desc}</div>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
        border: `2px solid ${selected ? C.gold : C.textDim}`,
        background: selected ? C.gold : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.bg }} />}
      </div>
    </div>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────
function ResultRow({ result, channels }) {
  const emailOk  = !channels.includes("email")    || result.email?.success;
  const waOk     = !channels.includes("whatsapp") || result.whatsapp?.success;
  const allOk    = emailOk && waOk;

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 14px", borderRadius: 8, marginBottom: 6,
      background: allOk ? C.greenDim : C.redDim,
      border: `1px solid ${allOk ? C.green + "30" : C.red + "30"}`,
    }}>
      <div style={{ fontSize: 13, color: allOk ? C.green : C.text, fontWeight: 500 }}>
        {result.name}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {channels.includes("email") && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
            background: result.email?.success ? C.green + "20" : C.red + "20",
            color: result.email?.success ? C.green : C.red,
            border: `1px solid ${result.email?.success ? C.green + "40" : C.red + "40"}`,
          }}>
            📧 {result.email?.success ? "enviado" : result.email?.error || "error"}
          </span>
        )}
        {channels.includes("whatsapp") && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
            background: result.whatsapp?.success ? C.green + "20" : C.red + "20",
            color: result.whatsapp?.success ? C.green : C.red,
            border: `1px solid ${result.whatsapp?.success ? C.green + "40" : C.red + "40"}`,
          }}>
            💬 {result.whatsapp?.success ? "enviado" : result.whatsapp?.error || "error"}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
// Props:
//   guests   → array de invitados a enviar (1 o todos)
//   onClose  → función para cerrar
export default function SendInviteModal({ guests, onClose }) {
  const [channels,  setChannels]  = useState(["email"]);
  const [status,    setStatus]    = useState("idle"); // idle | sending | done | error
  const [results,   setResults]   = useState([]);
  const [progress,  setProgress]  = useState(0);
  const [summary,   setSummary]   = useState(null);

  const isBulk = guests.length > 1;

  function toggleChannel(ch) {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  }

  async function handleSend() {
    if (!channels.length) return;
    setStatus("sending");
    setProgress(0);

    try {
      const res = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests, channels }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error desconocido");

      setResults(data.results || []);
      setSummary({ sent: data.sent, total: data.total });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setSummary({ error: err.message });
    }
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#000000D0", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(500px, 100%)", maxHeight: "90vh", overflowY: "auto",
        background: C.surface, border: `1px solid #3D2E10`,
        borderRadius: 16, padding: 32,
      }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>
            Enviar invitación{isBulk ? "es" : ""}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text,
            fontFamily: "Georgia, serif", marginBottom: 4 }}>
            {isBulk ? `${guests.length} invitados seleccionados` : guests[0]?.name}
          </div>
          {!isBulk && (
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Mesa {guests[0]?.table} · {guests[0]?.email || "Sin email"} · {guests[0]?.phone || "Sin teléfono"}
            </div>
          )}
        </div>

        {/* Estado: selección de canal */}
        {status === "idle" && (
          <>
            <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
              Elige el canal de envío
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              <ChannelToggle
                id="email" emoji="📧" label="Email"
                desc={isBulk ? "Envía a todos los que tienen email registrado" : (guests[0]?.email || "Sin email registrado")}
                selected={channels.includes("email")}
                onToggle={toggleChannel}
              />
              <ChannelToggle
                id="whatsapp" emoji="💬" label="WhatsApp"
                desc={isBulk ? "Envía a todos los que tienen teléfono registrado" : (guests[0]?.phone || "Sin teléfono registrado")}
                selected={channels.includes("whatsapp")}
                onToggle={toggleChannel}
              />
            </div>

            {/* Previsualización del mensaje */}
            {channels.includes("whatsapp") && (
              <div style={{
                padding: "14px 16px", borderRadius: 8, marginBottom: 24,
                background: C.surfaceAlt, border: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.12em",
                  textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
                  Vista previa WhatsApp
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7,
                  fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
{`🎂 *¡Hola, ${isBulk ? "[Nombre]" : guests[0]?.name}!*

Estás invitado a celebrar el cumpleaños de *José Carlos Hernández García*.

📅 *Fecha:* 25 de Julio, 2026
🪑 *Mesa:* ${isBulk ? "[Mesa]" : guests[0]?.table}

Tu invitación con QR:
👉 fiesta-jose-carlos.vercel.app/invitado/[ID]`}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: "12px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: "transparent",
                color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>Cancelar</button>
              <button onClick={handleSend} disabled={!channels.length} style={{
                flex: 2, padding: "12px", borderRadius: 8, border: "none",
                background: channels.length ? `linear-gradient(135deg, ${C.gold}, #A88030)` : C.border,
                color: channels.length ? C.bg : C.textDim,
                fontSize: 13, fontWeight: 700, cursor: channels.length ? "pointer" : "default",
                letterSpacing: "0.08em", transition: "all 0.2s",
              }}>
                Enviar {isBulk ? `a ${guests.length} invitados` : "invitación"} →
              </button>
            </div>
          </>
        )}

        {/* Estado: enviando */}
        {status === "sending" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 20,
              animation: "spin 1.5s linear infinite", display: "inline-block" }}>⟳</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8,
              fontFamily: "Georgia, serif" }}>
              Enviando invitaciones...
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Esto puede tomar unos segundos
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Estado: completado */}
        {status === "done" && summary && (
          <>
            <div style={{
              textAlign: "center", padding: "20px 0 24px",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
                {summary.sent === summary.total ? "🎉" : "⚠️"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6,
                fontFamily: "Georgia, serif",
                color: summary.sent === summary.total ? C.green : C.amber }}>
                {summary.sent === summary.total
                  ? "¡Todas enviadas!"
                  : `${summary.sent} de ${summary.total} enviadas`}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                {summary.sent} enviadas · {summary.total - summary.sent} con error
              </div>
            </div>

            {/* Resultados detallados */}
            <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 20 }}>
              {results.map((r, i) => (
                <ResultRow key={i} result={r} channels={channels} />
              ))}
            </div>

            <button onClick={onClose} style={{
              width: "100%", padding: "12px", borderRadius: 8, border: "none",
              background: C.gold, color: C.bg,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>Cerrar</button>
          </>
        )}

        {/* Estado: error global */}
        {status === "error" && summary && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>❌</div>
            <div style={{ fontSize: 15, color: C.red, fontWeight: 600, marginBottom: 8 }}>
              Error al enviar
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24,
              fontFamily: "monospace", background: C.bg, padding: "10px 14px",
              borderRadius: 6, lineHeight: 1.6 }}>
              {summary.error}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStatus("idle")} style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: "transparent",
                color: C.textMuted, fontSize: 13, cursor: "pointer",
              }}>Reintentar</button>
              <button onClick={onClose} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: C.gold, color: C.bg, fontSize: 13,
                fontWeight: 700, cursor: "pointer",
              }}>Cerrar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
