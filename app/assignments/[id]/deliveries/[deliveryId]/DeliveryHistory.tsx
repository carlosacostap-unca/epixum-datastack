import FormattedDate from "@/components/FormattedDate";
import { DeliveryAttempt } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DeliveryAttemptDownloadButtonClient from "./DeliveryAttemptDownloadButtonClient";

function getFileName(attempt: DeliveryAttempt) {
  if (attempt.file) return attempt.file;
  if (!attempt.repositoryUrl) return "archivo";

  try {
    return decodeURIComponent(new URL(attempt.repositoryUrl).pathname.split("/").pop() || "archivo");
  } catch {
    return attempt.repositoryUrl.split("/").pop() || "archivo";
  }
}

function getStatusLabel(attempt: DeliveryAttempt) {
  if (attempt.status === "published") return "Evaluada";
  if (attempt.status === "draft") return "Borrador";
  return "Pendiente";
}

function getStatusClass(attempt: DeliveryAttempt) {
  if (attempt.status === "published") {
    if (attempt.verdict === "Aprobado") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (attempt.verdict === "Corregir y reenviar") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }

  if (attempt.status === "draft") {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  }

  return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
}

export default function DeliveryHistory({ attempts }: { attempts: DeliveryAttempt[] }) {
  return (
    <div className="mt-8 border-t border-zinc-200 dark:border-zinc-700 pt-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Histórico de entregas</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Versiones enviadas por el estudiante para este trabajo práctico.
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-5 text-sm text-zinc-500 dark:text-zinc-400">
          Todavía no hay versiones históricas registradas para esta entrega.
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 overflow-hidden">
              {(() => {
                const hasEvaluation = attempt.status !== "pending" && Boolean(attempt.feedback || attempt.verdict || attempt.grade !== undefined);

                return (
                  <>
              <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Versión {attempt.version}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(attempt)}`}>
                      {getStatusLabel(attempt)}
                    </span>
                    {attempt.verdict && (
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {attempt.verdict}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Enviada: <FormattedDate date={attempt.submittedAt || attempt.created} showTime={true} />
                    {attempt.evaluatedAt && (
                      <>
                        {" "}· Evaluada: <FormattedDate date={attempt.evaluatedAt} showTime={true} />
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500 truncate max-w-full" title={getFileName(attempt)}>
                    {getFileName(attempt)}
                  </p>
                </div>
                <DeliveryAttemptDownloadButtonClient attemptId={attempt.id} />
              </div>

              {hasEvaluation && (
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                    {attempt.grade !== undefined && (
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">Nota: {attempt.grade}/10</span>
                    )}
                    {attempt.verdict && (
                      <span className="text-zinc-500 dark:text-zinc-400">Resultado: {attempt.verdict}</span>
                    )}
                  </div>
                  {attempt.feedback ? (
                    <div className="prose prose-zinc dark:prose-invert max-w-none text-sm bg-zinc-50 dark:bg-zinc-950/40 rounded-md border border-zinc-100 dark:border-zinc-800 p-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{attempt.feedback}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">Sin devolución registrada.</p>
                  )}
                </div>
              )}
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
