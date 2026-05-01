"use client";
// components/EscanerEntrada.jsx — Escáner QR conectado a Firebase en tiempo real

import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeGuests, markArrived }              from "../lib/guests";

// 🔐 Cambia este PIN en Vercel → Settings → Environment Variables → NEXT_PUBLIC_SCANNER_PIN
const SCANNER_PIN = process.env.NEXT_PUBLIC_SCANNER_PIN || "5296";

// ── Utils ─────────────────────────────────────────────────────────────────────
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

function parseQR(raw) {
  const match = raw.match(/invitado\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : raw.trim();
}

// ── PIN Screen ────────────────────────────────────────────────────────────────
function PINScreen({ onUnlock }) {
  const [pin,   setPin]   = useState("");
  const [shake, setShake] = useState(false);

  function press(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === SCANNER_PIN) {
        setTimeout(() => onUnlock(), 300);
      } else {
        setShake(true);
        setTimeout(() => { setPin(""); setShake(false); }, 600);
      }
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#07090E", padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;600&display=swap');
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-8px); }
          40%,80% { transform: translateX(8px); }
        }
      `}</style>

      {/* Logo */}
      <div style={{ marginBottom: 8, fontSize: "2.2rem", textAlign: "center" }}>🎰</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.9rem", color: "#C9A84C", marginBottom: 4, textAlign: "center" }}>
        Hugo Fest
      </div>
      <div style={{ fontSize: "0.65rem", color: "#3D4F63", letterSpacing: "0.2em",
        textTransform: "uppercase", marginBottom: 48 }}>
        Escáner de Entrada · 20 Julio 2026
      </div>

      {/* Puntos PIN */}
      <div style={{
        display: "flex", gap: 16, marginBottom: 40,
        animation: shake ? "shake 0.5s ease" : "none",
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 15, height: 15, borderRadius: "50%",
            border: "2px solid #C9A84C50",
            background: pin.length > i ? "#C9A84C" : "transparent",
            transition: "all 0.2s",
          }} />
        ))}
      </div>

      {/* Teclado numérico */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 12,
        fontFamily: "'DM Sans', sans-serif" }}>
        {[1,2,3,4,5,6,7,8,9,null,0,"⌫"].map((k, i) => (
          <button key={i}
            onClick={() => k === "⌫" ? setPin(p => p.slice(0,-1)) : k !== null && press(String(k))}
            disabled={k === null}
            style={{
              width: 72, height: 72, borderRadius: 12,
              border: `1px solid ${k === null ? "transparent" : "#1E2A3A"}`,
              background: k === null ? "transparent" : "#0E1420",
              color: k === "⌫" ? "#5A6B80" : "#D4DDE8",
              fontSize: k === "⌫" ? "1.2rem" : "1.5rem",
              fontFamily: "'Cormorant Garamond', serif",
              cursor: k === null ? "default" : "pointer",
              transition: "background 0.15s",
            }}
            onMouseDown={e => { if (k !== null) e.currentTarget.style.background = "#1A2744"; }}
            onMouseUp={e => { if (k !== null) e.currentTarget.style.background = "#0E1420"; }}
          >{k}</button>
        ))}
      </div>
    </div>
  );
}

// ── Toast de resultado ────────────────────────────────────────────────────────
function ResultToast({ result, onDismiss }) {
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [result]);

  if (!result) return null;

  const configs = {
    success: { bg: "#0D3D28", border: "#2ECC8A", color: "#2ECC8A", emoji: "🎉" },
    repeat:  { bg: "#2A1A00", border: "#E0A855", color: "#E0A855", emoji: "⚠️" },
    unknown: { bg: "#2A0A0A", border: "#E05555", color: "#E05555", emoji: "❌" },
  };
  const c = configs[result.type];

  return (
    <div style={{
      position: "fixed", top: 24, left: "50%",
      transform: "translateX(-50%)",
      width: "min(460px, 90vw)", zIndex: 1000,
      padding: "22px 26px", borderRadius: 12,
      background: c.bg, border: `1px solid ${c.border}`,
      boxShadow: `0 8px 40px ${c.border}25`,
      animation: "slideDown 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}>{c.emoji}</span>
        <div style={{ flex: 1 }}>
          {result.type === "success" && <>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: c.color,
              fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>
              ¡Bienvenido, {result.name}!
            </div>
            <div style={{ fontSize: "0.82rem", color: "#5A8B70" }}>
              Mesa {result.table} · Registrado a las {result.time}
            </div>
          </>}
          {result.type === "repeat" && <>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: c.color, marginBottom: 4 }}>
              Ya fue registrado
            </div>
            <div style={{ fontSize: "0.82rem", color: "#8B7A40" }}>
              {result.name} llegó antes
            </div>
          </>}
          {result.type === "unknown" && <>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: c.color, marginBottom: 4 }}>
              QR no reconocido
            </div>
            <div style={{ fontSize: "0.82rem", color: "#8B4040" }}>
              Este código no corresponde a ningún invitado.
            </div>
          </>}
        </div>
        <button onClick={onDismiss} style={{
          background: "none", border: "none", color: c.color,
          cursor: "pointer", fontSize: "1rem", opacity: 0.5, flexShrink: 0,
        }}>✕</button>
      </div>
      <div style={{ marginTop: 14, height: 2, background: c.border + "30", borderRadius: 2 }}>
        <div style={{
          height: "100%", background: c.border, borderRadius: 2,
          animation: "shrink 4.5s linear forwards",
        }} />
      </div>
    </div>
  );
}

// ── Cámara QR ─────────────────────────────────────────────────────────────────
function QRCamera({ onScan }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const [ready,  setReady]  = useState(false);
  const [error,  setError]  = useState(null);
  const jsQRRef  = useRef(null);

  // Cargar jsQR como módulo npm (no CDN)
  useEffect(() => {
    import("jsqr").then(mod => {
      jsQRRef.current = mod.default;
    }).catch(() => setError("No se pudo cargar el escáner."));
  }, []);

  // Iniciar cámara
  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("No se pudo acceder a la cámara. Verifica permisos en el navegador.");
      }
    })();
    return () => {
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Loop de escaneo
  useEffect(() => {
    if (!ready) return;
    function tick() {
      const jsQR = jsQRRef.current;
      const v = videoRef.current;
      const c = canvasRef.current;
      if (jsQR && v && c && v.readyState === v.HAVE_ENOUGH_DATA) {
        c.width = v.videoWidth; c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        ctx.drawImage(v, 0, 0, c.width, c.height);
        const img  = ctx.getImageData(0, 0, c.width, c.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (code?.data) { onScan(code.data); return; }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, onScan]);

  if (error) return (
    <div style={{ padding: 24, textAlign: "center", color: "#E0A855", fontSize: "0.88rem",
      background: "#0E1420", borderRadius: 10, border: "1px solid #1E2A3A" }}>
      ⚠️ {error}
      <div style={{ marginTop: 8, fontSize: "0.72rem", color: "#3D4F63" }}>
        Usa el modo manual de abajo.
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
      <video ref={videoRef} playsInline muted style={{
        width: "100%", display: "block", borderRadius: 12, background: "#07090E",
        minHeight: 240,
      }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {!ready && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "#0E1420", borderRadius: 12,
        }}>
          <div style={{ textAlign: "center", color: "#3D4F63" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>⟳</div>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.1em" }}>Iniciando cámara...</div>
          </div>
        </div>
      )}

      {/* Marco dorado de escaneo */}
      {ready && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 200, height: 200, position: "relative" }}>
            {[
              { top: 0, left: 0, borderTop: "2px solid #C9A84C", borderLeft: "2px solid #C9A84C" },
              { top: 0, right: 0, borderTop: "2px solid #C9A84C", borderRight: "2px solid #C9A84C" },
              { bottom: 0, right: 0, borderBottom: "2px solid #C9A84C", borderRight: "2px solid #C9A84C" },
              { bottom: 0, left: 0, borderBottom: "2px solid #C9A84C", borderLeft: "2px solid #C9A84C" },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: 30, height: 30, ...s }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function EscanerEntrada() {
  const [unlocked,  setUnlocked]  = useState(false);
  const [guests,    setGuests]    = useState({});
  const [arrivals,  setArrivals]  = useState([]);
  const [result,    setResult]    = useState(null);
  const [mode,      setMode]      = useState("camera");
  const [manualId,  setManualId]  = useState("");
  const cooldown = useRef(false);

  // Suscribirse a invitados de Firebase
  useEffect(() => {
    if (!unlocked) return;
    const unsub = subscribeGuests(data => {
      const map = {};
      data.forEach(g => { map[g.id] = g; });
      setGuests(map);
    });
    return () => unsub();
  }, [unlocked]);

  const handleScan = useCallback((raw) => {
    if (cooldown.current) return;
    cooldown.current = true;
    setTimeout(() => { cooldown.current = false; }, 2000);

    const id    = parseQR(raw);
    const guest = guests[id];
    const time  = nowTime();

    console.log("QR escaneado:", raw, "→ ID:", id, "→ Invitado:", guest);

    if (!guest) {
      setResult({ type: "unknown" });
      return;
    }
    if (guest.arrived) {
      setResult({ type: "repeat", name: guest.name, table: guest.table });
      return;
    }

    markArrived(id).catch(console.error);
    setArrivals(prev => [{ id, name: guest.name, table: guest.table, time }, ...prev]);
    setResult({ type: "success", name: guest.name, table: guest.table, time });
  }, [guests]);

  function handleManual() {
    if (!manualId.trim()) return;
    handleScan(manualId.trim());
    setManualId("");
  }

  if (!unlocked) return <PINScreen onUnlock={() => setUnlocked(true)} />;

  const guestList    = Object.values(guests);
  const totalGuests  = guestList.length;
  const arrivedCount = guestList.filter(g => g.arrived).length;
  const pct          = totalGuests ? Math.round((arrivedCount / totalGuests) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07090E; color: #D4DDE8; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius: 2px; }
        @keyframes slideDown {
          from { opacity:0; transform: translateX(-50%) translateY(-16px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shrink { from { width:100%; } to { width:0%; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.85); opacity:0; } 60% { transform:scale(1.04); } 100% { transform:scale(1); opacity:1; } }
        input::placeholder { color: #2A3A50; }
      `}</style>

      <ResultToast result={result} onDismiss={() => setResult(null)} />

      <div style={{ minHeight: "100vh", background: "#07090E" }}>

        {/* Header */}
        <div style={{
          borderBottom: "1px solid #0E1420", padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10,
          background: "linear-gradient(180deg, #0A0F18, #07090E)",
        }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.25rem", color: "#C9A84C", fontWeight: 600 }}>
              🎰 Hugo Fest — Escáner
            </div>
            <div style={{ fontSize: "0.62rem", color: "#3D4F63",
              letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>
              Hugo Monroy · 20 Julio 2026
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {[
              { val: arrivedCount, label: "llegaron", color: "#2ECC8A" },
              { val: totalGuests - arrivedCount, label: "faltan", color: "#5A6B80" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color,
                  fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.58rem", color: "#3D4F63",
                  letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ height: 3, background: "#0E1420" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, #1A5C3A, #2ECC8A)",
            transition: "width 0.8s ease",
            boxShadow: "0 0 10px #2ECC8A50",
          }} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr min(360px, 38%)",
          minHeight: "calc(100vh - 70px)",
        }}>

          {/* Izquierda: cámara / manual */}
          <div style={{ padding: 24, borderRight: "1px solid #0E1420" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20,
              background: "#0A0F18", borderRadius: 10, padding: 4, width: "fit-content" }}>
              {[["camera","📷  Cámara"],["manual","⌨️  Manual"]].map(([id, label]) => (
                <button key={id} onClick={() => setMode(id)} style={{
                  padding: "8px 18px", borderRadius: 8, border: "none",
                  background: mode === id ? "#1A2744" : "transparent",
                  color: mode === id ? "#C9A84C" : "#3D4F63",
                  fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                }}>
                  {label}
                </button>
              ))}
            </div>

            {mode === "camera" && (
              <div>
                <QRCamera onScan={handleScan} />
                <div style={{ marginTop: 10, fontSize: "0.72rem", color: "#2A3A50",
                  textAlign: "center", letterSpacing: "0.08em" }}>
                  Centra el QR del invitado en el marco dorado
                </div>
              </div>
            )}

            {mode === "manual" && (
              <div>
                <div style={{ fontSize: "0.68rem", color: "#3D4F63",
                  letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                  ID del invitado
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  <input
                    value={manualId}
                    onChange={e => setManualId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleManual()}
                    placeholder="Escribe el ID o pega la URL del QR"
                    style={{
                      flex: 1, background: "#0A0F18", border: "1px solid #1E2A3A",
                      borderRadius: 8, padding: "11px 14px", color: "#D4DDE8",
                      fontSize: "0.88rem", outline: "none", fontFamily: "inherit",
                    }}
                  />
                  <button onClick={handleManual} style={{
                    padding: "11px 18px", borderRadius: 8, border: "none",
                    background: "linear-gradient(135deg, #C9A84C, #A88030)",
                    color: "#07090E", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                  }}>
                    Registrar
                  </button>
                </div>

                <div style={{ fontSize: "0.62rem", color: "#2A3A50",
                  letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                  Lista — clic para seleccionar
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6,
                  maxHeight: 420, overflowY: "auto" }}>
                  {guestList.map(g => (
                    <div key={g.id} onClick={() => !g.arrived && setManualId(g.id)} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderRadius: 8, cursor: g.arrived ? "default" : "pointer",
                      background: g.arrived ? "#0D3D28" : "#0A0F18",
                      border: `1px solid ${g.arrived ? "#2ECC8A25" : "#1E2A3A"}`,
                      opacity: g.arrived ? 0.55 : 1, transition: "all 0.2s",
                    }}>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 500,
                          color: g.arrived ? "#5A8B70" : "#D4DDE8" }}>{g.name}</div>
                        <div style={{ fontSize: "0.68rem", color: "#3D4F63" }}>
                          Mesa {g.table}
                        </div>
                      </div>
                      {g.arrived
                        ? <span style={{ fontSize: "0.7rem", color: "#2ECC8A" }}>✓ Registrado</span>
                        : <span style={{ fontSize: "0.68rem", color: "#2A3A50" }}>Seleccionar</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Derecha: log de llegadas */}
          <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.62rem", color: "#3D4F63", letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 16 }}>
              Registro · {arrivedCount}/{totalGuests}
            </div>

            {arrivals.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 14, opacity: 0.25 }}>🎫</div>
                <div style={{ fontSize: "0.82rem", color: "#2A3A50", lineHeight: 1.7 }}>
                  Los invitados aparecerán<br />aquí al escanear su QR
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto",
                display: "flex", flexDirection: "column", gap: 8 }}>
                {arrivals.map((a, i) => (
                  <div key={`${a.id}-${a.time}`} style={{
                    padding: "13px 15px", borderRadius: 8,
                    background: i === 0 ? "#0D3D28" : "#0A0F18",
                    border: `1px solid ${i === 0 ? "#2ECC8A35" : "#1E2A3A"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    animation: i === 0 ? "popIn 0.5s cubic-bezier(0.16,1,0.3,1)" : "fadeIn 0.3s ease",
                  }}>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600,
                        color: i === 0 ? "#2ECC8A" : "#D4DDE8" }}>{a.name}</div>
                      <div style={{ fontSize: "0.68rem", color: "#3D4F63", marginTop: 2 }}>
                        Mesa {a.table}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700,
                        color: i === 0 ? "#2ECC8A" : "#5A6B80",
                        fontFamily: "'Cormorant Garamond', serif" }}>{a.time}</div>
                      {i === 0 && (
                        <div style={{ fontSize: "0.58rem", color: "#2ECC8A80",
                          letterSpacing: "0.1em" }}>AHORA</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Progreso */}
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #0E1420" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                marginBottom: 7, fontSize: "0.72rem" }}>
                <span style={{ color: "#3D4F63" }}>Asistencia</span>
                <span style={{ color: "#C9A84C", fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: "#0E1420", borderRadius: 3 }}>
                <div style={{
                  height: "100%", borderRadius: 3, width: `${pct}%`,
                  background: "linear-gradient(90deg, #1A5C3A, #2ECC8A)",
                  transition: "width 0.8s ease",
                }} />
              </div>
              <div style={{ fontSize: "0.68rem", color: "#2A3A50",
                marginTop: 6, textAlign: "center" }}>
                {arrivedCount} de {totalGuests} invitados registrados
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
