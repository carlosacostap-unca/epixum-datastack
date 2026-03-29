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

  // 2. Teacher View (Assigned Courses)
  if (user && user.role === 'docente') {
    const teacherCourses = await getTeacherCourses(user.id);
    
    const courseImages = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD0YaQQYBFFaqMCx2lC5_rYpDsfPAenRnPLBGJsR-YHBRpw3v_wSU4Kyk9ktOunTeGRD4NUAErGR9zDQEAc5ysmWpPytuDPtEQDHZ3MDq6eyfOneMtmgr_refplu5wskmYoYWqF_ekS9kqAZ_E5Hsz_AIO3bZpS15YfXCm5rZNve3eSWP2D3t8pUCQ2MmnlFbxF1urRUVjh8i8FmOoggCQXryHw8rs5s_YW5f2fP6kbSfCrGosq-mZuXm8Ehb4wxhycHtu3tEnU2iM",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXuR_bRN5-oDcBG1g87DE6E7ST7TvvgzmzhSABakS1KMtWPvfhK4fGJSev2EekGP50qEpqiHz0VNURTcB4ca4ApY15lf074yQxHnspkdjveiJ8f78RJQ8zv7c_l40f7JI3TFaZecqxDDG107T6XyureuCpZhVsjFTtWxevVz33w0iUM3OsTkDwxY-AhihwJoh1R5i31CzAF5nU96krtr9HtCWLcwcDbGSiQdRkU9oW42FLx9NLwWyP9WTsAY1fU3gAQuvTvzzfHYE",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQnEFkwQ0KAoTSi519IyqR2-ubzovIG5le4kwXl2sn_Hl4qcNmSzRoXCrIhG_SMVeRnegv_w8md1AAJygt539zp3yGQNRaOywxniQDZPUjCbijxv_YLoOKQSaFJYgk2JYXyxxklqnplNGJ3gHhL9MxKsmajB69Th4KJo1MhdoD5b3Hea5yBd47OFQtj-NHg-YuT4bO7g3LarAObOfc5BZn8JlnZcEmJvt0S28Wx54h9d_gucj4PxiTUSkJaUvHXYLdjo2U8Cg3AmA"
    ];

    return (
      <div className="teacher-body min-h-screen text-on-surface antialiased font-body relative">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950/60 backdrop-blur-2xl border-r border-white/5 shadow-2xl flex flex-col py-6 z-40">
          <div className="px-6 mb-8 mt-2">
            <span className="text-2xl font-bold tracking-tighter text-indigo-500 font-headline mb-8 block">Epixum</span>
          </div>
          <nav className="flex-1 space-y-1">
            <Link href="/" className="bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 flex items-center gap-3 px-4 py-3 ml-2 rounded-l-lg font-['Epilogue'] font-medium text-sm tracking-wide">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <span>Mis Cursos</span>
            </Link>
            <Link href="/admin/enrollments" className="text-slate-400 flex items-center gap-3 px-4 py-3 ml-2 hover:bg-white/5 rounded-l-lg hover:text-slate-100 transition-all font-['Epilogue'] font-medium text-sm tracking-wide">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>group_add</span>
              <span>Solicitudes</span>
            </Link>
          </nav>
          <div className="px-6 mt-auto space-y-6">
            <Link href="#" className="text-slate-400 flex items-center justify-between px-0 py-2 hover:text-slate-100 transition-all duration-300 font-['Epilogue'] font-medium text-sm tracking-wide group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined group-hover:text-indigo-400 transition-colors">notifications</span>
                <span>Notificaciones</span>
              </div>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            </Link>
            
            <div className="pt-6 border-t border-white/5 space-y-2">
              <ProfileModalButton 
                user={user as any} 
                pocketbaseUrl={process.env.NEXT_PUBLIC_POCKETBASE_URL || ''} 
              />
              <LogoutButton className="text-slate-400 flex items-center gap-3 px-2 py-2 hover:text-red-400 transition-all font-medium text-sm w-full bg-transparent border-0 text-left rounded-xl hover:bg-white/5" />
            </div>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="pl-64 pt-0 min-h-screen">
          <div className="max-w-7xl mx-auto px-10 py-12">
            <header className="mb-12 flex justify-between items-end">
              <div>
                <h1 className="text-4xl md:text-[36px] font-headline font-medium tracking-tight text-on-surface mb-2">Mis Cursos</h1>
                <p className="text-on-surface-variant font-body text-base">PostDiplomatura • Ciclo Lectivo {new Date().getFullYear()}</p>
              </div>
            </header>
            
            {teacherCourses.length === 0 ? (
              <div className="text-center mt-12 glass-panel rounded-xl p-12">
                <h3 className="text-xl font-headline font-medium text-on-surface">No tienes cursos asignados</h3>
                <p className="mt-2 text-sm text-on-surface-variant">Contacta con un administrador para que te asigne a un curso.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {teacherCourses.map((course, index) => (
                  <article key={course.id} className="glass-panel group rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-500 hover:translate-y-[-4px] flex flex-col h-full">
                    <div className="relative h-48 mb-6 rounded-lg overflow-hidden border border-white/5">
                      <img alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={courseImages[index % courseImages.length]} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <span className={`backdrop-blur-md text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase ${index % 2 === 0 ? 'bg-indigo-600/80' : 'bg-cyan-600/80'}`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-headline font-medium mb-2 text-on-surface line-clamp-2">{course.title}</h3>
                    <p className="text-on-surface-variant font-body text-sm mb-6 flex-1 line-clamp-2">
                      {course.description || "Curso asignado para gestión académica."}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full border-2 border-surface-container bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-slate-400">
                            +{course.students?.length || 0}
                          </div>
                        </div>
                        <span className="text-[11px] font-label font-bold text-slate-500 uppercase tracking-widest">Alumnos</span>
                      </div>
                      <Link href={`/courses/${course.id}`} className={`flex items-center gap-2 transition-colors font-bold text-sm ${index % 2 === 0 ? 'text-indigo-400 hover:text-indigo-300' : 'text-cyan-400 hover:text-cyan-300'}`}>
                        Ingresar
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}


          </div>
        </main>
      </div>
    );
  }

  // 3. Admin View (Navigation Cards)
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
