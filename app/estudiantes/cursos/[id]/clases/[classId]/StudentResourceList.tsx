"use client";

import { Link as LinkType } from "@/types";
import { getResourceDownloadUrl } from "@/lib/actions";
import { useState } from "react";

interface StudentResourceListProps {
  links: LinkType[];
  classId: string;
}

export default function StudentResourceList({ links, classId }: StudentResourceListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const isFileResource = (link: LinkType) => {
    return link.type === 'file' || 
           link.url.includes('idrivee2.com') || 
           link.url.includes('epixum-javascript-storage');
  };

  const handleResourceClick = async (e: React.MouseEvent, link: LinkType) => {
    if (isFileResource(link)) {
        e.preventDefault();
        setDownloadingId(link.id);
        try {
            const result = await getResourceDownloadUrl(link.id);
            if (result.success && result.url) {
                window.open(result.url, '_blank');
            } else {
                alert("No se pudo descargar el archivo.");
            }
        } catch (error) {
            console.error(error);
            alert("Error al descargar el archivo.");
        } finally {
            setDownloadingId(null);
        }
    }
  };

  if (links.length === 0) {
    return (
      <section className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-10 border border-[var(--color-outline-variant)]">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <span className="material-symbols-outlined text-5xl text-[var(--color-on-surface-variant)] mb-4">folder_off</span>
          <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">Sin recursos</h2>
          <p className="text-[var(--color-on-surface-variant)]">El docente aún no ha publicado materiales para esta clase.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-10 border border-[var(--color-outline-variant)]">
      <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[var(--color-primary)]">folder_open</span>
        Material de Estudio
      </h2>
      
      <div className="flex flex-col gap-4">
        {links.map((link) => (
          <a 
            key={link.id}
            href={isFileResource(link) ? '#' : link.url} 
            target={isFileResource(link) ? undefined : "_blank"}
            rel={isFileResource(link) ? undefined : "noopener noreferrer"}
            onClick={(e) => handleResourceClick(e, link)}
            className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)] transition-all group"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                isFileResource(link) 
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-[#000000]' 
                  : 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] group-hover:bg-[var(--color-on-surface)] group-hover:text-[var(--color-surface)]'
              }`}>
                {downloadingId === link.id ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">
                    {isFileResource(link) ? 'download' : 'open_in_new'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-[var(--color-on-surface)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-[var(--color-on-surface-variant)] truncate mt-0.5">
                  {isFileResource(link) ? (decodeURIComponent(link.url.split('/').pop() || 'Archivo descargable')) : link.url}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}