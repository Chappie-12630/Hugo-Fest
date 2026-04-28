// lib/guests.js
import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "guests";

// Obtener todos los invitados (una vez)
export async function getAllGuests() {
  const snap = await getDocs(query(collection(db, COL), orderBy("name")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Obtener un invitado por ID
export async function getGuest(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Escuchar cambios en tiempo real
export function subscribeGuests(cb) {
  return onSnapshot(
    query(collection(db, COL), orderBy("name")),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

// Agregar invitado
export async function addGuest({ name, email, phone, table, menu }) {
  const ref = await addDoc(collection(db, COL), {
    name,
    email:     email  || "",
    phone:     phone  || "",
    table:     Number(table) || 1,
    menu:      menu   || "Menú fijo",
    rsvp:      "pending",
    arrived:   false,
    arrivedAt: null,
    rsvpAt:    null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Actualizar RSVP desde la página pública
export async function updateRSVP(id, rsvp) {
  await updateDoc(doc(db, COL, id), {
    rsvp,
    rsvpAt: serverTimestamp(),
  });
}

// Registrar llegada desde el escáner
export async function markArrived(id) {
  await updateDoc(doc(db, COL, id), {
    arrived:   true,
    arrivedAt: serverTimestamp(),
  });
}

// Actualizar datos de un invitado
export async function updateGuest(id, data) {
  await updateDoc(doc(db, COL, id), data);
}

// Eliminar invitado
export async function deleteGuest(id) {
  await deleteDoc(doc(db, COL, id));
}
