"use client";

import { useState } from "react";
import { submitEnrollmentRequest } from "@/lib/actions-enrollment";

export function EnrollmentForm({ availableCourses }: { availableCourses: { id: string, title: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const result = await submitEnrollmentRequest(formData);

    if (result.success) {
      setSuccess(true);
      (event.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "Ocurrió un error.");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-[var(--color-surface-container-highest)] mb-6 shadow-[0_0_40px_rgba(63,255,139,0.1)]">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">check_circle</span>
        </div>
        <h3 className="text-2xl font-headline text-[var(--color-on-surface)] mb-4 tracking-tight">¡Solicitud Enviada!</h3>
        <p className="text-[var(--color-on-surface-variant)] text-lg">Hemos recibido tu solicitud de matrícula correctamente. Te contactaremos pronto.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-[1.5rem] mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Nombres</label>
            <input name="firstName" required className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] outline-none rounded-[1.5rem] px-5 py-4 text-[var(--color-on-surface)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Apellidos</label>
            <input name="lastName" required className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] outline-none rounded-[1.5rem] px-5 py-4 text-[var(--color-on-surface)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">DNI</label>
            <input name="dni" required className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] outline-none rounded-[1.5rem] px-5 py-4 text-[var(--color-on-surface)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Fecha de Nac.</label>
            <input type="date" name="birthDate" required className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] outline-none rounded-[1.5rem] px-5 py-4 text-[var(--color-on-surface)] transition-colors [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">
              Email
            </label>
            <span className="block text-xs text-[var(--color-primary)] mb-2">
              (Debe ser una cuenta de Google / @gmail.com)
            </span>
            <input 
              type="email" 
              name="email" 
              placeholder="ejemplo@gmail.com"
              required 
              className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] outline-none rounded-[1.5rem] px-5 py-4 text-[var(--color-on-surface)] transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Teléfono</label>
            <input name="phone" required className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] outline-none rounded-[1.5rem] px-5 py-4 text-[var(--color-on-surface)] transition-colors" />
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-4">Cursos de Interés (Selecciona al menos uno)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCourses.length === 0 ? (
              <div className="col-span-2 text-[var(--color-on-surface-variant)] p-4 rounded-[1.5rem] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
                No hay cursos disponibles para matrícula en este momento.
              </div>
            ) : (
              availableCourses.map(course => (
                <label key={course.id} className="flex items-center gap-4 text-[var(--color-on-surface)] p-4 rounded-[1.5rem] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer">
                  <input type="checkbox" name="courses" value={course.id} className="w-5 h-5 accent-[var(--color-primary)] rounded" />
                  <span className="text-sm font-medium">{course.title}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-[var(--color-surface-container-lowest)] font-bold text-sm tracking-wide uppercase py-4 rounded-full transition-all hover:shadow-[0_0_20px_rgba(63,255,139,0.3)] flex items-center justify-center min-h-[3.5rem]"
        >
          {loading ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </form>
    </div>
  );
}
