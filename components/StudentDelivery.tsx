"use client";

import { createDelivery, updateDelivery, getDeliveryDownloadUrl } from "@/lib/actions";
import { Delivery } from "@/types";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FormattedDate from "@/components/FormattedDate";

interface StudentDeliveryProps {
  assignmentId: string;
  delivery: Delivery | null;
  studentName: string;
  assignmentTitle: string;
  dueDate?: string;
}

const allowedExtensions = [".zip", ".rar", ".7z", ".xlsx"];

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function safeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase();
}

function buildUploadFileName(file: File, studentName: string, assignmentTitle: string) {
  const extension = getFileExtension(file.name);
  const safeStudentName = safeName(studentName || "estudiante");
  const safeAssignmentTitle = safeName(assignmentTitle || "trabajo_practico");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${safeStudentName}_${safeAssignmentTitle}_${timestamp}${extension}`;
}

function isDeliveryLate(delivery: Delivery | null, dueDate?: string) {
  if (!delivery || !dueDate) return false;
  const deadline = new Date(dueDate).getTime();
  const submittedAt = new Date(delivery.created).getTime();
  const pendingUpdateAt = delivery.status === "pending" ? new Date(delivery.updated).getTime() : submittedAt;
  return submittedAt > deadline || pendingUpdateAt > deadline;
}

function getVerdictClass(verdict?: Delivery["verdict"]) {
  if (verdict === "Aprobado") {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  }
  if (verdict === "Corregir y reenviar") {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
  }
  if (verdict === "Desaprobado") {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
  return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
}

export default function StudentDelivery({ assignmentId, delivery, studentName, assignmentTitle, dueDate }: StudentDeliveryProps) {
  const [isEditing, setIsEditing] = useState(!delivery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isDelivered = !!delivery;
  const isPastDue = dueDate ? new Date() > new Date(dueDate) : false;
  const wasLate = isDeliveryLate(delivery, dueDate);
  const canResubmit = !delivery || delivery.status !== "published" || delivery.verdict === "Corregir y reenviar";
  const isCorrectionRequest = delivery?.status === "published" && delivery.verdict === "Corregir y reenviar";
  const selectedExtension = selectedFile ? getFileExtension(selectedFile.name) : "";

  const fileName = useMemo(() => {
    if (delivery?.file) return delivery.file;
    if (!delivery?.repositoryUrl) return "";
    try {
      return decodeURIComponent(new URL(delivery.repositoryUrl).pathname.split("/").pop() || "archivo");
    } catch {
      return delivery.repositoryUrl.split("/").pop() || "archivo";
    }
  }, [delivery?.repositoryUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = getFileExtension(file.name);
    if (!allowedExtensions.includes(extension)) {
      setError("El archivo debe ser comprimido (.zip, .rar, .7z) o una planilla .xlsx.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!delivery) return;

    try {
      const result = await getDeliveryDownloadUrl(delivery.id);
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        alert(result.error || "No se pudo obtener el enlace de descarga");
      }
    } catch (err) {
      console.error(err);
      alert("Error al intentar descargar el archivo");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canResubmit) {
      setError("Esta entrega ya tiene una evaluación final publicada.");
      return;
    }

    if (!selectedFile) {
      setError("Debes seleccionar un archivo comprimido o una planilla .xlsx.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setStatus("Guardando entrega...");
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("file", selectedFile, buildUploadFileName(selectedFile, studentName, assignmentTitle));

      const result = delivery ? await updateDelivery(delivery.id, formData) : await createDelivery(formData);

      if (!result.success) {
        throw new Error(result.error || "Error al guardar la entrega");
      }

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsEditing(false);
      setStatus("");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-xl border p-6 transition-all ${
      isDelivered
        ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
    }`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-3">
            <span className={`p-2 rounded-lg ${
              isDelivered
                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span>Mi entrega</span>
          </h2>
          {dueDate && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Fecha límite: <strong><FormattedDate date={dueDate} showTime={true} /></strong>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`px-4 py-1.5 text-sm font-semibold rounded-full border ${
            isDelivered
              ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
              : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-800"
          }`}>
            {isDelivered ? "Entregado" : "Pendiente"}
          </span>
          {wasLate && (
            <span className="px-4 py-1.5 text-sm font-semibold rounded-full border bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
              Fuera de término
            </span>
          )}
        </div>
      </div>

      {isPastDue && (
        <div className="mb-4 p-4 text-amber-800 bg-amber-100 rounded-lg dark:bg-amber-900/30 dark:text-amber-200">
          El plazo de entrega ya venció. Podés enviar o reenviar igualmente, y quedará identificado como fuera de término.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
          <p>{error}</p>
        </div>
      )}

      {!isEditing && delivery ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 overflow-hidden">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                Archivo entregado
              </label>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 9V3.5L18.5 9M6 2c-1.11 0-1.99.89-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6z"/></svg>
                </div>
                <button
                  onClick={handleDownload}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline truncate text-left"
                  title={fileName}
                >
                  {fileName || "Descargar entrega"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
                <span className="bg-zinc-50 dark:bg-zinc-800/50 py-2 px-3 rounded-md">
                  Entregado el <strong><FormattedDate date={delivery.created} /></strong> a las <strong><FormattedDate date={delivery.created} showTime={true} formatString="HH:mm" /></strong>
                </span>
                {delivery.updated !== delivery.created && (
                  <span className="bg-zinc-50 dark:bg-zinc-800/50 py-2 px-3 rounded-md">
                    Última actualización: <strong><FormattedDate date={delivery.updated} showTime={true} /></strong>
                  </span>
                )}
              </div>
            </div>

            {canResubmit && (
              <button
                onClick={() => setIsEditing(true)}
                className="shrink-0 px-4 py-2 text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v8m0-8l-4 4m4-4l4 4M4 8h16" /></svg>
                {isCorrectionRequest ? "Corregir y reenviar" : "Modificar entrega"}
              </button>
            )}
          </div>

          {delivery.status === "published" && (delivery.feedback || delivery.verdict) && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25h9m-9 3.75h6m-8.25 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Devolución del docente
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {delivery.verdict && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getVerdictClass(delivery.verdict)}`}>
                      {delivery.verdict}
                    </span>
                  )}
                  {delivery.grade !== undefined && (
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      Nota: {delivery.grade}/10
                    </span>
                  )}
                </div>
              </div>
              {delivery.feedback && (
                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-lg p-5">
                  <div className="prose prose-purple dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {delivery.feedback}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="mb-6">
            <label htmlFor="delivery-file" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Archivo de entrega
            </label>
            <div className="border-2 border-dashed rounded-xl p-8 transition-all border-zinc-300 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-500">
              <input
                type="file"
                id="delivery-file"
                ref={fileInputRef}
                accept={allowedExtensions.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center text-center gap-3">
                <div className={`p-4 rounded-full ${
                  selectedFile
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" /></svg>
                </div>

                {selectedFile ? (
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-500 mb-2">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB {selectedExtension && `- ${selectedExtension.toUpperCase()}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Eliminar selección
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline"
                      >
                        Seleccioná un archivo
                      </button>
                      {" "}comprimido o una planilla
                    </p>
                    <p className="text-xs text-zinc-500">
                      Formatos permitidos: .zip, .rar, .7z, .xlsx
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {loading ? (
              <div className="w-full text-center text-sm font-medium text-blue-600 animate-pulse">
                {status}
              </div>
            ) : (
              <>
                {isDelivered && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {delivery ? "Enviar nueva versión" : "Realizar entrega"}
                </button>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
