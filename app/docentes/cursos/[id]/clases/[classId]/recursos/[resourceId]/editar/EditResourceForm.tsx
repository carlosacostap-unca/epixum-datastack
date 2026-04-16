"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateLink, getResourceUploadUrl } from "@/lib/actions";

interface EditResourceFormProps {
  courseId: string;
  classId: string;
  resource: {
    id: string;
    title: string;
    url: string;
    type: 'link' | 'file';
  };
}

export default function EditResourceForm({ courseId, classId, resource }: EditResourceFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resourceType, setResourceType] = useState<'link' | 'file'>(resource.type);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    try {
      const title = formData.get('title') as string;
      let url = formData.get('url') as string || resource.url;

      if (resourceType === 'file' && selectedFile) {
        // Upload new file if selected
        const uploadAuth = await getResourceUploadUrl(selectedFile.name, selectedFile.type);
        if (!uploadAuth.success || !uploadAuth.url) {
            throw new Error(uploadAuth.error || "Error al obtener URL de subida");
        }

        const uploadRes = await fetch(uploadAuth.url, {
            method: "PUT",
            body: selectedFile,
            headers: {
                "Content-Type": selectedFile.type
            }
        });

        if (!uploadRes.ok) {
            throw new Error("Error al subir el archivo");
        }

        // Clean URL
        url = uploadAuth.url.split('?')[0];
      } else if (resourceType === 'file' && !selectedFile) {
        // Keep the old file URL
        url = resource.url;
      }

      // Prepare final form data
      const finalFormData = new FormData();
      finalFormData.append('title', title);
      finalFormData.append('url', url);
      finalFormData.append('type', resourceType);
      finalFormData.append("classId", classId);

      const result = await updateLink(resource.id, finalFormData);

      if (result.success) {
        router.push(`/docentes/cursos/${courseId}/clases/${classId}`);
        router.refresh();
      } else {
        setError(result.error || "Ocurrió un error");
        setLoading(false);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Ocurrió un error inesperado");
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-8 w-full max-w-2xl">
      {error && (
        <div className="bg-[var(--color-error)]/10 text-[var(--color-error)] px-6 py-4 rounded-2xl text-sm font-medium border border-[var(--color-error)]/20">
          {error}
        </div>
      )}

      {/* Resource Type Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
          Tipo de Recurso
        </label>
        <div className="flex gap-4">
          <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
            resourceType === 'link' 
              ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]' 
              : 'bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'
          }`}>
            <input 
              type="radio" 
              name="type" 
              value="link" 
              checked={resourceType === 'link'} 
              onChange={() => setResourceType('link')}
              className="hidden"
            />
            <span className="material-symbols-outlined text-2xl">link</span>
            <span className="font-bold">Enlace Web</span>
          </label>
          <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
            resourceType === 'file' 
              ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]' 
              : 'bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'
          }`}>
            <input 
              type="radio" 
              name="type" 
              value="file" 
              checked={resourceType === 'file'} 
              onChange={() => setResourceType('file')}
              className="hidden"
            />
            <span className="material-symbols-outlined text-2xl">description</span>
            <span className="font-bold">Archivo</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
          Título del recurso
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          defaultValue={resource.title}
          className="w-full h-14 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-2xl px-5 text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-colors font-body text-lg"
          placeholder="Ej: Presentación de la clase 1"
        />
      </div>

      {resourceType === 'link' ? (
        <div className="flex flex-col gap-3">
          <label htmlFor="url" className="text-sm font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
            URL del enlace
          </label>
          <input
            type="url"
            id="url"
            name="url"
            required={resourceType === 'link'}
            defaultValue={resource.type === 'link' ? resource.url : ''}
            className="w-full h-14 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-2xl px-5 text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-colors font-body text-lg"
            placeholder="https://..."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
            Archivo
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-4 bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] rounded-2xl border border-[var(--color-outline-variant)] transition-colors font-bold flex items-center gap-2"
            >
              <span className="material-symbols-outlined">upload</span>
              Seleccionar nuevo archivo
            </button>
            <span className="text-[var(--color-on-surface-variant)] text-sm truncate max-w-xs">
              {selectedFile ? selectedFile.name : (resource.type === 'file' ? decodeURIComponent(resource.url.split('/').pop() || '') : "Ningún archivo nuevo seleccionado")}
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.png,.jpg,.jpeg"
          />
          <p className="text-xs text-[var(--color-on-surface-variant)] opacity-70 mt-1">
            Si no seleccionas un archivo nuevo, se mantendrá el actual.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-4 pt-8 border-t border-[var(--color-outline-variant)]">
        <Link 
          href={`/docentes/cursos/${courseId}/clases/${classId}`}
          className="px-8 py-4 rounded-full text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] font-bold transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 rounded-full bg-[var(--color-primary)] text-black font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </form>
  );
}
