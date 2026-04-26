// app/invitado/[id]/page.jsx
"use client";
import InvitacionPublica from "../../../components/InvitacionPublica";
export default function InvitadoPage({ params }) {
  return <InvitacionPublica guestId={params.id} />;
}
