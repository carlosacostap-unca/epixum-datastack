"use client";

import { useState } from "react";
import { submitAccountRequest } from "@/lib/actions-account-requests";
import Link from "next/link";

export default function LinkAccountForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    const result = await submitAccountRequest(formData);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Error desconocido");
    }
    setIsSubmitting(false);
  }

  if (success) {
    return (
      <div className="text-center p-6 bg-transparent">
        <div className="w-16 h-16 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h2 className="text-3xl font-headline font-bold mb-4 text-[var(--color-on-surface)]">¡Solicitud enviada!</h2>
        <p className="text-[var(--color-on-surface-variant)] font-body text-lg mb-10 leading-relaxed">
          Tus datos han sido recibidos correctamente. Los docentes revisarán la información y vincularán tu cuenta de Google. Te avisaremos cuando esté listo.
        </p>
        <Link href="/" className="inline-flex items-center justify-center h-14 px-8 bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] font-body font-semibold text-sm rounded-full transition-colors hover:bg-[var(--color-surface-container)]">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] rounded-[1.5rem] text-sm font-body">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-xs font-body font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)] ml-2">
            Apellidos <span className="text-[var(--color-primary)]">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            className="w-full h-14 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-[1.5rem] px-5 text-[var(--color-on-surface)] font-body focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            placeholder="Ej: Pérez"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="firstName" className="text-xs font-body font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)] ml-2">
            Nombres <span className="text-[var(--color-primary)]">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            className="w-full h-14 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-[1.5rem] px-5 text-[var(--color-on-surface)] font-body focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            placeholder="Ej: Juan Carlos"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="dni" className="text-xs font-body font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)] ml-2">
          DNI <span className="text-[var(--color-primary)]">*</span>
        </label>
        <input
          type="text"
          id="dni"
          name="dni"
          required
          className="w-full h-14 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-[1.5rem] px-5 text-[var(--color-on-surface)] font-body focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          placeholder="Sin puntos ni espacios"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="googleEmail" className="text-xs font-body font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)] ml-2">
          Correo de Google <span className="text-[var(--color-primary)]">*</span>
        </label>
        <input
          type="email"
          id="googleEmail"
          name="googleEmail"
          required
          className="w-full h-14 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-[1.5rem] px-5 text-[var(--color-on-surface)] font-body focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          placeholder="ejemplo@gmail.com"
        />
      </div>

      <div className="pt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-6">
        <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-8 bg-transparent text-[var(--color-on-surface-variant)] font-body font-semibold text-sm rounded-full transition-colors hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-black font-body font-bold text-sm rounded-full shadow-[0_0_30px_rgba(63,255,139,0.25)] transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_40px_rgba(63,255,139,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_0_20px_rgba(63,255,139,0.2)]"
        >
          {isSubmitting ? "Enviando solicitud..." : "Solicitar vinculación"}
        </button>
      </div>
    </form>
  );
}