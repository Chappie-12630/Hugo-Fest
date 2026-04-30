# 🎰 Hugo Fest — Sistema de Invitaciones

Aplicación web para la fiesta de cumpleaños de **Hugo Monroy** · Noche de Casino · 20 Julio 2026.

---

## 📁 Estructura de archivos

```
hugo-fest/
├── app/
│   ├── layout.jsx                  ← Layout raíz (metadatos)
│   ├── page.jsx                    ← Redirige a /admin
│   ├── admin/page.jsx              ← Panel de administración
│   ├── entrada/page.jsx            ← Escáner QR de entrada
│   ├── invitado/[id]/page.jsx      ← Página pública del invitado
│   └── api/send-invite/route.js   ← API de envío (Email + WhatsApp)
├── components/
│   ├── AdminPanel.jsx              ← Panel admin completo
│   ├── EscanerEntrada.jsx          ← Escáner QR con cámara (PIN: 5296)
│   ├── InvitacionPublica.jsx       ← Invitación con countdown y RSVP
│   └── SendInviteModal.jsx         ← Modal de envío por email / WhatsApp
├── lib/
│   ├── firebase.js                 ← Configuración Firebase
│   ├── auth.js                     ← Login admin
│   └── guests.js                   ← CRUD de invitados (Firestore)
├── firestore.rules                 ← Reglas de seguridad Firestore
├── .env.example                    ← Variables de entorno (copia como .env.local)
├── next.config.mjs
└── package.json
```

---

## 🚀 Setup paso a paso

### 1. Firebase
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto llamado `hugo-fest`
3. Activa **Firestore Database** (modo producción)
4. Activa **Authentication** → Email/Password
5. Crea un usuario admin en Authentication → Add user
6. Ve a **Project Settings → General → Your apps → Web app**
7. Copia las credenciales al `.env.local`
8. Pega las reglas de `firestore.rules` en **Firestore → Rules**

### 2. Variables de entorno
```bash
cp .env.example .env.local
# Rellena todos los valores en .env.local
```

### 3. Desarrollo local
```bash
npm install
npm run dev
# Abre http://localhost:3000
```

### 4. Vercel (producción)
```bash
# Opción A: desde la CLI
npx vercel --prod

# Opción B: conecta el repo de GitHub en vercel.com
# Ve a Settings → Environment Variables y agrega todas las del .env.example
```

> ⚠️ Después de publicar, actualiza la URL en:
> - `NEXT_PUBLIC_VERCEL_URL` en Vercel
> - Vercel la detecta automáticamente si usas su dominio

---

## 🔑 Accesos

| URL               | Descripción                              |
|-------------------|------------------------------------------|
| `/admin`          | Panel admin (requiere login Firebase)    |
| `/entrada`        | Escáner QR (PIN: **5296**)              |
| `/invitado/[id]`  | Página pública del invitado              |

---

## 📧 Servicios externos (opcionales para envío)

| Servicio | Para qué | Plan gratis |
|----------|----------|-------------|
| [Resend](https://resend.com) | Emails HTML | 3,000/mes |
| [Twilio](https://twilio.com) | WhatsApp | Sandbox gratis |

> Si no configuras Resend/Twilio, la app funciona igual. Solo el botón de envío dará error.

---

## 🖼️ Fotos de Hugo

Para agregar las fotos a la web:
1. Ve a **Firebase Console → Storage**
2. Sube las fotos con estos nombres: `hugo-1.jpg`, `hugo-2.jpg`, `hugo-3.jpg`
3. Copia las URLs públicas y reemplaza los placeholders en `InvitacionPublica.jsx`

---

## 🔐 Cambiar PIN del escáner

En Vercel → Settings → Environment Variables:
```
NEXT_PUBLIC_SCANNER_PIN = tu_nuevo_pin
```

---

## 📌 TODOs pendientes

- [ ] Agregar URL real de Vercel en `.env` (tras publicar)
- [ ] Subir fotos de Hugo a Firebase Storage
- [ ] Confirmar lugar del evento (actualizar en `InvitacionPublica.jsx` y `route.js`)
- [ ] Configurar dominio personalizado en Vercel (opcional)
