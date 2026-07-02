"use client";

import { useState } from "react";
import { getDeliveryAttemptDownloadUrl } from "@/lib/actions";

export default function DeliveryAttemptDownloadButtonClient({ attemptId }: { attemptId: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const result = await getDeliveryAttemptDownloadUrl(attemptId);
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        alert(result.error || "No se pudo obtener el enlace de descarga");
      }
    } catch (error) {
      console.error(error);
      alert("Error al intentar descargar el archivo");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
    >
      {isDownloading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
      ) : (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 9V3.5L18.5 9M6 2c-1.11 0-1.99.89-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6z" />
        </svg>
      )}
      Descargar
    </button>
  );
}
