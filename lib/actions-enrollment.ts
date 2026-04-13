"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import { sendApprovalEmail } from "./email";

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

  // Adjust birthDate to 12:00:00 UTC to avoid timezone boundary shifts
  const birthDateISO = `${birthDate}T12:00:00.000Z`;

  try {
    await pb.collection("enrollment_requests").create({
      firstName,
      lastName,
      dni,
      birthDate: birthDateISO,
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
    // 1. Obtener los detalles de la solicitud
    const request = await pb.collection("enrollment_requests").getOne(id);
    
    // 2. Actualizar el estado
    await pb.collection("enrollment_requests").update(id, { status });

    // 3. Si es aprobada, crear usuario, matricularlo y enviar email
    if (status === "approved") {
      let studentId = "";
      
      // Buscar si el usuario ya existe por email (requiere que el rol docente pueda listar/buscar usuarios)
      const existingUsers = await pb.collection("users").getList(1, 1, {
        filter: `email="${request.email}"`,
        requestKey: null
      });

      if (existingUsers.items.length > 0) {
        studentId = existingUsers.items[0].id;
      } else {
        // Crear nuevo usuario (requiere que el rol docente pueda crear usuarios)
        const randomPassword = Math.random().toString(36).slice(-12) + "A1@";
        
        const newUser = await pb.collection("users").create({
          email: request.email,
          password: randomPassword,
          passwordConfirm: randomPassword,
          role: "estudiante",
          name: `${request.firstName} ${request.lastName}`.trim(),
          firstName: request.firstName,
          lastName: request.lastName,
          dni: request.dni,
          phone: request.phone,
          birthDate: request.birthDate,
          emailVisibility: true
        });
        
        studentId = newUser.id;
      }

      // Matricular al estudiante en los cursos solicitados (requiere que el rol docente pueda actualizar cursos)
      if (request.courses && Array.isArray(request.courses)) {
        for (const courseId of request.courses) {
          try {
            const course = await pb.collection("courses").getOne(courseId);
            const currentStudents = course.students || [];
            
            if (!currentStudents.includes(studentId)) {
              await pb.collection("courses").update(courseId, {
                students: [...currentStudents, studentId]
              });
            }
          } catch (err: any) {
            console.error(`Error al matricular estudiante en el curso ${courseId}:`, err);
          }
        }
      }

      // 4. Enviar notificación por email
      await sendApprovalEmail(request.email, request.firstName);
    }

    revalidatePath("/admin/enrollments");
    revalidatePath("/docentes/solicitudes");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar estado de solicitud:", error);
    return { success: false, error: "Error al actualizar la solicitud." };
  }
}
