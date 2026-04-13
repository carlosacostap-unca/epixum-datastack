"use client";

import { useState, useTransition } from "react";
import { createInquiryResponse, updateInquiryStatus } from "@/lib/actions-inquiries";
import { useRouter } from "next/navigation";

interface StudentInquiryActionsProps {
  inquiryId: string;
  currentStatus: string;
  isAuthor: boolean;
}

export default function StudentInquiryActions({ inquiryId, currentStatus, isAuthor }: StudentInquiryActionsProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsLoading(true);
    const result = await createInquiryResponse(inquiryId, content);
    setIsLoading(false);

    if (result.success) {
      setContent("");
      router.refresh();
    } else {
      alert(result.error || "Error al enviar la respuesta");
    }
  };

  const handleToggleStatus = () => {
    const newStatus = currentStatus === "Pendiente" ? "Resuelta" : "Pendiente";
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiryId, newStatus);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Error al actualizar estado");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="bg-[var(--color-surface-container-low)] rounded-[2rem] p-6 md:p-8 border border-[var(--color-outline-variant)] flex flex-col gap-4">
        <h3 className="text-xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-primary)]">reply</span>
          Aportar a la consulta
        </h3>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] outline-none rounded-[1.5rem] px-5 py-4 text-[var(--color-on-surface)] transition-colors resize-none"
          placeholder="Escribe tu respuesta, aporte o duda adicional aquí..."
          required
        />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          {isAuthor ? (
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isPending}
              className={`w-full sm:w-auto px-6 py-3 rounded-full font-bold text-sm transition-colors border flex items-center justify-center gap-2 disabled:opacity-50 ${
                currentStatus === "Pendiente" 
                  ? "bg-transparent text-[var(--color-on-surface)] border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-highest)]"
                  : "bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] border-transparent hover:bg-transparent hover:border-[var(--color-outline-variant)]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {currentStatus === "Pendiente" ? "check_circle" : "undo"}
              </span>
              {currentStatus === "Pendiente" ? "Marcar como Resuelta" : "Reabrir Consulta"}
            </button>
          ) : (
            <div /> // Espaciador
          )}

          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="w-full sm:w-auto px-8 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full hover:bg-[var(--color-primary)]/90 transition-colors font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_var(--color-primary)]/30"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Enviando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                Enviar Respuesta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}