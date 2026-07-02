"use client";

import { useState } from "react";
import { updateDeliveryEvaluation } from "@/lib/actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Delivery } from "@/types";

interface DeliveryEvaluationClientProps {
  deliveryId: string;
  initialGrade?: number;
  initialFeedback?: string;
  initialVerdict?: Delivery["verdict"];
  initialStatus?: Delivery["status"];
}

export default function DeliveryEvaluationClient({
  deliveryId,
  initialGrade,
  initialFeedback,
  initialVerdict,
  initialStatus,
}: DeliveryEvaluationClientProps) {
  const startsPending = (initialStatus || "pending") === "pending";
  const [grade, setGrade] = useState(startsPending ? 0 : initialGrade ?? 0);
  const [feedback, setFeedback] = useState(startsPending ? "" : initialFeedback || "");
  const [verdict, setVerdict] = useState<Delivery["verdict"] | undefined>(startsPending ? undefined : initialVerdict);
  const [status, setStatus] = useState<Delivery["status"]>(initialStatus || "pending");
  const [isEditing, setIsEditing] = useState(startsPending || (!initialFeedback && !initialVerdict));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveEvaluation = async (nextStatus: "draft" | "published") => {
    setIsSaving(true);
    setMessage("");
    setError("");

    const result = await updateDeliveryEvaluation(deliveryId, grade, feedback, verdict, nextStatus);

    if (result.success) {
      setStatus(nextStatus);
      setIsEditing(false);
      setMessage(nextStatus === "published" ? "Devolución enviada al estudiante." : "Borrador guardado.");
    } else {
      setError(result.error || "No se pudo guardar la evaluación.");
    }

    setIsSaving(false);
  };

  return (
    <div className="mt-8 border-t border-zinc-200 dark:border-zinc-700 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Evaluación docente</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Registrá la devolución que verá el estudiante.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-md transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            Editar evaluación
          </button>
        )}
      </div>

      {(message || error) && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-md border ${
          error
            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        }`}>
          {error || message}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <label htmlFor="verdict" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Resultado
            </label>
            {isEditing ? (
              <select
                id="verdict"
                value={verdict || ""}
                onChange={(event) => setVerdict(event.target.value as Delivery["verdict"])}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="" disabled>Seleccionar resultado</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Desaprobado">Desaprobado</option>
                <option value="Corregir y reenviar">Corregir y reenviar</option>
              </select>
            ) : (
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {verdict || "Sin resultado"}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <label htmlFor="grade" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Nota
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  id="grade"
                  type="number"
                  min="0"
                  max="10"
                  value={grade}
                  onChange={(event) => setGrade(Number(event.target.value))}
                  className="w-24 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 text-right"
                />
                <span className="text-sm text-zinc-500">/10</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{grade}/10</span>
            )}
          </div>
        </div>

        <div className="p-6">
          <label htmlFor="feedback" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Devolución
          </label>
          {isEditing ? (
            <textarea
              id="feedback"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={10}
              className="w-full p-4 text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Escribí la devolución para el estudiante..."
            />
          ) : (
            <div className="prose prose-zinc dark:prose-invert max-w-none bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-lg border border-zinc-100 dark:border-zinc-800">
              {feedback ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
              ) : (
                <p className="text-zinc-500 italic">Sin devolución registrada.</p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {isEditing && (
              <>
                {status !== "pending" && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-md transition-colors border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => saveEvaluation("draft")}
                  disabled={isSaving}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-medium rounded-md transition-colors border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : "Guardar borrador"}
                </button>
                <button
                  type="button"
                  onClick={() => saveEvaluation("published")}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Enviando..." : "Enviar devolución al estudiante"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
