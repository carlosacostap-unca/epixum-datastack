import { getAllClasses, getTeacherCourses } from "@/lib/data";
import { Class } from "@/types";
import Link from "next/link";
import { createServerClient, getCurrentUser } from "@/lib/pocketbase-server";
import FormattedDate from "@/components/FormattedDate";
import LogoutButton from "@/components/LogoutButton";
import ProfileModalButton from "@/components/ProfileModalButton";
import { EnrollmentForm } from "@/components/EnrollmentForm";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getCurrentUser();

  // 1. Student View (Navigation Cards)
  if (user && user.role === 'estudiante') {
    return (
        <div className="container mx-auto p-8 min-h-screen">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-zinc-900 dark:text-white">
                Mis Cursos
                </h1>
                <p className="text-xl text-zinc-500 dark:text-zinc-400">
                Accede a tus materiales y clases.
                </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
                <Link href="/classes" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Clases</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Accede a las clases y materiales.</p>
                </Link>
                
                <Link href="/assignments" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-green-500 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Trabajos Prácticos</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Entrega tus tareas y visualiza tus calificaciones.</p>
                </Link>

                <Link href="/inquiries" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 hover:shadow-md transition-all group md:col-span-2 md:w-1/2 md:mx-auto">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Consultas</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Pregunta dudas y ayuda a tus compañeros.</p>
                </Link>
            </div>
        </div>
    );
  }

  // 2. Admin View (Navigation Cards)
  if (user && user.role === 'admin') {
    return (
      <div className="container mx-auto p-8 min-h-screen">
          <header className="mb-12 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              Panel Docente
              </h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400">
              Gestiona el curso, las clases y los trabajos prácticos.
              </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
              <Link href="/classes" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Gestionar Clases</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Crea, edita y administra las clases del curso.</p>
              </Link>
              
              <Link href="/assignments" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-green-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Gestionar Trabajos</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Crea y administra los trabajos prácticos.</p>
              </Link>

              <Link href="/inquiries" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Consultas</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Responde dudas y gestiona las consultas del curso.</p>
              </Link>

              <Link href="/admin/enrollments" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">group_add</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Solicitudes de Matrícula</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Aprueba o desestima las solicitudes de nuevos estudiantes.</p>
              </Link>
          </div>
      </div>
    );
  }

  // 3. Guest View (Landing Page)
  let allCourses: { id: string; title: string }[] = [];
  try {
    const pb = await createServerClient();
    const coursesResult = await pb.collection("courses").getFullList({
      fields: "id,title",
      filter: "status = 'en curso' || status = 'borrador'"
    });
    allCourses = coursesResult.map(c => ({ id: c.id, title: c.title }));
  } catch (e) {
    console.error("Error fetching courses for landing:", e);
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] relative overflow-hidden font-body">
      {/* Background elements - Ambient Glow */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full opacity-[0.06] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--color-primary)] via-transparent to-transparent blur-[40px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--color-tertiary)] via-transparent to-transparent blur-[40px]"></div>
      </div>

      <div className="container mx-auto px-6 py-20 lg:py-24 max-w-7xl">
        {/* Asymmetrical Hero Section */}
        <header className="mb-24 lg:mb-32 flex flex-col lg:flex-row gap-20 items-start">
          <div className="flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-[var(--color-surface-container-highest)] mb-8 shadow-[0_0_40px_rgba(63,255,139,0.06)]">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">rocket_launch</span>
            </div>
            <h1 className="text-[3.5rem] md:text-6xl font-headline tracking-tight mb-8 text-[var(--color-on-surface)] leading-tight">
              PostDiplomatura
            </h1>
            <p className="text-xl text-[var(--color-on-surface-variant)] font-body leading-relaxed max-w-2xl">
              Oferta de cursos gratuitos exclusiva para egresados de la Diplomatura Universitarios en Desarrollo Web Fullstack con JavaScript.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-24 w-full">
          
          {/* Courses Section */}
          <div className="w-full space-y-16">
            <section>
              <h2 className="text-[2.5rem] mb-12 text-[var(--color-on-surface)] font-headline">Cursos Disponibles</h2>
              <div className="flex flex-col gap-12 w-full">
                <section className="bg-[var(--color-surface-container-low)] rounded-[2rem] p-10 lg:p-12 transition-all hover:bg-[var(--color-surface-container)]">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 shrink-0 bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] rounded-[1.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(63,255,139,0.06)]">
                      <span className="material-symbols-outlined text-3xl">deployed_code</span>
                    </div>
                    <h3 className="text-3xl font-headline text-[var(--color-on-surface)] tracking-tight">Fundamentos de Docker</h3>
                  </div>
                  <div className="md:pl-22">
                    <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed mb-8">
                      Este curso proporciona una base teórica y práctica sólida sobre Docker y Docker Compose, herramientas esenciales para modernizar el ciclo de vida del software. A través de un enfoque incremental, se enseña a crear entornos ligeros, aislados y portables que resuelven las discrepancias entre desarrollo y producción. La formación integra el dominio de la consola Linux con la automatización de imágenes y la orquestación de múltiples servicios. Al finalizar, los participantes podrán desplegar aplicaciones eficientes y escalables, asegurando que sus proyectos funcionen de manera consistente en cualquier infraestructura.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8 text-[var(--color-on-surface-variant)] text-base">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-[var(--color-primary)] mt-0.5 shrink-0">schedule</span>
                        <div>
                          <strong className="text-[var(--color-on-surface)] block">Duración</strong>
                          3 semanas
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-[var(--color-primary)] mt-0.5 shrink-0">calendar_month</span>
                        <div>
                          <strong className="text-[var(--color-on-surface)] block">Clases</strong>
                          Jueves de 16:00 a 18:00 horas
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-[var(--color-primary)] mt-0.5 shrink-0">laptop_mac</span>
                        <div>
                          <strong className="text-[var(--color-on-surface)] block">Modalidad</strong>
                          Virtual (Sincrónico o asincrónico a través de grabaciones de las clases)
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-[var(--color-primary)] mt-0.5 shrink-0">workspace_premium</span>
                        <div>
                          <strong className="text-[var(--color-on-surface)] block">Certificación</strong>
                          Nodo Tecnológico de la Municipalidad de SFVC
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium text-sm border border-[var(--color-primary)]/20">
                      <span className="material-symbols-outlined text-lg">event_upcoming</span>
                      Inicio de clases: Jueves 9 de Abril de 2026
                    </div>
                  </div>
                </section>

                <section className="bg-[var(--color-surface-container-low)] rounded-[2rem] p-10 lg:p-12 transition-all hover:bg-[var(--color-surface-container)]">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 shrink-0 bg-[var(--color-surface-container-highest)] text-[var(--color-tertiary)] rounded-[1.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(122,230,255,0.06)]">
                      <span className="material-symbols-outlined text-3xl">smart_toy</span>
                    </div>
                    <h3 className="text-3xl font-headline text-[var(--color-on-surface)] tracking-tight">Desarrollo de Aplicaciones Web con Inteligencia Artificial</h3>
                  </div>
                  <div className="md:pl-22">
                    <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed mb-8">
                      Aprende a crear aplicaciones web profesionales utilizando el "Vibe Coding". Utilizarás Inteligencia Artificial como copiloto para construir, desplegar y escalar desde apps de gestión personal hasta tu propio SaaS (Software as a Service), enfocándote en la creatividad y la lógica de negocio.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8 text-[var(--color-on-surface-variant)] text-base">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-[var(--color-tertiary)] mt-0.5 shrink-0">schedule</span>
                        <div>
                          <strong className="text-[var(--color-on-surface)] block">Duración</strong>
                          8 semanas (3 Proyectos)
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-[var(--color-tertiary)] mt-0.5 shrink-0">calendar_month</span>
                        <div>
                          <strong className="text-[var(--color-on-surface)] block">Clases</strong>
                          Martes de 15:00 a 18:00 horas
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-[var(--color-tertiary)] mt-0.5 shrink-0">laptop_mac</span>
                        <div>
                          <strong className="text-[var(--color-on-surface)] block">Modalidad</strong>
                          Virtual (Sincrónico o asincrónico a través de grabaciones de las clases)
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-[var(--color-tertiary)] mt-0.5 shrink-0">workspace_premium</span>
                        <div>
                          <strong className="text-[var(--color-on-surface)] block">Certificación</strong>
                          Nodo Tecnológico de la Municipalidad de SFVC
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] font-medium text-sm border border-[var(--color-tertiary)]/20">
                      <span className="material-symbols-outlined text-lg">event_upcoming</span>
                      Inicio de clases: Martes 7 de Abril de 2026
                    </div>
                  </div>
                </section>
              </div>
            </section>
          </div>

          {/* Enrollment Section - Floating Card */}
          <div className="w-full">
            <section id="enroll" className="bg-[var(--color-surface-container)]/80 backdrop-blur-[20px] rounded-[3rem] p-10 lg:p-14 shadow-[0_0_40px_rgba(63,255,139,0.06)] border border-[var(--color-outline-variant)]">
              <h2 className="text-[2rem] font-headline mb-8 text-[var(--color-on-surface)] tracking-tight">Matrícula</h2>
              <EnrollmentForm availableCourses={allCourses} />
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
