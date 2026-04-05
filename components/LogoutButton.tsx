"use client";

import { useTransition } from "react";
import pb from "@/lib/pocketbase";
import { clearAuthCookieAndRedirect } from "@/lib/actions-auth";

export default function LogoutButton({ className, iconOnly }: { className?: string, iconOnly?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    // Limpiar auth store del lado del cliente
    pb.authStore.clear();
    
    // Limpiar cookie httpOnly y redirigir
    startTransition(() => {
      clearAuthCookieAndRedirect();
    });
  };

  return (
    <button onClick={handleLogout} className={className} disabled={isPending}>
      <span className="material-symbols-outlined">{isPending ? "hourglass_empty" : "logout"}</span>
      {!iconOnly && <span>{isPending ? "Cerrando..." : "Cerrar Sesión"}</span>}
    </button>
  );
}