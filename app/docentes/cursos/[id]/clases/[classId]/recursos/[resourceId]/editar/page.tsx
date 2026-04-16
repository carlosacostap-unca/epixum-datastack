import { createServerClient } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditResourceForm from "./EditResourceForm";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string; classId: string; resourceId: string }>;
}) {
  const pb = await createServerClient();
  const user = pb.authStore.model;
  const resolvedParams = await params;
  const { id: courseId, classId, resourceId } = resolvedParams;

  if (!user || (user.role !== "docente" && user.role !== "admin")) {
    redirect("/");
  }

  let course;
  let classData;
  let resource: any;

  try {
    course = await pb.collection("courses").getOne(courseId);
    classData = await pb.collection("classes").getOne(classId);
    resource = await pb.collection("links").getOne(resourceId);
  } catch (error) {
    console.error("Error fetching data:", error);
    redirect("/docentes");
  }

  // Verificar si el recurso pertenece a la clase
  if (resource.class !== classId) {
    redirect(`/docentes/cursos/${courseId}/clases/${classId}`);
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)] min-h-screen">
      {/* Hero Header */}
      <header className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface-container-low)] to-[var(--color-background)] z-0"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay z-0"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--color-primary)] opacity-10 rounded-full blur-[100px] z-0"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="mb-8">
            <Link 
              href={`/docentes/cursos/${courseId}/clases/${classId}`}
              className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors font-medium text-sm bg-[var(--color-surface-container-low)] px-4 py-2 rounded-full border border-[var(--color-outline-variant)]"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Volver a la clase
            </Link>
          </div>
          
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--color-surface-container)] flex items-center justify-center shadow-lg border border-[var(--color-outline-variant)]">
              <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">
                edit_document
              </span>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2">
                Editar Recurso
              </p>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-[var(--color-on-surface)] tracking-tight">
                {resource.title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 -mt-16 relative z-20 px-6 pb-24">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-[var(--color-outline-variant)] backdrop-blur-xl">
            <EditResourceForm courseId={courseId} classId={classId} resource={resource} />
          </div>
        </div>
      </main>
    </div>
  );
}