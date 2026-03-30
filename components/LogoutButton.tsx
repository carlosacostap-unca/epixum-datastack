"use client";

import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";

export default function LogoutButton({ className, iconOnly }: { className?: string, iconOnly?: boolean }) {
  const router = useRouter();

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className={className}>
      <span className="material-symbols-outlined">logout</span>
      {!iconOnly && <span>Cerrar Sesión</span>}
    </button>
  );
}