"use client";
// components/AdminPanel.jsx — Panel de administración · Hugo Fest

import { useState, useEffect } from "react";
import { subscribeGuests, addGuest, markArrived, deleteGuest } from "../lib/guests";
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
  // 🔴 IMPORTANTE: Cambia esta URL por tu dominio real de Vercel después de publicar
  // Ejemplo: const base = "https://hugo-fest.vercel.app";
  const base = typeof window !== "undefined" ? window.location.origin : "https://TU-PROYECTO.vercel.app";
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(base + "/invitado/" + id)}&color=C9A84C&bgcolor=080C12`;
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
  const base = typeof window !== "undefined" ? window.location.origin : "https://TU-PROYECTO.vercel.app";
  const inviteUrl = `${base}/invitado/${guest.id}`;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#000000CC", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...cardStyle, maxWidth: 320, textAlign: "center", padding: 32, borderColor: "#3D2E10",
      }}>
        <div style={{ fontSize: 11, color: C.gold, letterSpacing: "0.15em",
          textTransform: "uppercase", marginBottom: 4 }}>Invitación QR · Hugo Fest</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text,
          fontFamily: "Georgia,serif", marginBottom: 4 }}>{guest.name}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Mesa {guest.table}</div>
        <div style={{ background: C.bg, borderRadius: 12, padding: 16,
          display: "inline-block", border: `1px solid ${C.border}` }}>
          <img src={genQRUrl(guest.id)} alt="QR" width={160} height={160}
            style={{ display: "block" }} loading="lazy" />
        </div>
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 14,
          wordBreak: "break-all", lineHeight: 1.5 }}>
          {inviteUrl}
        </div>
        <button style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: "transparent", color: C.textMuted, fontSize: 12,
          cursor: "pointer", marginTop: 20, width: "100%",
        }} onClick={onClose}>Cerrar</button>
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

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminPanel() {
  const [guests,     setGuests]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [tab,        setTab]        = useState("guests");
  const [qrGuest,    setQrGuest]    = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [sendGuests, setSendGuests] = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);

  useEffect(() => {
    const unsub = subscribeGuests(data => { setGuests(data); setLoading(false); });
    return () => unsub();
  }, []);

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
