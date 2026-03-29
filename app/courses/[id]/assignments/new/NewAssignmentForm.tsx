"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAssignmentForCourse, getResourceUploadUrl, createLink } from "@/lib/actions";

interface NewAssignmentFormProps {
  courseId: string;
}

type PendingResource = {
  id: string;
  title: string;
  url?: string;
  file?: File;
  type: 'link' | 'file';
};

export default function NewAssignmentForm({ courseId }: NewAssignmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for preview
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [time, setTime] = useState("");

  // States for resources
  const [pendingResources, setPendingResources] = useState<PendingResource[]>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        title: file.name,
        file: file,
        type: 'file' as const
      }));
      setPendingResources(prev => [...prev, ...newFiles]);
    }
  };

  const handleAddLink = () => {
    if (!linkTitle || !linkUrl) return;
    setPendingResources(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      title: linkTitle,
      url: linkUrl,
      type: 'link'
    }]);
    setLinkTitle("");
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const removeResource = (id: string) => {
    setPendingResources(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createAssignmentForCourse(courseId, formData);

    if (result.success && result.assignmentId) {
      // Upload pending resources
      for (const resource of pendingResources) {
        try {
          let finalUrl = resource.url || "";
          
          if (resource.type === 'file' && resource.file) {
            const uploadAuth = await getResourceUploadUrl(resource.file.name, resource.file.type);
            if (uploadAuth.success && uploadAuth.url) {
              const uploadRes = await fetch(uploadAuth.url, {
                method: "PUT",
                body: resource.file,
                headers: { "Content-Type": resource.file.type }
              });
              if (uploadRes.ok) {
                finalUrl = uploadAuth.url.split('?')[0];
              } else {
                console.error("Failed to upload file", resource.title);
                continue; // Skip creating link if upload failed
              }
            }
          }

          if (finalUrl) {
            const linkFormData = new FormData();
            linkFormData.append('title', resource.title);
            linkFormData.append('url', finalUrl);
            linkFormData.append('type', resource.type);
            linkFormData.append('assignmentId', result.assignmentId);
            await createLink(linkFormData);
          }
        } catch (err) {
          console.error("Error saving resource", err);
        }
      }

      router.push(`/courses/${courseId}/assignments`);
      router.refresh();
    } else {
      setError(result.error || "Error al crear el trabajo práctico");
      setLoading(false);
    }
  };

  return (
    <section className="grid grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="col-span-12 lg:col-span-7 space-y-10">
        <div className="glass-panel p-10 rounded-xl">
          <form id="new-assignment-form" onSubmit={handleSubmit} className="space-y-12">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {/* Assignment Title */}
            <div className="relative group">
              <label 
                htmlFor="title" 
                className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2"
              >
                Título del Trabajo Práctico
              </label>
              <input 
                name="title"
                id="title" 
                placeholder="Ej: Proyecto Integrador Final" 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none placeholder:text-white/20"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Due Date */}
              <div className="relative">
                <label 
                  htmlFor="dueDate" 
                  className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2"
                >
                  Fecha Límite
                </label>
                <input 
                  name="dueDate"
                  id="dueDate" 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none [color-scheme:dark]"
                />
              </div>
              
              {/* Due Time */}
              <div className="relative">
                <label 
                  htmlFor="time" 
                  className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2"
                >
                  Hora Límite
                </label>
                <input 
                  name="time"
                  id="time" 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="block w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none [color-scheme:dark]"
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                Consigna del Trabajo
              </label>
              <textarea 
                name="description"
                id="description" 
                placeholder="Describe los objetivos, requerimientos y criterios de evaluación..." 
                rows={6}
                className="block w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none placeholder:text-white/20"
              ></textarea>
            </div>

            {/* AI Assistant Prompt (Optional) */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                Prompt del Asistente de IA (Opcional)
              </label>
              <textarea 
                name="systemPrompt"
                id="systemPrompt" 
                placeholder="Instrucciones para el asistente de IA al evaluar o guiar al estudiante en este trabajo..." 
                rows={3}
                className="block w-full bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none placeholder:text-white/20"
              ></textarea>
            </div>
          </form>
        </div>
        
        <div className="flex items-center justify-end gap-6 pt-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors font-semibold text-sm"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="new-assignment-form"
            disabled={loading}
            className="px-10 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Publicando...
              </>
            ) : (
              'Publicar TP'
            )}
          </button>
        </div>
      </div>
      
      {/* Sidebar Assets */}
      <div className="col-span-12 lg:col-span-5 space-y-8">
        {/* Resource Zone */}
        <div className="glass-panel p-8 rounded-xl">
          <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-6">Recursos y Materiales</h3>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/5 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-indigo-500/40 hover:bg-white/5 transition-all cursor-pointer group mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <div className="text-center">
              <p className="text-on-surface font-semibold">Soltar archivos aquí o hacer clic</p>
              <p className="text-on-surface-variant text-xs mt-1">PDF, ZIP, DOCX hasta 50MB</p>
            </div>
          </div>

          {/* Pending Resources List */}
          {pendingResources.length > 0 && (
            <div className="mb-6 space-y-3">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Recursos añadidos</p>
              {pendingResources.map(res => (
                <div key={res.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                      {res.type === 'file' ? 'draft' : 'link'}
                    </span>
                    <span className="text-sm text-on-surface truncate">{res.title}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeResource(res.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Link Input Section */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Enlaces rápidos</p>
            
            {showLinkInput ? (
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                <input 
                  type="text" 
                  placeholder="Título del enlace..." 
                  value={linkTitle}
                  onChange={e => setLinkTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm text-on-surface focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm text-on-surface focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowLinkInput(false)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    onClick={handleAddLink}
                    disabled={!linkTitle || !linkUrl}
                    className="text-xs bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 px-3 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setShowLinkInput(true)}
                className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <span className="material-symbols-outlined text-indigo-400 group-hover:scale-110 transition-transform">link</span>
                <span className="text-sm font-medium text-on-surface">Añadir enlace</span>
              </div>
            )}
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">folder_zip</span>
              <span className="text-sm font-medium text-on-surface">Adjuntar archivo</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Configuración de Entrega</p>
            <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-400">code</span>
                <span className="text-sm font-medium text-on-surface">Requiere Repositorio GitHub</span>
              </div>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
