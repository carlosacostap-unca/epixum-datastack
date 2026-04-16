"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import PocketBase from "pocketbase";
import { revalidatePath } from "next/cache";

export async function submitAccountRequest(formData: FormData) {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (!url) {
    return { success: false, error: "PocketBase URL not configured" };
  }

  const pb = new PocketBase(url);

  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return { success: false, error: "Admin credentials not configured" };
  }

  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
  } catch (error) {
    return { success: false, error: "Failed to authenticate as admin" };
  }

  const lastName = formData.get("lastName")?.toString().trim();
  const firstName = formData.get("firstName")?.toString().trim();
  const dni = formData.get("dni")?.toString().trim();
  const googleEmail = formData.get("googleEmail")?.toString().trim();

  if (!lastName || !firstName || !dni || !googleEmail) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  try {
    await pb.collection("account_requests").create({
      lastName,
      firstName,
      dni,
      googleEmail,
      status: "pendiente",
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error al guardar solicitud:", error.message);
    return { success: false, error: "Ocurrió un error al enviar tu solicitud. Intenta nuevamente." };
  }
}

export async function updateAccountRequestStatus(id: string, status: "pendiente" | "resuelto") {
  const pb = await createServerClient();
  
  if (!pb.authStore.isValid || (pb.authStore.model?.role !== "admin" && pb.authStore.model?.role !== "docente")) {
    throw new Error("No autorizado");
  }

  try {
    await pb.collection("account_requests").update(id, { status });
    revalidatePath("/docentes/solicitudes");
    revalidatePath("/admin/enrollments");
    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar solicitud de cuenta:", error.message);
    return { success: false, error: "Ocurrió un error al actualizar la solicitud." };
  }
}
