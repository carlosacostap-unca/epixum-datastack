"use client";

import { useState } from "react";

export function ResendEmailsButton() {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!confirm('¿Estás seguro de que deseas re-enviar los emails de aprobación a TODAS las solicitudes ya aprobadas?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/resend-emails');
      const data = await res.json();
      
      if (data.success) {
        alert(data.message || 'Proceso completado con éxito.');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error: any) {
      alert('Error al ejecutar la acción: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleResend}
      disabled={loading}
      className="bg-[var(--color-primary)] text-black px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
    >
      {loading ? "Enviando..." : "Re-enviar Emails"}
    </button>
  );
}