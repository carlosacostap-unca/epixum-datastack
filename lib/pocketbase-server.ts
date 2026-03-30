import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

import { User } from '@/types';

// Server-side helper to get authenticated instance
export async function createServerClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pb_auth')?.value;
  
  console.log("Servidor leyendo cookie 'pb_auth':", token ? "Token encontrado" : "No hay token");

  // Access via bracket notation to prevent build-time inlining and ensure runtime access
  const url = process.env['NEXT_PUBLIC_POCKETBASE_URL'];
  
  if (!url) {
    console.error("CRITICAL ERROR: NEXT_PUBLIC_POCKETBASE_URL is not set in the server environment.");
  }

  const serverPb = new PocketBase(url);
  
  if (token) {
    try {
      // Necesitamos pasar un string JSON para que loadFromCookie funcione correctamente, 
      // o usar el método save() para inicializar el store manualmente si solo tenemos el token
      // Ya que Pocketbase espera que la cookie sea de la forma 'pb_auth=JSON_STRING'
      // Vamos a intentar un enfoque más directo:
      
      // Intentamos reconstruir un estado básico asumiendo que el token es válido
      // La mejor forma es que la Server Action guarde el JSON completo
      serverPb.authStore.save(token, null);
      
      // Refrescamos el usuario para obtener el modelo (ya que guardamos el modelo como null)
      if (serverPb.authStore.isValid) {
         try {
           await serverPb.collection('users').authRefresh();
           console.log("Token refrescado y modelo obtenido:", serverPb.authStore.model?.email);
         } catch (refreshErr) {
           console.error("Error al refrescar token:", refreshErr);
           serverPb.authStore.clear(); // Si falla el refresh, el token no es válido
         }
      }
    } catch (e) {
      console.error("Error cargando auth store:", e);
    }
  }

  return serverPb;
}

export async function getCurrentUser() {
  const pb = await createServerClient();
  if (!pb.authStore.isValid) return null;
  try {
    return pb.authStore.model as unknown as User;
  } catch (e) {
    return null;
  }
}
