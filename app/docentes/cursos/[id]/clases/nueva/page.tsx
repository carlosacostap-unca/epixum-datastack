import { getCourse } from "@/lib/data";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NewClassForm from "./NewClassForm";

export default async function NewClassPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user || user.role !== "docente") {
    redirect("/");
  }

  const course = await getCourse(params.id);
  if (!course) {
    redirect("/docentes");
  }

  return (
    <div className="flex-1 p-12 overflow-y-auto w-full h-full flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Back button */}
        <Link 
          href={`/docentes/cursos/${course.id}`} 
          className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors mb-16 group"
        >
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-bold text-sm tracking-widest uppercase">Volver al curso</span>
        </Link>

        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"></span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
              Planificación
            </span>
          </div>
          <h1 className="text-5xl font-headline tracking-tight text-[var(--color-on-surface)] mb-4">
            Programar nueva clase
          </h1>
          <p className="text-[var(--color-on-surface-variant)] text-lg">
            Añade una nueva sesión al curso <strong className="text-[var(--color-on-surface)] font-medium">{course.title}</strong>.
          </p>
        </header>

        {/* Form */}
        <NewClassForm courseId={course.id} />
      </div>
    </div>
  );
}
