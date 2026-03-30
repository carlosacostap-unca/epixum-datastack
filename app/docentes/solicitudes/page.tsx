import { createServerClient, getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import { EnrollmentRequest } from "@/types";
import FormattedDate from "@/components/FormattedDate";
import { updateEnrollmentStatus } from "@/lib/actions-enrollment";

export const dynamic = 'force-dynamic';

export default async function DocenteSolicitudesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "docente") {
    redirect("/");
  }

  const pb = await createServerClient();
  let enrollments: EnrollmentRequest[] = [];
  try {
    // Para simplificar, obtenemos todas las solicitudes (idealmente se filtrarían por los cursos del docente)
    // El listRule de PocketBase ya podría estar filtrando si se configuró así.
    enrollments = await pb.collection("enrollment_requests").getFullList<EnrollmentRequest>({
      sort: "-created",
      expand: "courses"
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
  }

  return (
    <div className="flex-1 p-12 overflow-y-auto w-full h-full">
      <header className="mb-24 flex flex-col md:flex-row gap-20 items-start justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"></span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
              Panel Docente
            </span>
          </div>
          <h1 className="text-6xl font-headline tracking-tight text-[var(--color-on-surface)] mb-6">
            Solicitudes de <span className="text-[var(--color-primary)]">Matrícula</span>
          </h1>
          <p className="text-[var(--color-on-surface-variant)] text-xl leading-relaxed">
            Revisa y gestiona las solicitudes de los estudiantes que desean inscribirse en los cursos.
          </p>
        </div>
      </header>

      <div className="bg-[var(--color-surface-container-low)] rounded-[3rem] overflow-hidden p-4">
        <div className="overflow-x-auto bg-[var(--color-surface-container)] rounded-[2rem]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-transparent">
                <th className="px-8 py-6 font-headline font-semibold text-sm text-[var(--color-on-surface-variant)] uppercase tracking-wider">Estudiante</th>
                <th className="px-8 py-6 font-headline font-semibold text-sm text-[var(--color-on-surface-variant)] uppercase tracking-wider">DNI / Fecha Nac.</th>
                <th className="px-8 py-6 font-headline font-semibold text-sm text-[var(--color-on-surface-variant)] uppercase tracking-wider">Contacto</th>
                <th className="px-8 py-6 font-headline font-semibold text-sm text-[var(--color-on-surface-variant)] uppercase tracking-wider">Cursos</th>
                <th className="px-8 py-6 font-headline font-semibold text-sm text-[var(--color-on-surface-variant)] uppercase tracking-wider">Estado</th>
                <th className="px-8 py-6 font-headline font-semibold text-sm text-[var(--color-on-surface-variant)] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-[var(--color-on-surface-variant)]">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <span className="material-symbols-outlined text-5xl opacity-50">inbox</span>
                      <p className="text-lg">No hay solicitudes pendientes.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                enrollments.map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--color-surface-container-highest)] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-medium text-lg text-[var(--color-on-surface)]">
                        {req.firstName} {req.lastName}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-base text-[var(--color-on-surface-variant)]">{req.dni}</div>
                      <div className="text-sm text-[var(--color-on-surface-variant)] opacity-70 mt-1"><FormattedDate date={req.birthDate} /></div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-base text-[var(--color-on-surface-variant)]">{req.email}</div>
                      <div className="text-sm text-[var(--color-on-surface-variant)] opacity-70 mt-1">{req.phone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {req.expand?.courses?.map(c => (
                          <span key={c.id} className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-[var(--color-surface-container-highest)] text-[var(--color-primary)]">
                            {c.title}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase ${
                        req.status === 'pending' ? 'bg-[#FFB4A4]/10 text-[#FFB4A4]' : // We don't have a warning token, keeping yellow/orange
                        req.status === 'approved' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' :
                        'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <form action={async () => {
                            "use server";
                            await updateEnrollmentStatus(req.id, "approved");
                          }}>
                            <button type="submit" className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] hover:bg-gradient-to-br hover:from-[var(--color-primary)] hover:to-[var(--color-primary-container)] hover:text-[#000000] transition-all hover:shadow-[0_0_20px_rgba(63,255,139,0.2)] hover:scale-[1.05] active:scale-95" title="Aprobar Solicitud">
                              <span className="material-symbols-outlined text-2xl">check</span>
                            </button>
                          </form>
                          <form action={async () => {
                            "use server";
                            await updateEnrollmentStatus(req.id, "rejected");
                          }}>
                            <button type="submit" className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-surface-container-highest)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-[var(--color-on-error)] transition-all hover:shadow-[0_0_20px_rgba(255,84,73,0.2)] hover:scale-[1.05] active:scale-95" title="Rechazar Solicitud">
                              <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--color-on-surface-variant)] italic">
                          Gestionado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}