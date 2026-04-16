"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCourseDocente } from "@/lib/actions-courses";
import { Course } from "@/types";
import { format } from "date-fns";

export default function EditCourseForm({ course }: { course: Course }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Convertir fechas locales a UTC
    const startDate = formData.get("startDate") as string;
    if (startDate && !startDate.includes('T')) {
      const date = new Date(`${startDate}T00:00:00`);
      formData.set("startDate", date.toISOString());
    }
    const endDate = formData.get("endDate") as string;
    if (endDate && !endDate.includes('T')) {
      const date = new Date(`${endDate}T00:00:00`);
      formData.set("endDate", date.toISOString());
    }

    const result = await updateCourseDocente(course.id, formData);

    if (result.success) {
      router.push(`/docentes/cursos/${course.id}`);
      router.refresh();
    } else {
      setError(result.error || "Ocurrió un error al actualizar el curso.");
      setIsLoading(false);
    }
  };

  const defaultStartDate = course.startDate ? format(new Date(course.startDate), "yyyy-MM-dd") : "";
  const defaultEndDate = course.endDate ? format(new Date(course.endDate), "yyyy-MM-dd") : "";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl bg-[var(--color-surface-container-low)] p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-[var(--color-outline-variant)]">
      {error && (
        <div className="bg-[#FFB4A4]/10 text-[#FFB4A4] p-4 rounded-xl border border-[#FFB4A4]/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-xl">error</span>
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {/* Title Field */}
      <div className="flex flex-col gap-2 group">
        <label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
          Título del Curso *
        </label>
        <div className="relative">
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={course.title}
            className="w-full bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all font-body placeholder:text-[var(--color-on-surface-variant)]/50"
            placeholder="Ej: Introducción a la Programación"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
            title
          </span>
        </div>
      </div>

      {/* Description Field */}
      <div className="flex flex-col gap-2 group">
        <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
          Descripción del Curso *
        </label>
        <div className="relative">
          <textarea
            id="description"
            name="description"
            required
            defaultValue={course.description}
            rows={4}
            className="w-full bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all font-body resize-y min-h-[120px] placeholder:text-[var(--color-on-surface-variant)]/50"
            placeholder="Describe los objetivos y contenido del curso..."
          />
          <span className="material-symbols-outlined absolute left-4 top-6 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
            description
          </span>
        </div>
      </div>

      {/* Dates Field */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="flex flex-col gap-2 group">
          <label htmlFor="startDate" className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
            Fecha de Inicio *
          </label>
          <div className="relative">
            <input
              type="date"
              id="startDate"
              name="startDate"
              required
              defaultValue={defaultStartDate}
              className="w-full bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all font-body [color-scheme:dark]"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
              event
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 group">
          <label htmlFor="endDate" className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
            Fecha de Fin *
          </label>
          <div className="relative">
            <input
              type="date"
              id="endDate"
              name="endDate"
              required
              defaultValue={defaultEndDate}
              className="w-full bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all font-body [color-scheme:dark]"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
              event_upcoming
            </span>
          </div>
        </div>
      </div>

      {/* Status Field */}
      <div className="flex flex-col gap-2 group">
        <label htmlFor="status" className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">
          Estado del Curso
        </label>
        <div className="relative">
          <select
            id="status"
            name="status"
            defaultValue={course.status}
            className="w-full appearance-none bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all font-body cursor-pointer"
          >
            <option value="borrador">Borrador</option>
            <option value="en curso">En Curso</option>
            <option value="finalizado">Finalizado</option>
          </select>
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)] transition-colors pointer-events-none">
            flag
          </span>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] pointer-events-none">
            expand_more
          </span>
        </div>
      </div>

      <div className="pt-6 border-t border-[var(--color-outline-variant)] flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-8 py-4 bg-[var(--color-primary)] text-[#000000] rounded-full font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(63,255,139,0.3)] hover:shadow-[0_0_30px_rgba(63,255,139,0.5)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2`}
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span>Guardar Cambios</span>
              <span className="material-symbols-outlined">save</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}