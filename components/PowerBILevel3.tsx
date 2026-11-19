import Link from 'next/link';
import { getLevel3Overview, getLevel3StudentStatus, LEVEL_2_FINAL_ID, LEVEL_3_COURSE_ID } from '@/lib/power-bi-level3';
import type { Course } from '@/types';
import { Level3ConfirmForm, Level3ResponseForm } from './PowerBILevel3Forms';

export async function Level3StudentPanel({ studentId }: { studentId: string }) {
  const status = await getLevel3StudentStatus(studentId).catch(() => 'unavailable' as const);

  return (
    <section id="preinscripcion-nivel-3" aria-labelledby="preinscripcion-titulo" className="mb-10 rounded-[2rem] border border-[var(--color-primary)]/30 bg-[var(--color-surface-container-low)] p-6 md:p-8">
      <h2 id="preinscripcion-titulo" className="mb-3 text-2xl font-bold md:text-3xl">Preinscripción a Power BI Nivel 3</h2>
      <p className="max-w-3xl text-[var(--color-on-surface-variant)]">
        El martes 24 de noviembre comienza la última etapa del trayecto Full Stack. Serán 8 clases distribuidas en 4 semanas.
      </p>
      <p className="mt-2 max-w-3xl text-[var(--color-on-surface-variant)]">
        Podés preinscribirte ahora y completar después el Trabajo Final del Nivel 2. El equipo docente confirmará tu inscripción una vez que lo entregues y lo apruebes.
      </p>
      {status === undefined && <Level3ResponseForm />}
      {status === 'yes' && <p role="status" className="mt-5 font-semibold">Tu preinscripción quedó registrada.</p>}
      {status === 'no' && <p role="status" className="mt-5 font-semibold">Registramos que no vas a cursar este nivel.</p>}
      {status === 'confirmed' && (
        <p role="status" className="mt-5 font-semibold">
          Tu inscripción está confirmada. <Link href={`/estudiantes/cursos/${LEVEL_3_COURSE_ID}`} className="underline">Ingresar a Power BI Nivel 3</Link>
        </p>
      )}
      {status === 'unavailable' && <p role="alert" className="mt-4">La preinscripción no está disponible en este momento. Volvé a intentar más tarde.</p>}
    </section>
  );
}

export async function Level3StaffPanel({ course }: { course: Course }) {
  const overview = await getLevel3Overview(course).catch(() => undefined);
  if (overview === null) return null;

  const responses = overview?.responses ?? [];
  const yesCount = responses.filter(response => response.answer === 'yes').length;

  return (
    <section aria-labelledby="gestionar-preinscripcion-titulo" className="mb-10 rounded-[2rem] border border-[var(--color-outline-variant)] p-6 md:p-8">
      <h2 id="gestionar-preinscripcion-titulo" className="mb-3 text-2xl font-bold">Preinscripción a Power BI Nivel 3</h2>
      {overview ? (
        <>
          <p className="mb-4 text-sm">
            {yesCount} sí · {responses.length - yesCount} no · {(course.students?.length ?? 0) - responses.length} sin responder
          </p>
          {responses.length ? (
            <ul className="divide-y divide-[var(--color-outline-variant)]">
              {responses.map(response => {
                const student = response.expand?.student;
                const approval = overview.approvals.get(response.student);
                return (
                  <li key={response.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-semibold">{`${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim() || student?.name || response.student}</p>
                      <p className="text-sm">{response.answer === 'yes' ? 'Sí, quiere cursar' : 'No va a cursar'}</p>
                    </div>
                    {response.answer === 'yes' && (
                      overview.enrolled.has(response.student) ? <span>Inscripción confirmada</span> : approval ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <Link href={`/assignments/${LEVEL_2_FINAL_ID}/deliveries/${approval}`} className="text-sm underline">Ver evaluación aprobada</Link>
                          <Level3ConfirmForm responseId={response.id} />
                        </div>
                      ) : <span className="text-sm">Pendiente de aprobación del Trabajo Final</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : <p>Todavía no hay respuestas.</p>}
        </>
      ) : <p role="alert">No se pudieron cargar las preinscripciones.</p>}
    </section>
  );
}
