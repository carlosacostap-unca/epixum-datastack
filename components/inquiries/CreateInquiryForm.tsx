"use client";

import { useState, useEffect } from "react";
import { createInquiry } from "@/lib/actions-inquiries";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Class, Assignment } from "@/types";

interface CreateInquiryFormProps {
  initialClassId?: string;
  initialAssignmentId?: string;
  courseId?: string;
  classes: Class[];
  assignments: Assignment[];
}

export default function CreateInquiryForm({ initialClassId, initialAssignmentId, courseId, classes, assignments }: CreateInquiryFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || "");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignmentId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Reset assignment if class is selected, and vice versa
  useEffect(() => {
    if (selectedClassId) setSelectedAssignmentId("");
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedAssignmentId) setSelectedClassId("");
  }, [selectedAssignmentId]);

  const cancelHref = courseId
    ? `/courses/${courseId}`
    : initialClassId 
      ? `/classes/${initialClassId}` 
      : initialAssignmentId 
        ? `/assignments/${initialAssignmentId}` 
        : "/inquiries";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createInquiry({
      title,
      description,
      classId: selectedClassId || undefined,
      assignmentId: selectedAssignmentId || undefined,
      courseId: courseId || undefined,
    });

    setIsLoading(false);

    if (result.success) {
      router.push(cancelHref);
    } else {
      setError(result.error || "Error al crear la consulta");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/50 rounded-2xl text-[var(--color-error)] text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-on-surface-variant)] mb-2">
          Título
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="block w-full bg-[var(--color-surface-container)] border-0 rounded-2xl px-5 py-4 text-on-surface focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-300 outline-none placeholder:text-white/20"
          placeholder="Resumen breve de tu consulta"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-on-surface-variant)] mb-2">
          Descripción detallada
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          className="block w-full bg-[var(--color-surface-container)] border-0 rounded-2xl px-5 py-4 text-on-surface focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-300 outline-none placeholder:text-white/20"
          placeholder="Describe tu duda con el mayor detalle posible..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label htmlFor="class" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-on-surface-variant)] mb-2">
            Relacionado con la clase (opcional)
          </label>
          <select
            id="class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={!!selectedAssignmentId}
            className="block w-full bg-[var(--color-surface-container)] border-0 rounded-2xl px-5 py-4 text-on-surface focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-300 outline-none disabled:opacity-50"
          >
            <option value="">-- Seleccionar clase --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assignment" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-on-surface-variant)] mb-2">
            Relacionado con el TP (opcional)
          </label>
          <select
            id="assignment"
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            disabled={!!selectedClassId}
            className="block w-full bg-[var(--color-surface-container)] border-0 rounded-2xl px-5 py-4 text-on-surface focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-300 outline-none disabled:opacity-50"
          >
            <option value="">-- Seleccionar TP --</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 pt-4">
        <Link
          href={cancelHref}
          className="px-8 py-3 rounded-full text-[var(--color-on-surface-variant)] hover:text-on-surface hover:bg-[var(--color-surface-container-highest)] transition-colors font-semibold text-sm"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="px-10 py-3 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-[#000000] font-bold text-sm shadow-[0_0_20px_rgba(63,255,139,0.2)] hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
              Enviando...
            </>
          ) : (
            "Crear Consulta"
          )}
        </button>
      </div>
    </form>
  );
}
