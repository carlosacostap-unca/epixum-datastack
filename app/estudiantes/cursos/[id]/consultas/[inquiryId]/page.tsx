import { getCourse } from "@/lib/data";
import { getInquiry, getInquiryResponses } from "@/lib/actions-inquiries";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import FormattedDate from "@/components/FormattedDate";
import StudentInquiryActions from "./StudentInquiryActions";

export const dynamic = 'force-dynamic';

export default async function EstudianteInquiryDetailPage(props: { params: Promise<{ id: string; inquiryId: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user || user.role !== "estudiante") {
    redirect("/");
  }

  const course = await getCourse(params.id);
  if (!course) {
    redirect("/estudiantes");
  }

  const isEnrolled = course.expand?.students?.some(student => student.id === user.id);
  if (!isEnrolled) {
    redirect("/estudiantes");
  }

  const inquiryResult = await getInquiry(params.inquiryId);
  if (!inquiryResult.success || !inquiryResult.data) {
    notFound();
  }

  const inquiry = inquiryResult.data;
  const responses = await getInquiryResponses(params.inquiryId);
  const isAuthor = inquiry.author === user.id;

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full h-full flex flex-col">
      {/* Back button */}
      <Link 
        href={`/estudiantes/cursos/${course.id}/consultas`} 
        className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors mb-8 md:mb-12 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-bold text-sm tracking-widest uppercase">Volver al Foro</span>
      </Link>

      <div className="max-w-4xl w-full mx-auto flex flex-col gap-12">
        {/* Inquiry Detail */}
        <section className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 md:p-10 border border-[var(--color-outline-variant)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-primary)]/5 blur-[40px] -z-10 rounded-full pointer-events-none"></div>
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              inquiry.status === "Resuelta"
                ? "bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)]"
                : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            }`}>
              {inquiry.status}
            </span>
            {(inquiry.expand?.class || inquiry.expand?.assignment) && (
              <span className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-1 font-medium">
                En: 
                {inquiry.expand?.class && <span className="text-[var(--color-on-surface)] px-2 py-0.5 bg-[var(--color-surface-container-highest)] rounded-md">{inquiry.expand.class.title}</span>}
                {inquiry.expand?.assignment && <span className="text-[var(--color-on-surface)] px-2 py-0.5 bg-[var(--color-surface-container-highest)] rounded-md">{inquiry.expand.assignment.title}</span>}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-headline tracking-tight text-[var(--color-on-surface)] mb-6 leading-tight">
            {inquiry.title}
          </h1>

          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[var(--color-outline-variant)]">
            {inquiry.expand?.author?.avatar ? (
              <img
                src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${inquiry.expand.author.id}/${inquiry.expand.author.avatar}`}
                className="w-12 h-12 rounded-full object-cover border border-[var(--color-outline-variant)]"
                alt=""
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container-highest)] flex items-center justify-center text-xl font-bold text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]">
                {(inquiry.expand?.author?.name || inquiry.expand?.author?.firstName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-[var(--color-on-surface)]">
                {inquiry.expand?.author?.name || [inquiry.expand?.author?.firstName, inquiry.expand?.author?.lastName].filter(Boolean).join(" ") || "Usuario"}
              </p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                <FormattedDate date={inquiry.created} showTime={true} />
              </p>
            </div>
          </div>

          <div className="text-[var(--color-on-surface-variant)] leading-relaxed whitespace-pre-wrap text-lg">
            {inquiry.description}
          </div>
        </section>

        {/* Responses */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-headline font-bold text-[var(--color-on-surface)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)]">forum</span>
            Respuestas ({responses.length})
          </h2>

          <div className="flex flex-col gap-4">
            {responses.map((response) => {
              const isTeacherResponse = response.expand?.author?.role === "docente" || response.expand?.author?.role === "admin";
              const isMyResponse = response.expand?.author?.id === user.id;
              
              return (
                <div 
                  key={response.id} 
                  className={`p-6 rounded-[2rem] border ${
                    isTeacherResponse 
                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 ml-0 md:ml-12" 
                    : isMyResponse
                      ? "bg-[var(--color-surface-container-highest)] border-[var(--color-outline-variant)] mr-0 md:mr-12"
                      : "bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)] mr-0 md:mr-12"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {response.expand?.author?.avatar ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${response.expand.author.id}/${response.expand.author.avatar}`}
                          className="w-10 h-10 rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          isTeacherResponse 
                              ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]" 
                              : "bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]"
                        }`}>
                          {(response.expand?.author?.name || response.expand?.author?.firstName || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isTeacherResponse ? "text-[var(--color-primary)]" : "text-[var(--color-on-surface)]"}`}>
                            {response.expand?.author?.name || [response.expand?.author?.firstName, response.expand?.author?.lastName].filter(Boolean).join(" ") || "Usuario"}
                            {isMyResponse && " (Tú)"}
                          </span>
                          {isTeacherResponse && (
                            <span className="text-[10px] bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Docente
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[var(--color-on-surface-variant)]">
                          <FormattedDate date={response.created} showTime={true} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[var(--color-on-surface)] whitespace-pre-wrap leading-relaxed pl-0 md:pl-14">
                    {response.content}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Actions Form */}
        <StudentInquiryActions inquiryId={inquiry.id} currentStatus={inquiry.status} isAuthor={isAuthor} />
      </div>
    </div>
  );
}