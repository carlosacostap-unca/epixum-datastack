import { getCourse, getClass } from "@/lib/data";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NewResourceForm from "./NewResourceForm";

export default async function TeacherNewResourcePage(props: { params: Promise<{ id: string, classId: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user || user.role !== "docente") {
    redirect("/");
  }

  const course = await getCourse(params.id);
  if (!course) {
    redirect("/docentes");
  }

  const classData = await getClass(params.classId);
  if (!classData || classData.course !== course.id) {
    redirect(`/docentes/cursos/${course.id}`);
  }

  return (
    <div className="flex-1 p-12 overflow-y-auto w-full h-full">
      {/* Back button */}
      <Link 
        href={`/docentes/cursos/${course.id}/clases/${classData.id}`} 
        className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors mb-12 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-bold text-sm tracking-widest uppercase">Volver a la clase</span>
      </Link>

      {/* Hero Section */}
      <header className="mb-16 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"></span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
            Añadir Recurso
          </span>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ml-4 bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)]">
            {classData.title}
          </span>
        </div>
        
        <h1 className="text-5xl font-headline tracking-tight text-[var(--color-on-surface)] mb-6 leading-tight">
          Nuevo Recurso
        </h1>
        <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed">
          Añadí material de estudio para tus estudiantes. Podés compartir un enlace web a documentación o subir un archivo directamente.
        </p>
      </header>

      {/* Form */}
      <NewResourceForm courseId={course.id} classId={classData.id} />
    </div>
  );
}