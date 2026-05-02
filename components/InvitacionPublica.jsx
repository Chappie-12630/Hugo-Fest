"use client";
// components/InvitacionPublica.jsx — Página del invitado · Hugo Fest 🎰

import { useState, useEffect, useRef } from "react";
import { getGuest, updateRSVP }        from "../lib/guests";

// ─── Constantes del evento ────────────────────────────────────────────────────
const EVENT = {
  name:     "Hugo Fest",
  person:   "Hugo Monroy",
  date:     "20 de Julio, 2026",
  time:     "5:00 PM",
  location: "Por confirmar",
  target:   new Date("2026-07-20T17:00:00"),
};

// ─── Paleta: Negro · Rojo · Dorado (extraída del PDF) ───────────────────────
const C = {
  bg:          "#07090E",
  surface:     "#0D1018",
  surfaceAlt:  "#141920",
  border:      "#1C2330",
  gold:        "#C9A84C",
  goldLight:   "#E8C97A",
  goldDim:     "#7A6020",
  red:         "#8A0000",
  redLight:    "#B22222",
  text:        "#EEF2FA",
  textMuted:   "#7A8BA0",
  textDim:     "#3A4A5C",
  green:       "#2ECC8A",
  white:       "#FFFFFF",
};

// ─── Contador regresivo ───────────────────────────────────────────────────────
function useCountdown() {
  const [diff, setDiff] = useState(EVENT.target - new Date());
  useEffect(() => {
    const id = setInterval(() => setDiff(EVENT.target - new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, over:true };
  const s  = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    over:    false,
  };
}

// ─── Unidad del contador ──────────────────────────────────────────────────────
function CountUnit({ value, label }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      minWidth: 64,
    }}>
      <div style={{
        background: "#0A0E15",
        border: `1px solid ${C.gold}40`,
        borderRadius: 10,
        padding: "10px 14px",
        minWidth: 64,
        textAlign: "center",
        boxShadow: `0 0 18px ${C.gold}12`,
        position: "relative", overflow: "hidden",
      }}>
        {/* línea divisora tipo flip-clock */}
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0,
          height: 1, background: C.gold + "20" }} />
        <span style={{
          fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
          fontWeight: 700, color: C.gold,
          fontFamily: "'Cormorant Garamond', serif",
          lineHeight: 1, display: "block",
        }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <div style={{
        fontSize: "0.6rem", color: C.textDim, marginTop: 7,
        letterSpacing: "0.18em", textTransform: "uppercase",
      }}>{label}</div>
    </div>
  );
}

// ─── Botón RSVP ───────────────────────────────────────────────────────────────
function RSVPButtons({ guestId, current, onDone }) {
  const [saving, setSaving] = useState(null);

  async function respond(val) {
    setSaving(val);
    await updateRSVP(guestId, val);
    setSaving(null);
    onDone(val);
  }

  if (current === "confirmed") return (
    <div style={{
      padding: "14px 20px", borderRadius: 10,
      background: C.green + "15", border: `1px solid ${C.green}40`,
      textAlign: "center",
    }}>
      <span style={{ fontSize: "1.4rem" }}>🎉</span>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 4 }}>
        ¡Asistencia confirmada!
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
        Muestra tu QR en la entrada. Te esperamos.
      </div>
    </div>
  );

  if (current === "declined") return (
    <div style={{
      padding: "14px 20px", borderRadius: 10,
      background: "#2A0A0A", border: "1px solid #E0555520",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 12, color: "#E05555" }}>
        Has declinado la invitación. Si cambiaste de opinión, contáctanos.
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
      <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: "0.12em",
        textTransform: "uppercase", textAlign: "center", marginBottom: 4 }}>
        ¿Confirmas tu asistencia?
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          disabled={!!saving}
          onClick={() => respond("confirmed")}
          style={{
            flex: 1, padding: "13px", borderRadius: 10, border: "none",
            background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
            color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer",
            letterSpacing: "0.06em", opacity: saving === "confirmed" ? 0.7 : 1,
            transition: "all 0.2s", boxShadow: `0 4px 20px ${C.red}50`,
          }}>
          {saving === "confirmed" ? "Guardando..." : "✅ Confirmo"}
        </button>
        <button
          disabled={!!saving}
          onClick={() => respond("declined")}
          style={{
            padding: "13px 18px", borderRadius: 10,
            border: `1px solid ${C.border}`, background: "transparent",
            color: C.textMuted, fontSize: 13, cursor: "pointer",
            opacity: saving === "declined" ? 0.7 : 1, transition: "all 0.2s",
          }}>
          {saving === "declined" ? "..." : "No podré"}
        </button>
      </div>
    </div>
  );
}

// ─── Divider dorado ────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div style={{
      height: 1, margin: "24px 0",
      background: `linear-gradient(90deg, transparent, ${C.gold}50, transparent)`,
    }} />
  );
}

// ─── Tarjeta de dato del evento ───────────────────────────────────────────────
function InfoCard({ emoji, label, value }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: "14px 16px", borderRadius: 10,
      background: C.surface, border: `1px solid ${C.border}`,
      textAlign: "center",
    }}>
      <div style={{ fontSize: "1.4rem", marginBottom: 5 }}>{emoji}</div>
      <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.15em",
        textTransform: "uppercase", marginBottom: 3, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function InvitacionPublica({ guestId }) {
  const [guest,  setGuest]  = useState(null);
  const [status, setStatus] = useState("loading"); // loading | found | notfound | error
  const [rsvp,   setRsvp]   = useState(null);
  const [showQR, setShowQR] = useState(false);
  const countdown = useCountdown();

  useEffect(() => {
    if (!guestId) { setStatus("notfound"); return; }
    getGuest(guestId)
      .then(g => {
        if (!g) { setStatus("notfound"); return; }
        setGuest(g);
        setRsvp(g.rsvp);
        setStatus("found");
      })
      .catch(() => setStatus("error"));
  }, [guestId]);

  const base      = typeof window !== "undefined" ? window.location.origin : "https://TU-PROYECTO.vercel.app";
  const inviteUrl = `${base}/invitado/${guestId}`;
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteUrl)}&color=FFD700&bgcolor=000000&margin=12`;

  // ── Loading / error states ────────────────────────────────────────────────
  if (status === "loading") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');`}</style>
      <div style={{ textAlign: "center", color: C.gold }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎰</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
          Cargando tu invitación...
        </div>
      </div>
    </div>
  );

  if (status !== "found") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", color: C.textMuted, maxWidth: 300 }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎫</div>
        <div style={{ fontSize: 16, color: C.text, fontWeight: 700, marginBottom: 8 }}>
          Invitación no encontrada
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          Este enlace no corresponde a ningún invitado registrado. Verifica con el organizador.
        </div>
      </div>
    </div>
  );

  // ── Invitación principal ──────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
        ::selection { background: ${C.gold}40; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow     { 0%,100% { box-shadow:0 0 12px ${C.gold}25; } 50% { box-shadow:0 0 28px ${C.gold}50; } }
        @keyframes cardIn   { 0%,100%  {} }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes shimmer  {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .fade-up { animation: fadeUp 0.7s ease both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.15s; }
        .d3 { animation-delay: 0.25s; }
        .d4 { animation-delay: 0.38s; }
        .d5 { animation-delay: 0.52s; }
        .d6 { animation-delay: 0.66s; }
        .d7 { animation-delay: 0.80s; }

        .gold-btn {
          background: linear-gradient(135deg, ${C.gold} 0%, #A88030 50%, ${C.gold} 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        .gold-btn:hover { opacity:0.92; }

        .suit { opacity: 0.04; position: absolute; font-size: 7rem; pointer-events:none; user-select:none; }
      `}</style>

      {/* Fondo con decoración temática casino */}
      <div style={{ minHeight: "100vh", background: C.bg, position: "relative",
        overflow: "hidden" }}>

        {/* Cartas decorativas de fondo */}
        <span className="suit" style={{ top: "2%",  left:  "2%",  transform: "rotate(-15deg)" }}>♠</span>
        <span className="suit" style={{ top: "2%",  right: "2%",  transform: "rotate(12deg)", opacity: 0.12, color: "#B22222"  }}>♥</span>
        <span className="suit" style={{ bottom:"5%",left:  "4%",  transform: "rotate(10deg)", opacity: 0.12, color: "#B22222"  }}>♦</span>
        <span className="suit" style={{ bottom:"5%",right: "4%",  transform: "rotate(-8deg)"  }}>♣</span>

        {/* Borde superior dorado */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />

        <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 20px 80px" }}>

          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <div className="fade-up d1" style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: "0.65rem", color: C.gold, letterSpacing: "0.28em",
              textTransform: "uppercase", marginBottom: 14, fontWeight: 700 }}>
              🎰 &nbsp;Hugo's Birthday&nbsp; 🎰
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.4rem, 12vw, 4.2rem)",
              fontWeight: 600, color: C.white, lineHeight: 1.05, marginBottom: 6 }}>
              Hugo<br />
              <span style={{ color: C.gold }}>Fest</span>
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(0.9rem, 3vw, 1.2rem)", color: C.textMuted,
              letterSpacing: "0.06em", marginBottom: 24 }}>
              Hugo Monroy's Birthday
            </div>

            {/* Nombre del invitado */}
            <div style={{
              display: "inline-block", padding: "6px 22px", borderRadius: 30,
              background: C.gold + "15", border: `1px solid ${C.gold}40`,
              fontSize: 13, color: C.goldLight, letterSpacing: "0.06em",
            }}>
              PARA: &nbsp;<strong>{guest.name}</strong>
            </div>
          </div>

          {/* ── CONTADOR REGRESIVO ────────────────────────────────────────── */}
          <div className="fade-up d2" style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "24px 20px", marginBottom: 24, textAlign: "center",
            boxShadow: `0 0 30px ${C.gold}08`,
          }}>
            {countdown.over ? (
              <div style={{ padding: "16px 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎉</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.5rem", color: C.gold }}>
                  ¡La fiesta ha comenzado!
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "0.6rem", color: C.textDim,
                  letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
                  Faltan
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <CountUnit value={countdown.days}    label="Días"     />
                  <CountUnit value={countdown.hours}   label="Horas"    />
                  <CountUnit value={countdown.minutes} label="Minutos"  />
                  <CountUnit value={countdown.seconds} label="Segundos" />
                </div>
              </>
            )}
          </div>

          {/* ── DATOS DEL EVENTO ─────────────────────────────────────────── */}
          <div className="fade-up d3" style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <InfoCard emoji="📅" label="Fecha"  value={EVENT.date} />
            <InfoCard emoji="🕔" label="Hora"   value={EVENT.time} />
          </div>

          {/* ── UBICACIÓN CON MAPA ───────────────────────────────────────── */}
          <div className="fade-up d3" style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: "hidden", marginBottom: 24,
          }}>
            {/* Mapa embebido */}
            <iframe
              width="100%"
              height="220"
              style={{ display: "block", border: "none" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=Festivo+Jardin,Blvd.+Fundadores+2681,Juárez,22040+Tijuana,BC,Mexico&zoom=16&language=es`}
            />
            {/* Info y botón */}
            <div style={{ padding: "16px 18px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.18em",
                textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                📍 Lugar
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text,
                fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>
                Festivo Jardín
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, lineHeight: 1.6 }}>
                Blvd. Fundadores 2681, Juárez,<br />22040 Tijuana, B.C.
              </div>
              <a
                href="https://maps.google.com/?q=Festivo+Jardin+Blvd+Fundadores+2681+Tijuana"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 18px", borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  color: C.white, fontSize: 12, fontWeight: 700,
                  textDecoration: "none", letterSpacing: "0.06em",
                  boxShadow: `0 4px 14px ${C.red}40`,
                }}>
                🗺️ Cómo llegar
              </a>
            </div>
          </div>

          <GoldDivider />

          {/* ── MESA ─────────────────────────────────────────────────────── */}
          <div className="fade-up d4" style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          }}>
            <div>
              <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.18em",
                textTransform: "uppercase", marginBottom: 3 }}>Tu mesa</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem", color: C.white, fontWeight: 600, lineHeight: 1 }}>
                Mesa {guest.table}
              </div>
            </div>
            <div style={{ fontSize: 10, color: C.textDim, maxWidth: 180, textAlign: "right",
              lineHeight: 1.6 }}>
              Invitación personal e intransferible
            </div>
          </div>

          {/* ── DRESS CODE ───────────────────────────────────────────────── */}
          <div className="fade-up d4" style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "18px 20px", marginBottom: 24,
            overflow: "hidden",
          }}>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
              🎭 Dress Code
            </div>

            {/* Texto primero */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>
                  Hombres
                </div>
                {["Traje formal", "Camisa elegante", "Chaleco", "Tirantes"].map(i => (
                  <div key={i} style={{ fontSize: 12, color: C.text,
                    paddingLeft: 10, marginBottom: 3, lineHeight: 1.5 }}>
                    · {i}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>
                  Mujeres
                </div>
                {["Vestido largo elegante", "Lentejuelas", "Estilo glam y sofisticado"].map(i => (
                  <div key={i} style={{ fontSize: 12, color: C.text,
                    paddingLeft: 10, marginBottom: 3, lineHeight: 1.5 }}>
                    · {i}
                  </div>
                ))}
              </div>
            </div>

            {/* Imagen completa debajo */}
            <div style={{ borderRadius: 10, overflow: "hidden",
              border: `1px solid ${C.border}` }}>
              <img
                src="/images/dresscode.jpg"
                alt="Dress Code Hugo Fest"
                style={{ width: "100%", height: "auto", display: "block" }}
                loading="lazy"
              />
            </div>
          </div>

          {/* ── DINÁMICA ─────────────────────────────────────────────────── */}
          <div className="fade-up d5" style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "18px 20px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
              🎲 Dinámica de la noche
            </div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 12 }}>
              Cada invitado recibirá <strong style={{ color: C.gold }}>100 fichas</strong> para jugar
              en las mesas de Poker, Black Jack y Ruleta.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["🃏","Poker"],["🃏","Black Jack"],["🎡","Ruleta"]].map(([ic,n]) => (
                <div key={n} style={{
                  flex: 1, minWidth: 80, padding: "10px 8px",
                  background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`,
                  textAlign: "center", fontSize: 11, color: C.textMuted,
                }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{ic}</div>{n}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 12, lineHeight: 1.6 }}>
              Los 3 invitados con más fichas al final de la noche ganarán premios especiales 🏆
            </div>
          </div>

          {/* ── RSVP ─────────────────────────────────────────────────────── */}
          <div className="fade-up d6" style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "20px", marginBottom: 24,
          }}>
            <RSVPButtons guestId={guestId} current={rsvp} onDone={setRsvp} />
          </div>

          {/* ── QR DE ENTRADA ────────────────────────────────────────────── */}
          <div className="fade-up d7" style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "24px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
              Tu código de acceso
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
              Muestra este QR al llegar para registrar tu entrada
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{
                background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: 18,
                boxShadow: `0 0 40px ${C.gold}15`,
                animation: "glow 3s ease-in-out infinite",
              }}>
                {showQR ? (
                  <img src={qrUrl} alt="QR Invitación Hugo Fest"
                    width={180} height={180} style={{ display: "block", borderRadius: 8 }}
                    loading="lazy" />
                ) : (
                  <div style={{
                    width: 180, height: 180, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", cursor: "pointer",
                    gap: 10,
                  }} onClick={() => setShowQR(true)}>
                    <div style={{ fontSize: "2.5rem" }}>🎫</div>
                    <div style={{ fontSize: 11, color: C.gold, letterSpacing: "0.08em" }}>
                      Toca para ver tu QR
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="gold-btn"
              onClick={() => setShowQR(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 30, border: "none",
                color: "#07090E", fontSize: 13, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.08em",
              }}>
              Ver QR de entrada →
            </button>

            <div style={{ fontSize: 11, color: C.textDim, marginTop: 16, lineHeight: 1.6 }}>
              Guarda esta pantalla o toma captura de tu QR.<br />
              La invitación es personal e intransferible.
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 48, opacity: 0.3 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.1rem", color: C.gold }}>
              Hugo Fest · 20 · VII · 2026
            </div>
          </div>
        </div>

        {/* Borde inferior dorado */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
      </div>
    </>
  );
}
