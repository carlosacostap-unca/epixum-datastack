import { createServerClient } from "@/lib/pocketbase-server";
import { NextResponse } from "next/server";
import { sendApprovalEmail } from "@/lib/email";

export async function GET() {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== "admin" && user.role !== "docente")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Obtenemos todas las solicitudes aprobadas
    const requests = await pb.collection("enrollment_requests").getFullList({
      filter: 'status="approved"',
    });

    const results = [];
    
    for (const req of requests) {
      const emailResult = await sendApprovalEmail(req.email, req.firstName);
      results.push({ email: req.email, name: req.firstName, result: emailResult });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Emails procesados: ${results.length}`, 
      results 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}