import { createServerClient, getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import LoginScreen from "@/components/LoginScreen";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getCurrentUser();

  // Redirect based on role if already logged in
  if (user) {
    if (user.role === 'docente') {
      redirect('/docentes');
    } else if (user.role === 'admin') {
      redirect('/admin/courses');
    } else if (user.role === 'estudiante') {
      redirect('/estudiantes');
    }
  }

  // Si no está logueado, mostramos la pantalla de login (que ahora es el inicio)
  return <LoginScreen />;
}
