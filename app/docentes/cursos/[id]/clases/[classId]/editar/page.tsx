import { getCourse, getClass } from "@/lib/data";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditClassForm from "./EditClassForm";

export default async function EditClassPage(props: { params: Promise<{ id: string, classId: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user || user.role !== "docente") {
    redirect("/");
  }

  const course = await getCourse(params.id);
  const classData = await getClass(params.classId);

  if (!course || !classData) {
    redirect("/docentes");
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-body p-8 md:p-12 max-w-[1600px] mx-auto">
      <div className="mb-12">
        <Link 
          href={`/docentes/cursos/${course.id}/clases/${classData.id}`}
          className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors font-bold text-sm tracking-wide uppercase"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a la clase
        </Link>
      </div>

      <header className="mb-16">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)] mb-6">
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
          <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-on-surface)] uppercase">Editar Clase</span>
          <span className="text-[var(--color-on-surface-variant)]">•</span>
          <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-on-surface-variant)] uppercase">{course.title}</span>
        </div>
        
        <h1 className="text-5xl font-headline tracking-tight text-[var(--color-on-surface)] leading-tight max-w-3xl">
          Editar la información de la clase
        </h1>
      </header>

      <div className="flex justify-start">
        <EditClassForm courseId={course.id} classData={classData} />
      </div>
    </div>
  );
}
