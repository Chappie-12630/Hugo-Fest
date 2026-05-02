"use client";
// components/AdminPanel.jsx — Panel de administración · Hugo Fest

import { useState, useEffect } from "react";
import { subscribeGuests, addGuest, markArrived, deleteGuest } from "../lib/guests";
import { loginAdmin, logoutAdmin, onAuthChange } from "../lib/auth";
import SendInviteModal from "./SendInviteModal";

const C = {
  bg: "#080C12", surface: "#0E1420", surfaceAlt: "#131B28",
  border: "#1E2A3A", gold: "#C9A84C", goldLight: "#E8C97A",
  navy: "#1A2744", navyLight: "#243560",
  red: "#8A0000", redLight: "#B00000",
  text: "#E8EDF5", textMuted: "#7A8BA0", textDim: "#3D4F63",
  green: "#2ECC8A", danger: "#E05555", amber: "#E0A855",
};

// ── Helpers de estilo ─────────────────────────────────────────────────────────
function genQRUrl(id) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://TU-PROYECTO.vercel.app";
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(base + "/invitado/" + id)}&color=000000&bgcolor=ffffff`;
}

const pill = (color) => ({
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
  background: color + "18", color, border: `1px solid ${color}40`,
});

const cardStyle = {
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px",
};

function statusColor(r) { return r === "confirmed" ? C.green : r === "declined" ? C.danger : C.amber; }
function statusLabel(r) { return r === "confirmed" ? "Confirmado" : r === "declined" ? "Declinó" : "Pendiente"; }

// ── Modal QR ──────────────────────────────────────────────────────────────────
function QRModal({ guest, onClose }) {
  if (!guest) return null;
  const base      = typeof window !== "undefined" ? window.location.origin : "https://hugo-fest.vercel.app";
  const inviteUrl = `${base}/invitado/${guest.id}`;
  const qrLowUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}&color=000000&bgcolor=F5E6B8`;
  const qrHighUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(inviteUrl)}&color=000000&bgcolor=F5E6B8&margin=20`;

  const [copied,     setCopied]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadQR() {
    setDownloading(true);
    try {
      const res  = await fetch(qrHighUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `QR-${guest.name.replace(/\s+/g, "_")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrHighUrl, "_blank");
    }
    setDownloading(false);
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#000000CC", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...cardStyle, maxWidth: 340, textAlign: "center",
        padding: 32, borderColor: "#3D2E10",
      }}>
        <div style={{ fontSize: 11, color: C.gold, letterSpacing: "0.15em",
          textTransform: "uppercase", marginBottom: 4 }}>
          Invitación QR · Hugo Fest
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text,
          fontFamily: "Georgia,serif", marginBottom: 4 }}>{guest.name}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
          Mesa {guest.table}
        </div>

        {/* QR */}
        <div style={{ background: "#F5E6B8", borderRadius: 12, padding: 16,
          display: "inline-block", marginBottom: 20 }}>
          <img src={qrLowUrl} alt="QR" width={160} height={160}
            style={{ display: "block", borderRadius: 6 }} loading="lazy" />
        </div>

        {/* Link */}
        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 20,
          wordBreak: "break-all", lineHeight: 1.5, padding: "8px 12px",
          background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
          {inviteUrl}
        </div>

        {/* Botones */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={downloadQR} disabled={downloading} style={{
            width: "100%", padding: "11px", borderRadius: 8, border: "none",
            background: downloading ? C.border : `linear-gradient(135deg, ${C.gold}, #A88030)`,
            color: downloading ? C.textDim : C.bg,
            fontSize: 13, fontWeight: 700, cursor: downloading ? "default" : "pointer",
          }}>
            {downloading ? "Descargando..." : "⬇️ Descargar QR (alta resolución)"}
          </button>

          <button onClick={copyLink} style={{
            width: "100%", padding: "11px", borderRadius: 8,
            border: `1px solid ${copied ? C.green : C.border}`,
            background: copied ? C.green + "15" : "transparent",
            color: copied ? C.green : C.textMuted,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {copied ? "✓ Link copiado" : "🔗 Copiar link de invitación"}
          </button>

          <a href={inviteUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "block", padding: "11px", borderRadius: 8,
            border: `1px solid ${C.border}`, background: "transparent",
            color: C.textMuted, fontSize: 13, fontWeight: 600,
            textDecoration: "none", textAlign: "center",
          }}>
            👁️ Ver invitación
          </a>

          <button onClick={onClose} style={{
            width: "100%", padding: "10px", borderRadius: 8,
            border: `1px solid ${C.border}`, background: "transparent",
            color: C.textDim, fontSize: 12, cursor: "pointer",
          }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Agregar Invitado ────────────────────────────────────────────────────
function AddGuestModal({ onClose }) {
  const [form, setForm]     = useState({ name: "", email: "", phone: "", table: "1" });
  const [saving, setSaving] = useState(false);
  const inputStyle = {
    width: "100%", background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  async function handleAdd() {
    if (!form.name.trim()) return;
    setSaving(true);
    await addGuest(form);
    setSaving(false);
    onClose();
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#000000CC", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...cardStyle, width: "min(420px, 95vw)", borderColor: "#3D2E10", padding: 28,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text,
          fontFamily: "Georgia,serif", marginBottom: 20 }}>Agregar Invitado</div>

        {[["Nombre completo","name","text"],["Email","email","email"],
          ["Teléfono (+52...)","phone","tel"],["Mesa #","table","number"]].map(([label,key,type]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 5,
              letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
            <input
              type={type}
              value={form[key]}
              onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              style={inputStyle}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button style={{
            flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer",
          }} onClick={onClose}>Cancelar</button>
          <button style={{
            flex: 1, padding: "10px", borderRadius: 8, border: "none",
            background: C.gold, color: C.bg, fontSize: 13, fontWeight: 700,
            cursor: "pointer", opacity: saving ? 0.7 : 1,
          }} onClick={handleAdd} disabled={saving}>
            {saving ? "Guardando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de estadística ────────────────────────────────────────────────────
function StatCard({ label, value, color = C.gold, icon }) {
  return (
    <div style={{ ...cardStyle, flex: 1, minWidth: 110, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -16, right: -8, fontSize: 52, opacity: 0.04 }}>{icon}</div>
      <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: "Georgia,serif", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ── Pantalla de Login ─────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await loginAdmin(email, password);
      onLogin();
    } catch (e) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        width: "min(380px, 100%)", background: C.surface,
        border: `1px solid #3D2E10`, borderRadius: 16, padding: 36,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>🎰</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "1.6rem",
            color: C.gold, marginBottom: 4 }}>Hugo Fest</div>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: "0.18em",
            textTransform: "uppercase" }}>Panel de Administración</div>
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 16,
            background: "#2A0A0A", border: "1px solid #E0555530",
            fontSize: 13, color: C.danger, textAlign: "center",
          }}>{error}</div>
        )}

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6,
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Email</div>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="admin@hugofest.com"
            style={{
              width: "100%", background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "11px 14px", color: C.text,
              fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6,
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Contraseña</div>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            style={{
              width: "100%", background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "11px 14px", color: C.text,
              fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "13px", borderRadius: 8, border: "none",
          background: loading ? C.border : `linear-gradient(135deg, ${C.gold}, #A88030)`,
          color: loading ? C.textDim : C.bg,
          fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer",
          letterSpacing: "0.08em", transition: "all 0.2s",
        }}>
          {loading ? "Entrando..." : "Entrar al panel →"}
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminPanel() {
  const [user,       setUser]       = useState(undefined); // undefined=cargando, null=no auth
  const [guests,     setGuests]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [tab,        setTab]        = useState("guests");
  const [qrGuest,    setQrGuest]    = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [sendGuests, setSendGuests] = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);

  // Escuchar estado de autenticación
  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u ?? null));
    return () => unsub();
  }, []);

  // Suscribirse a invitados solo si está autenticado
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeGuests(data => { setGuests(data); setLoading(false); });
    return () => unsub();
  }, [user]);

  const confirmed = guests.filter(g => g.rsvp === "confirmed").length;
  const arrived   = guests.filter(g => g.arrived).length;
  const pending   = guests.filter(g => g.rsvp === "pending").length;
  const declined  = guests.filter(g => g.rsvp === "declined").length;

  const filtered = guests.filter(g => {
    const q = g.name.toLowerCase().includes(search.toLowerCase()) ||
              (g.email||"").toLowerCase().includes(search.toLowerCase());
    if (filter === "confirmed") return q && g.rsvp === "confirmed";
    if (filter === "pending")   return q && g.rsvp === "pending";
    if (filter === "arrived")   return q && g.arrived;
    if (filter === "missing")   return q && g.rsvp === "confirmed" && !g.arrived;
    return q;
  });

  async function handleDelete(id) {
    await deleteGuest(id);
    setDeleteId(null);
  }

  if (user === undefined) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎰</div>
        <div style={{ color: C.gold, fontFamily: "Georgia,serif", fontSize: 18 }}>
          Cargando Hugo Fest...
        </div>
      </div>
    </div>
  );

  if (!user) return <LoginScreen onLogin={() => {}} />;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎰</div>
        <div style={{ color: C.gold, fontFamily: "Georgia,serif", fontSize: 18 }}>
          Cargando Hugo Fest...
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:${C.bg};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        tr:hover td{background:${C.surfaceAlt}!important;} input::placeholder{color:${C.textDim};}
        button:hover{opacity:0.85;}
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 32px",
          background: `linear-gradient(180deg, #0A0F18, ${C.bg})` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex",
            alignItems: "center", justifyContent: "space-between", height: 64,
            flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10,
                background: C.gold, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 20 }}>🎰</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text,
                  fontFamily: "Georgia,serif" }}>Hugo Monroy</div>
                <div style={{ fontSize: 11, color: C.gold,
                  letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Hugo Fest · Panel Admin
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: "transparent", color: C.text, fontSize: 12,
                fontWeight: 600, cursor: "pointer",
              }} onClick={() => setSendGuests(guests.filter(g => g.rsvp !== "declined"))}>
                📤 Enviar a todos
              </button>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: C.gold, color: C.bg, fontSize: 12,
                fontWeight: 700, cursor: "pointer",
              }} onClick={() => setShowAdd(true)}>
                + Invitado
              </button>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: "transparent", color: C.textMuted, fontSize: 12,
                cursor: "pointer",
              }} onClick={logoutAdmin}>
                Salir
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>

          {/* Estadísticas */}
          <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
            <StatCard label="Total"       value={guests.length} color={C.text}    icon="👥" />
            <StatCard label="Confirmados" value={confirmed}     color={C.green}   icon="✅" />
            <StatCard label="Llegaron"    value={arrived}       color={C.gold}    icon="🎉" />
            <StatCard label="Pendientes"  value={pending}       color={C.amber}   icon="⏳" />
            <StatCard label="Declinaron"  value={declined}      color={C.danger}  icon="❌" />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24,
            borderBottom: `1px solid ${C.border}` }}>
            {[["guests","Invitados"],["tables","Mesas"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 13,
                fontWeight: 600, background: "transparent",
                color: tab===id ? C.gold : C.textMuted,
                borderBottom: `2px solid ${tab===id ? C.gold : "transparent"}`,
                marginBottom: -1, transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          {/* TAB: Invitados */}
          {tab === "guests" && (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  style={{
                    flex: 1, minWidth: 200, background: C.surface,
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "9px 14px", color: C.text, fontSize: 14,
                    outline: "none", fontFamily: "inherit",
                  }}
                />
                {[["all","Todos"],["confirmed","Confirmados"],["arrived","Llegaron"],
                  ["missing","Faltan"],["pending","Pendientes"]].map(([val,lbl]) => (
                  <button key={val} onClick={() => setFilter(val)} style={{
                    padding: "8px 12px", borderRadius: 8,
                    border: `1px solid ${filter===val ? C.gold : C.border}`,
                    background: filter===val ? C.gold+"18" : "transparent",
                    color: filter===val ? C.gold : C.textMuted,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>{lbl}</button>
                ))}
              </div>

              <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {["Invitado","Mesa","RSVP","Llegada","Acciones"].map(h => (
                          <th key={h} style={{
                            padding: "13px 16px", textAlign: "left", fontSize: 11,
                            color: C.textMuted, fontWeight: 600,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: "32px 16px", textAlign: "center",
                            color: C.textDim, fontSize: 13 }}>
                            {search ? "No se encontraron invitados" : "Aún no hay invitados"}
                          </td>
                        </tr>
                      )}
                      {filtered.map(g => (
                        <tr key={g.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 9, background: C.navyLight,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 700, color: C.goldLight, flexShrink: 0,
                              }}>
                                {g.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                                  {g.name}
                                </div>
                                <div style={{ fontSize: 11, color: C.textMuted }}>
                                  {g.email || "—"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
                              Mesa {g.table}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={pill(statusColor(g.rsvp))}>{statusLabel(g.rsvp)}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {g.arrived
                              ? <span style={pill(C.green)}>
                                  ✓ {g.arrivedAt?.toDate
                                    ? g.arrivedAt.toDate().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})
                                    : "Registrado"}
                                </span>
                              : <span style={{ fontSize: 12, color: C.textDim }}>—</span>
                            }
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button style={{
                                padding: "5px 10px", borderRadius: 7,
                                border: `1px solid ${C.border}`, background: "transparent",
                                color: C.text, fontSize: 12, cursor: "pointer",
                              }} onClick={() => setQrGuest(g)}>QR</button>

                              <button style={{
                                padding: "5px 10px", borderRadius: 7,
                                border: `1px solid ${C.gold}40`, background: "transparent",
                                color: C.gold, fontSize: 12, cursor: "pointer",
                              }} onClick={() => setSendGuests([g])}>📤</button>

                              {!g.arrived && (
                                <button style={{
                                  padding: "5px 10px", borderRadius: 7, border: "none",
                                  background: C.navyLight, color: C.text,
                                  fontSize: 12, cursor: "pointer",
                                }} onClick={() => markArrived(g.id)}>Llegó</button>
                              )}

                              <button style={{
                                padding: "5px 10px", borderRadius: 7, border: "none",
                                background: "#2A0A0A", color: C.danger,
                                fontSize: 12, cursor: "pointer",
                              }} onClick={() => setDeleteId(g.id)}>✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textMuted }}>
                  Mostrando {filtered.length} de {guests.length} invitados
                </div>
              </div>
            </>
          )}

          {/* TAB: Mesas */}
          {tab === "tables" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {[...new Set(guests.map(g=>g.table))].sort((a,b)=>a-b).map(tableNum => {
                const tg = guests.filter(g=>g.table===tableNum);
                const ac = tg.filter(g=>g.arrived).length;
                return (
                  <div key={tableNum} style={cardStyle}>
                    <div style={{ display:"flex",justifyContent:"space-between",
                      alignItems:"center",marginBottom:12 }}>
                      <div style={{ fontSize:16,fontWeight:700,fontFamily:"Georgia,serif",color:C.gold }}>
                        Mesa {tableNum}
                      </div>
                      <div style={{ fontSize:12,color:C.textMuted }}>{ac}/{tg.length}</div>
                    </div>
                    <div style={{ height:4,background:C.border,borderRadius:2,marginBottom:14 }}>
                      <div style={{
                        height:"100%", width:`${tg.length ? ac/tg.length*100 : 0}%`,
                        background:C.gold, borderRadius:2, transition:"width 0.4s",
                      }} />
                    </div>
                    {tg.map(g => (
                      <div key={g.id} style={{ display:"flex",justifyContent:"space-between",
                        alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}` }}>
                        <div style={{ fontSize:13,color:g.arrived?C.text:C.textMuted }}>{g.name}</div>
                        <span style={{ fontSize:15 }}>{g.arrived?"✅":"⬜"}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {guests.length === 0 && (
                <div style={{ ...cardStyle, textAlign:"center", color:C.textDim, fontSize:13 }}>
                  Agrega invitados para ver las mesas
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {qrGuest    && <QRModal guest={qrGuest} onClose={() => setQrGuest(null)} />}
      {showAdd    && <AddGuestModal onClose={() => setShowAdd(false)} />}
      {sendGuests && <SendInviteModal guests={sendGuests} onClose={() => setSendGuests(null)} />}

      {/* Confirmación de eliminación */}
      {deleteId && (
        <div onClick={() => setDeleteId(null)} style={{
          position:"fixed",inset:0,background:"#000000CC",zIndex:1000,
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...cardStyle, padding:28, maxWidth:340, textAlign:"center",
          }}>
            <div style={{ fontSize:"2rem",marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:15,fontWeight:700,color:C.text,marginBottom:8 }}>
              ¿Eliminar invitado?
            </div>
            <div style={{ fontSize:12,color:C.textMuted,marginBottom:24 }}>
              Esta acción no se puede deshacer.
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button style={{
                flex:1,padding:"10px",borderRadius:8,border:`1px solid ${C.border}`,
                background:"transparent",color:C.textMuted,fontSize:13,cursor:"pointer",
              }} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button style={{
                flex:1,padding:"10px",borderRadius:8,border:"none",
                background:C.danger,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",
              }} onClick={() => handleDelete(deleteId)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
