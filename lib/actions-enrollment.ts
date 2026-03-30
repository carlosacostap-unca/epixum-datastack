"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";

export async function submitEnrollmentRequest(formData: FormData) {
  const pb = await createServerClient();
  
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const dni = formData.get("dni") as string;
  const birthDate = formData.get("birthDate") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const coursesRaw = formData.getAll("courses");
  const courses = coursesRaw.map(id => id.toString().trim()).filter(Boolean);

  if (!firstName || !lastName || !dni || !birthDate || !email || !phone || courses.length === 0) {
    return { success: false, error: "Todos los campos y al menos un curso son requeridos." };
  }

  try {
    await pb.collection("enrollment_requests").create({
      firstName,
      lastName,
      dni,
      birthDate,
      email,
      phone,
      courses,
      status: "pending"
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error al enviar solicitud de matrícula:", error);
    if (error?.response?.data) {
      console.error("Detalles de validación PocketBase:", JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: "Ocurrió un error al enviar la solicitud." };
  }
}

export async function updateEnrollmentStatus(id: string, status: "approved" | "rejected") {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== "docente" && user.role !== "admin")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    await pb.collection("enrollment_requests").update(id, { status });
    revalidatePath("/admin/enrollments");
    revalidatePath("/docentes/solicitudes");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar estado de solicitud:", error);
    return { success: false, error: "Error al actualizar la solicitud." };
  }
}
