"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactMessage(formData: FormData) {
  const nombre = ((formData.get("nombre") as string) ?? "").trim().slice(0, 100);
  const email = ((formData.get("email") as string) ?? "").trim().slice(0, 150);
  const asunto = ((formData.get("asunto") as string) ?? "").trim().slice(0, 150);
  const mensaje = ((formData.get("mensaje") as string) ?? "").trim().slice(0, 3000);

  // Campo trampa para bots: un input que un humano nunca ve ni llena
  // (está oculto visualmente pero sigue existiendo en el HTML, así
  // que un bot que completa "todos los campos" automáticamente cae
  // en la trampa). Si viene con algo escrito, descartamos el mensaje
  // en silencio, como si se hubiera enviado bien, para no darle a un
  // bot ninguna pista de que fue detectado.
  const honeypot = (formData.get("sitio_web") as string) ?? "";
  if (honeypot.trim() !== "") {
    redirect("/contacto?success=1");
  }

  if (!nombre) redirect(`/contacto?error=${encodeURIComponent("Falta tu nombre.")}`);
  if (!email || !EMAIL_RE.test(email)) {
    redirect(`/contacto?error=${encodeURIComponent("El email no parece válido.")}`);
  }
  if (!mensaje) redirect(`/contacto?error=${encodeURIComponent("Falta el mensaje.")}`);

  const supabase = await createClient();
  const { error } = await supabase.from("mensajes_contacto").insert({ nombre, email, asunto, mensaje });

  if (error) {
    redirect(
      `/contacto?error=${encodeURIComponent(
        "No pudimos guardar tu mensaje. Probá de nuevo en un momento."
      )}`
    );
  }

  redirect("/contacto?success=1");
}
