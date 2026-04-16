import { createServerClient, getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import { EnrollmentRequest, AccountRequest } from "@/types";
import FormattedDate from "@/components/FormattedDate";
import { updateEnrollmentStatus } from "@/lib/actions-enrollment";
import { updateAccountRequestStatus } from "@/lib/actions-account-requests";
import { revalidatePath } from "next/cache";
import { ResendEmailsButton } from "@/components/ResendEmailsButton";

export const dynamic = 'force-dynamic';

export default async function EnrollmentsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "admin" && user.role !== "docente")) {
    redirect("/");
  }

  const pb = await createServerClient();
  let enrollments: EnrollmentRequest[] = [];
  let accountRequests: AccountRequest[] = [];
  try {
    enrollments = await pb.collection("enrollment_requests").getFullList<EnrollmentRequest>({
      sort: "-created",
      expand: "courses"
    });
    
    accountRequests = await pb.collection("account_requests").getFullList<AccountRequest>({
      sort: "-created"
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Solicitudes de Matrícula
          </h1>
          <p className="text-zinc-500 mt-2">
            Gestiona las solicitudes de los nuevos estudiantes.
          </p>
        </div>
        <ResendEmailsButton />
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Estudiante</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">DNI / Fecha Nac.</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Contacto</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Cursos</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Estado</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No hay solicitudes pendientes.
                </td>
              </tr>
            ) : (
              enrollments.map((req) => (
                <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {req.firstName} {req.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">{req.dni}</div>
                    <div className="text-xs text-zinc-500"><FormattedDate date={req.birthDate} /></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">{req.email}</div>
                    <div className="text-xs text-zinc-500">{req.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {req.expand?.courses?.map(c => (
                        <span key={c.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {c.title}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      req.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <form action={async () => {
                          "use server";
                          await updateEnrollmentStatus(req.id, "approved");
                        }}>
                          <button type="submit" className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 p-1.5 rounded-md transition-colors" title="Aprobar">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          await updateEnrollmentStatus(req.id, "rejected");
                        }}>
                          <button type="submit" className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-1.5 rounded-md transition-colors" title="Rechazar">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-12 mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Solicitudes de Vinculación de Cuenta
        </h2>
        <p className="text-zinc-500 mt-2">
          Gestiona las solicitudes de los estudiantes que necesitan vincular su cuenta de Google.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Estudiante</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">DNI</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Correo Google</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Estado</th>
              <th className="px-6 py-4 font-medium text-sm text-zinc-500 dark:text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {accountRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No hay solicitudes de vinculación pendientes.
                </td>
              </tr>
            ) : (
              accountRequests.map((req) => (
                <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {req.firstName} {req.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">{req.dni}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">{req.googleEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {req.status === 'pendiente' ? 'Pendiente' : 'Resuelto'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {req.status === 'pendiente' && (
                      <div className="flex gap-2">
                        <form action={async () => {
                          "use server";
                          await updateAccountRequestStatus(req.id, "resuelto");
                        }}>
                          <button type="submit" className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 p-1.5 rounded-md transition-colors" title="Marcar como Resuelto">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}