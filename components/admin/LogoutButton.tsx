"use client";

import { logout } from "@/app/admin/login/actions";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="font-heading text-sm text-muted hover:text-accent transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
