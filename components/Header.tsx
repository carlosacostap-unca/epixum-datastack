"use client";

import { usePathname, useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { User } from "@/types";
import { clearAuthCookieAndRedirect } from "@/lib/actions-auth";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Ensure we have the latest auth state from cookie
    pb.authStore.loadFromCookie(document.cookie);
    
    // Refresh user data from server to get latest role
    const refreshUser = async () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        try {
          const updatedUser = await pb.collection('users').getOne(pb.authStore.model.id);
          // Update auth store with fresh data
          pb.authStore.save(pb.authStore.token, updatedUser);
          // Update cookie
          document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
          setUser(updatedUser as unknown as User);
        } catch (e: any) {
          if (e?.status === 404 || e?.status === 401 || e?.status === 403) {
            console.warn("No se pudo actualizar los datos del usuario (posible sesión expirada o falta de permisos).");
          } else {
            console.warn("Error de red al intentar actualizar el usuario:", e);
          }
          // Fallback to the current user model in the store
          setUser(pb.authStore.model as unknown as User);
        }
      } else {
         setUser(pb.authStore.model as unknown as User);
      }
      setIsLoading(false);
    };

    refreshUser();

    // Subscribe to auth changes to update UI
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model as unknown as User);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Don't show header on login page
  if (pathname === "/login") {
    return null;
  }

  // Hide header for specific routes that have their own layout (like docentes dashboard)
  if (pathname.startsWith("/docentes") || pathname.startsWith("/estudiantes")) {
    return null;
  }

  // Hide while loading to prevent flashing the header for courses
  if (isLoading && (pathname === "/" || pathname.startsWith("/courses/"))) {
    return null;
  }

  // Hide header for guests on the home page (removes logo and Ingresar button)
  if (!isLoading && !user && pathname === "/") {
    return null;
  }

  // Don't show default header for docente dashboard and course pages, as they have their own layout
  if (user?.role === 'docente' && (pathname === "/" || pathname.startsWith("/courses/"))) {
    return null;
  }

  const handleLogout = () => {
    pb.authStore.clear();
    startTransition(() => {
      clearAuthCookieAndRedirect();
    });
  };

  return (
    <header className="bg-[var(--color-background)] py-6 px-6 relative z-50">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        <Link href="/" className="font-headline font-bold text-xl text-[var(--color-on-surface)] hover:opacity-80 transition-opacity flex items-center gap-3">
          <Image 
            src="/epixum-logo.png" 
            alt="Epixum Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8 object-contain"
          />
          <span>Epixum - Data Stack</span>
        </Link>
        <div className="flex items-center gap-6">
          {user?.role === 'admin' && (
            <>
              <Link 
                href="/admin/users" 
                className="text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
              >
                Usuarios
              </Link>
              <Link 
                href="/admin/courses" 
                className="text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
              >
                Cursos
              </Link>
              <Link 
                href="/admin/enrollments" 
                className="text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
              >
                Solicitudes
              </Link>
            </>
          )}
          {user ? (
            <div className="flex items-center gap-6">
              <Link href="/profile" className="flex items-center gap-3 px-4 py-2 bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] rounded-full transition-colors border border-[var(--color-outline-variant)]">
                {user.avatar ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`} 
                    className="w-6 h-6 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <span className="material-symbols-outlined text-[1.25rem] text-[var(--color-on-surface-variant)]">account_circle</span>
                )}
                <span className="text-sm font-medium text-[var(--color-on-surface)]">
                 {user.name} 
                 <span className="ml-2 text-[var(--color-on-surface-variant)] font-normal">({user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Estudiante'})</span>
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                disabled={isPending}
                className="text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[1.25rem]">{isPending ? "hourglass_empty" : "logout"}</span>
                <span className="hidden sm:inline">{isPending ? "Cerrando..." : "Cerrar Sesión"}</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="text-sm font-bold text-[var(--color-on-surface)] bg-[var(--color-surface-container-highest)] hover:bg-[var(--color-surface-container)] px-6 py-3 rounded-full transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[1.25rem]">login</span>
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
