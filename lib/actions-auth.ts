"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "./pocketbase-server";

export async function setAuthCookieAndRedirect(token: string, model: any) {
  // Configurar la cookie del lado del servidor para asegurar que Next.js la reconozca inmediatamente
  const cookieStore = await cookies();
  cookieStore.set("pb_auth", token, {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  // Redirigir según el rol
  const role = model?.role;
  if (role === "docente") {
    redirect("/docentes");
  } else if (role === "admin") {
    redirect("/admin/courses");
  } else if (role === "estudiante") {
    redirect("/estudiantes");
  } else {
    redirect("/");
  }
}

export async function clearAuthCookieAndRedirect() {
  const cookieStore = await cookies();
  cookieStore.delete("pb_auth");
  redirect("/login");
}
