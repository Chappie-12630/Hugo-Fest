"use client";
// components/InvitacionPublica.jsx
// Página pública del invitado — conectada a Firebase en tiempo real

import { useState, useEffect, useRef } from "react";
import { getGuest, updateRSVP }        from "../lib/guests";

const EVENT_DATE = new Date("2026-07-25T20:00:00");

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useCountdown(target) {
  const calc = () => {
    const diff = target - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Partículas de fondo ───────────────────────────────────────────────────────
function Particles() {
  const dots = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    dur: 4 + Math.random() * 6,
    delay: Math.random() * 5,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {dots.map(d => (
        <div key={d.id} style={{
          position: "absolute", left: `${d.x}%`, top: `${d.y}%`,
          width: d.size, height: d.size, borderRadius: "50%",
          background: "#C9A84C", opacity: 0.2,
          animation: `particlePulse ${d.dur}s ${d.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function CountdownUnit({ value, label }) {
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div style={{
        fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 800,
        fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C", lineHeight: 1,
      }}>
        {String(value).padStart(2, "0")}
      </div>
      <div style={{
        fontSize: "0.6rem", letterSpacing: "0.18em", color: "#5A6B80",
        textTransform: "uppercase", marginTop: 6, fontWeight: 600,
      }}>
        {label}
      </div>
    </div>
  );
}

// ── RSVP ──────────────────────────────────────────────────────────────────────
function RSVPSection({ guest, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [localRsvp, setLocalRsvp] = useState(guest?.rsvp || null);

  async function respond(answer) {
    setLoading(true);
    try {
      await updateRSVP(guest.id, answer);
      setLocalRsvp(answer);
      onUpdate(answer);
    } catch (e) {
      console.error("Error al guardar RSVP:", e);
    }
    setLoading(false);
  }

  if (localRsvp === "confirmed") return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: "2.8rem", marginBottom: 14 }}>🥂</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem",
        color: "#2ECC8A", marginBottom: 10 }}>¡Nos vemos en la fiesta!</div>
      <div style={{ fontSize: "0.85rem", color: "#5A6B80" }}>
        Mesa {guest.table} reservada para ti.
      </div>
    </div>
  );

  if (localRsvp === "declined") return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: "2.8rem", marginBottom: 14 }}>💌</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem",
        color: "#C9A84C", marginBottom: 10 }}>Lamentamos que no puedas venir</div>
      <div style={{ fontSize: "0.85rem", color: "#5A6B80" }}>Gracias por avisarnos.</div>
    </div>
  );

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem",
        color: "#7A8BA0", marginBottom: 28, letterSpacing: "0.04em" }}>
        ¿Confirmas tu asistencia?
      </div>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => respond("confirmed")} disabled={loading} style={{
          padding: "13px 36px", borderRadius: 4,
          background: "linear-gradient(135deg, #C9A84C, #A88030)",
          border: "none", color: "#080C12", fontSize: "0.85rem",
          fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          cursor: "pointer", opacity: loading ? 0.6 : 1,
          boxShadow: "0 4px 24px #C9A84C30", transition: "all 0.2s",
        }}>
          {loading ? "..." : "✓  Asistiré"}
        </button>
        <button onClick={() => respond("declined")} disabled={loading} style={{
          padding: "13px 36px", borderRadius: 4,
          border: "1px solid #1E2A3A", background: "transparent",
          color: "#5A6B80", fontSize: "0.85rem", fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase",
          cursor: "pointer", opacity: loading ? 0.6 : 1, transition: "all 0.2s",
        }}>
          No podré ir
        </button>
      </div>
    </div>
  );
}

// ── Galería de fotos ──────────────────────────────────────────────────────────
// Las fotos se cargan desde Firebase Storage
// Por ahora usa placeholders — reemplaza PHOTOS con URLs reales de Firebase
const PHOTOS = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&q=80",
];

function Gallery() {
  const [active, setActive] = useState(null);
  return (
    <>
      {active !== null && (
        <div onClick={() => setActive(null)} style={{
          position: "fixed", inset: 0, background: "#000000EE",
          zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "zoom-out",
        }}>
          <img src={PHOTOS[active]} alt="" style={{
            maxWidth: "90vw", maxHeight: "90vh", borderRadius: 6,
            border: "1px solid #C9A84C40", objectFit: "contain",
          }} />
        </div>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
      }}>
        {PHOTOS.map((url, i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            overflow: "hidden", borderRadius: 6, cursor: "zoom-in",
            gridColumn: i === 0 ? "span 2" : "span 1",
            aspectRatio: i === 0 ? "4/3" : "1/1",
            border: "1px solid #1E2A3A",
          }}>
            <img src={url} alt={`Foto ${i + 1}`} style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              transition: "transform 0.5s ease, filter 0.4s ease",
              filter: "brightness(0.85) saturate(0.9)",
            }}
              onMouseEnter={e => {
                e.target.style.transform = "scale(1.06)";
                e.target.style.filter = "brightness(1) saturate(1)";
              }}
              onMouseLeave={e => {
                e.target.style.transform = "scale(1)";
                e.target.style.filter = "brightness(0.85) saturate(0.9)";
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function InvitacionPublica({ guestId }) {
  const [guest,       setGuest]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const countdown = useCountdown(EVENT_DATE);

  useEffect(() => {
    async function load() {
      if (!guestId) { setNotFound(true); setLoading(false); return; }
      const data = await getGuest(guestId);
      if (!data) setNotFound(true);
      else setGuest(data);
      setLoading(false);
    }
    load();
    setTimeout(() => setHeroVisible(true), 100);
  }, [guestId]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#07090E", display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.2rem", letterSpacing: "0.1em" }}>
        Cargando tu invitación...
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#07090E", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: 20 }}>🎫</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem",
        color: "#C9A84C", marginBottom: 12 }}>Invitación no encontrada</div>
      <div style={{ fontSize: "0.9rem", color: "#5A6B80", maxWidth: 360, lineHeight: 1.7 }}>
        Este enlace no corresponde a ningún invitado registrado.
        Si crees que es un error, contacta al organizador.
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #07090E; color: #D4DDE8; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::selection { background: #C9A84C30; color: #E8C97A; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius: 2px; }
        @keyframes particlePulse {
          0%,100% { opacity: 0.1; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(1.6); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes cornerPulse {
          0%,100% { opacity: 0.35; }
          50%      { opacity: 0.9; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #C9A84C 0%, #E8C97A 40%, #C9A84C 60%, #A88030 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .divider { width:100%; height:1px;
          background: linear-gradient(90deg, transparent, #C9A84C50, transparent);
          margin: 60px 0; }
        .label {
          font-size: 0.63rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: #C9A84C; font-weight: 700; margin-bottom: 14px;
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", position: "relative",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px",
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, #1A274450, transparent 70%), #07090E`,
      }}>
        <Particles />

        {/* Esquinas decorativas */}
        {[
          { top: 24, left: 24,  borderTop: "1px solid #C9A84C50", borderLeft: "1px solid #C9A84C50" },
          { top: 24, right: 24, borderTop: "1px solid #C9A84C50", borderRight: "1px solid #C9A84C50" },
          { bottom: 24, left: 24,  borderBottom: "1px solid #C9A84C50", borderLeft: "1px solid #C9A84C50" },
          { bottom: 24, right: 24, borderBottom: "1px solid #C9A84C50", borderRight: "1px solid #C9A84C50" },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", width: 40, height: 40,
            animation: `cornerPulse 3s ${i * 0.4}s ease-in-out infinite`,
            ...s,
          }} />
        ))}

        <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 680 }}>
          {/* Subtítulo */}
          <div style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(-16px)",
            transition: "all 1s ease 0.1s",
          }}>
            <div className="label" style={{ marginBottom: 28 }}>Estás invitado a celebrar</div>
          </div>

          {/* Nombre */}
          <div style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "scale(1)" : "scale(0.94)",
            transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s",
          }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem, 10vw, 5.5rem)",
              fontWeight: 300, lineHeight: 1.05, marginBottom: 6,
            }}>
              <span className="gold-shimmer">José Carlos</span>
            </h1>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.4rem, 5vw, 2.6rem)",
              fontWeight: 300, color: "#6A7B90",
              letterSpacing: "0.05em", marginBottom: 36,
            }}>
              Hernández García
            </h2>
          </div>

          {/* Badge evento */}
          <div style={{
            opacity: heroVisible ? 1 : 0, transition: "all 0.8s ease 0.8s",
          }}>
            <div style={{
              display: "inline-block", padding: "6px 22px",
              border: "1px solid #C9A84C35", borderRadius: 2,
              fontSize: "0.75rem", letterSpacing: "0.2em",
              color: "#C9A84C70", textTransform: "uppercase",
              fontWeight: 600, marginBottom: 52,
            }}>
              Su Cumpleaños
            </div>
          </div>

          {/* Countdown */}
          <div style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.9s ease 1s",
          }}>
            <div className="label" style={{ marginBottom: 20 }}>Faltan</div>
            <div style={{
              display: "inline-flex", gap: "clamp(14px, 4vw, 36px)",
              padding: "26px 38px",
              background: "linear-gradient(135deg, #0E142080, #0A0F1880)",
              border: "1px solid #1E2A3A", borderRadius: 8,
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 50px #C9A84C06, inset 0 1px 0 #C9A84C15",
            }}>
              {[
                { v: countdown.days,    l: "Días" },
                { v: countdown.hours,   l: "Horas" },
                { v: countdown.minutes, l: "Min" },
                { v: countdown.seconds, l: "Seg" },
              ].map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center",
                  gap: "clamp(14px, 4vw, 36px)" }}>
                  <CountdownUnit value={u.v} label={u.l} />
                  {i < 3 && (
                    <div style={{ color: "#1E2A3A", fontSize: "1.4rem",
                      marginBottom: 18, fontWeight: 300 }}>:</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scroll */}
          <div style={{
            marginTop: 60, opacity: heroVisible ? 1 : 0,
            transition: "opacity 1s ease 1.6s",
            animation: "floatY 2.5s ease-in-out infinite",
          }}>
            <div style={{ fontSize: "1.3rem", color: "#2A3A50" }}>↓</div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── INVITADO ── */}
      <section style={{ padding: "0 24px 80px", maxWidth: 700, margin: "0 auto" }}>
        <Reveal>
          <div style={{
            padding: "38px 44px", borderRadius: 10,
            background: "linear-gradient(135deg, #0E1420, #111825)",
            border: "1px solid #1E2A3A", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -40, right: -40, width: 150, height: 150,
              borderRadius: "50%", background: "#C9A84C06", filter: "blur(40px)",
              pointerEvents: "none",
            }} />
            <div className="label">Invitado especial</div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
              fontWeight: 400, color: "#D4DDE8", lineHeight: 1.2, marginBottom: 10,
            }}>
              {guest.name}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#3D4F63", letterSpacing: "0.08em" }}>
              Mesa {guest.table}  ·  Esta invitación es personal e intransferible
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── DETALLES ── */}
      <section style={{ padding: "0 24px 80px", maxWidth: 700, margin: "0 auto" }}>
        <Reveal><div className="label">Detalles del evento</div></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
          {[
            { icon: "📅", label: "Fecha",  value: "25 de Julio, 2026", sub: "Sábado" },
            { icon: "🕗", label: "Hora",   value: "Por confirmar",      sub: "Se comunicará pronto" },
            { icon: "📍", label: "Lugar",  value: "Por confirmar",      sub: "Dirección próximamente" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div style={{
                padding: "26px 22px", borderRadius: 8, background: "#0E1420",
                border: "1px solid #1E2A3A", transition: "all 0.3s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#C9A84C40";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#1E2A3A";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: 12 }}>{item.icon}</div>
                <div className="label" style={{ marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.2rem", color: "#D4DDE8", marginBottom: 4 }}>{item.value}</div>
                <div style={{ fontSize: "0.72rem", color: "#3D4F63", lineHeight: 1.5 }}>{item.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── GALERÍA ── */}
      <section style={{ padding: "0 24px 80px", maxWidth: 700, margin: "0 auto" }}>
        <Reveal>
          <div className="label">El festejado</div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
            fontWeight: 300, color: "#C9A84C70", marginBottom: 28,
          }}>
            Un vistazo a José Carlos
          </h2>
        </Reveal>
        <Reveal delay={0.15}><Gallery /></Reveal>
      </section>

      <div className="divider" />

      {/* ── RSVP ── */}
      <section style={{ padding: "0 24px 100px", maxWidth: 700, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="label">Confirma tu asistencia</div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
              fontWeight: 300, color: "#D4DDE8",
            }}>
              ¿Nos acompañas a celebrar?
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{
            padding: "44px 36px", borderRadius: 10,
            background: "linear-gradient(135deg, #0E1420, #0A0F18)",
            border: "1px solid #1E2A3A",
            boxShadow: "0 0 70px #C9A84C05",
          }}>
            <RSVPSection
              guest={guest}
              onUpdate={rsvp => setGuest(g => ({ ...g, rsvp }))}
            />
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #0E1420", padding: "36px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.7rem", fontWeight: 300, marginBottom: 8 }}>
          <span className="gold-shimmer">José Carlos</span>
        </div>
        <div style={{ fontSize: "0.65rem", color: "#2A3A50",
          letterSpacing: "0.18em", textTransform: "uppercase" }}>
          25 · Julio · 2026
        </div>
      </footer>
    </>
  );
}
