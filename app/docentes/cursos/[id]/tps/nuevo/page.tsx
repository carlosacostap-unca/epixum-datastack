import { getCourse } from "@/lib/data";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NewAssignmentForm from "./NewAssignmentForm";

export default async function NewCourseAssignmentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();

  if (!user || user.role !== "docente") {
    redirect("/");
  }

  const course = await getCourse(params.id);
  if (!course || !course.teachers?.includes(user.id)) {
    redirect("/docentes");
  }

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full h-full flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Link
          href={`/docentes/cursos/${course.id}`}
          className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors mb-8 md:mb-16 group"
        >
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-bold text-sm tracking-widest uppercase">Volver al curso</span>
        </Link>

        <header className="mb-10 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"></span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
              Trabajo práctico
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-headline tracking-tight text-[var(--color-on-surface)] mb-4">
            Crear nuevo trabajo práctico
          </h1>
          <p className="text-[var(--color-on-surface-variant)] text-lg">
            Añade un trabajo práctico al curso <strong className="text-[var(--color-on-surface)] font-medium">{course.title}</strong>.
          </p>
        </header>

        <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 md:p-10 border border-[var(--color-outline-variant)] shadow-[0_0_40px_rgba(0,0,0,0.2)]">
          <NewAssignmentForm courseId={course.id} />
        </div>
      </div>
    </div>
  );
}
