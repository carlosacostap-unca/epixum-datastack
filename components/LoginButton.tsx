"use client";

import { useState } from "react";
import pb from "@/lib/pocketbase";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const authData = await pb.collection("users").authWithOAuth2({ provider: "google" });
      
      // Si el usuario no tiene rol (primera vez), se lo asignamos
      if (!authData.record.role) {
        try {
          const updateData: any = {
            role: "estudiante"
          };

          // Extraer nombre y apellido de Google si están disponibles
          const meta = authData.meta;
          if (meta) {
            // Google suele enviar 'given_name' y 'family_name' en el meta
            // También puede enviar 'name' completo
            const firstName = meta.givenName || meta.given_name || "";
            const lastName = meta.familyName || meta.family_name || "";
            const fullName = meta.name || "";

            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;

            // Aseguramos que el campo 'name' tenga el nombre completo
            if (firstName || lastName) {
                updateData.name = `${firstName} ${lastName}`.trim();
            } else if (fullName) {
                updateData.name = fullName;
                // Intentamos separar si no tenemos first/last explícitos
                const parts = fullName.split(' ');
                if (parts.length > 1) {
                    updateData.firstName = parts[0];
                    updateData.lastName = parts.slice(1).join(' ');
                } else {
                    updateData.firstName = fullName;
                }
            }
          }

          // Asignar rol de estudiante y datos de perfil
          await pb.collection("users").update(authData.record.id, updateData);
          
          // Actualizar el modelo local con los nuevos datos
          authData.record.role = "estudiante";
          if (updateData.firstName) authData.record.firstName = updateData.firstName;
          if (updateData.lastName) authData.record.lastName = updateData.lastName;
          if (updateData.name) authData.record.name = updateData.name;
          
          pb.authStore.save(pb.authStore.token, authData.record);
        } catch (err) {
          console.error("No se pudo asignar el rol o datos automáticamente. Verifica las API Rules.", err);
        }
      }

      // Save the auth data to a cookie so the server can access it
      // The default exportToCookie() includes secure, httpOnly, sameSite, path, etc.
      // We set httpOnly: false so that we can read it on the client if needed, 
      // but primarily so we can set it via document.cookie.
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false });

      // Redirect to home page
      router.push("/");
      router.refresh(); // Refresh to update server components
    } catch (error) {
      console.error("Login failed:", error);
      alert("Error al iniciar sesión con Google. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-[var(--color-secondary)] text-white font-bold text-sm tracking-widest uppercase shadow-[0_10px_30px_-10px_rgba(20,24,235,0.4)] hover:shadow-[0_15px_40px_-10px_rgba(20,24,235,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
    >
      {loading ? (
        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
      ) : (
        <>
          <svg className="w-5 h-5 bg-white p-1 rounded-sm" viewBox="0 0 24 24">
            <path d="M12 5.04c1.64 0 3.12.56 4.28 1.66l3.21-3.21C17.51 1.6 14.97 1 12 1 7.4 1 3.48 3.65 1.61 7.53l3.65 2.84C6.13 7.15 8.83 5.04 12 5.04z" fill="#EA4335"></path>
            <path d="M23.49 12.27c0-.82-.07-1.61-.21-2.37H12v4.5h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.85c2.15-1.98 3.75-4.91 3.75-8.56z" fill="#4285F4"></path>
            <path d="M5.26 14.73l-3.65 2.84c1.87 3.88 5.79 6.53 10.39 6.53 2.97 0 5.49-1.18 7.33-3.19l-3.68-2.85c-1.02.68-2.32 1.09-3.65 1.09-2.73 0-5.04-1.84-5.87-4.42z" fill="#FBBC05"></path>
            <path d="M12 23.1c2.97 0 5.49-1.18 7.33-3.19l-3.68-2.85c-1.02.68-2.32 1.09-3.65 1.09-2.73 0-5.04-1.84-5.87-4.42l-3.65 2.84C3.48 20.45 7.4 23.1 12 23.1z" fill="#34A853"></path>
          </svg>
          <span className="text-sm font-bold text-white tracking-widest uppercase">Continuar con Google</span>
        </>
      )}
    </button>
  );
}
