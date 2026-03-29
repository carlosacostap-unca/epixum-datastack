import { getCourse } from '@/lib/data';
import { getCurrentUser } from '@/lib/pocketbase-server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from "@/components/LogoutButton";
import ProfileModalButton from "@/components/ProfileModalButton";
import { getInquiries } from '@/lib/actions-inquiries';
import FormattedDate from '@/components/FormattedDate';

interface CourseInquiriesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseInquiriesPage({ params }: CourseInquiriesPageProps) {
  const { id } = await params;
  
  const user = await getCurrentUser();
  
  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    redirect('/');
  }

  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  // Verificar que el docente pertenece a este curso (si no es admin)
  if (user.role === 'docente' && !course.teachers?.includes(user.id)) {
    redirect('/');
  }

  const inquiries = await getInquiries({ search: course.id }); // Use search with course ID for basic filtering, assuming relations are set up
  // Better yet, we filter the inquiries from the course relation
  const courseInquiries = course.expand?.inquiries || [];

  return (
    <div className="teacher-body min-h-screen text-on-surface antialiased font-body relative">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950/60 backdrop-blur-2xl border-r border-white/5 shadow-2xl flex flex-col py-6 z-40">
        <div className="px-6 mb-8">
          <ProfileModalButton 
            user={user as any} 
            pocketbaseUrl={process.env.NEXT_PUBLIC_POCKETBASE_URL || ''} 
          />
        </div>
        <nav className="flex-1 space-y-1">
          <Link href={`/courses/${course.id}`} className="text-slate-400 flex items-center gap-3 px-6 py-3 hover:text-slate-100 hover:bg-white/5 transition-all duration-300 hover:translate-x-1 font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
            <span>Sobre el curso</span>
          </Link>
          <Link href={`/courses/${course.id}/classes`} className="text-slate-400 flex items-center gap-3 px-6 py-3 hover:text-slate-100 hover:bg-white/5 transition-all duration-300 hover:translate-x-1 font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>video_library</span>
            <span>Clases</span>
          </Link>
          <Link href={`/courses/${course.id}/assignments`} className="text-slate-400 flex items-center gap-3 px-6 py-3 hover:text-slate-100 hover:bg-white/5 transition-all duration-300 hover:translate-x-1 font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>assignment</span>
            <span>Trabajos Prácticos</span>
          </Link>
          <Link href={`/courses/${course.id}/inquiries`} className="bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 flex items-center gap-3 px-4 py-3 ml-2 rounded-l-lg font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
            <span>Consultas</span>
          </Link>
          <Link href={`/courses/${course.id}/resources`} className="text-slate-400 flex items-center gap-3 px-6 py-3 hover:text-slate-100 hover:bg-white/5 transition-all duration-300 hover:translate-x-1 font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined">folder_open</span>
            <span>Biblioteca de Recursos</span>
          </Link>
        </nav>
        <div className="px-6 mt-auto space-y-4">
          <div className="pt-4 border-t border-white/5 space-y-1">
            <LogoutButton className="text-slate-400 flex items-center gap-3 px-0 py-2 hover:text-red-400 transition-all font-medium text-sm w-full bg-transparent border-0 text-left" />
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-64 min-h-screen px-12 py-10">
        {/* Header Section */}
        <header className="mb-12 max-w-6xl mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-4">
              <Link href={`/courses/${course.id}`} className="hover:text-indigo-400 transition-colors text-[11px] font-bold uppercase tracking-widest">
                {course.title}
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Consultas</span>
            </div>
            <h1 className="text-[36px] font-headline font-medium tracking-tight text-on-surface mb-2">Foro de Consultas</h1>
            <p className="text-on-surface-variant font-body text-lg">Responde a las dudas de los alumnos y fomenta la participación.</p>
          </div>
          <div className="flex gap-4 mb-2">
            <Link href={`/courses/${course.id}/inquiries/new`} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-semibold shadow-lg shadow-indigo-500/20">
              <span className="material-symbols-outlined text-sm">add</span>
              Nueva Consulta
            </Link>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
            <div className="glass-panel p-6 rounded-xl border border-white/5 flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <span className="material-symbols-outlined text-2xl">forum</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total</p>
                    <p className="text-2xl font-headline font-bold text-on-surface">{courseInquiries.length}</p>
                </div>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-white/5 flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <span className="material-symbols-outlined text-2xl">help_center</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Pendientes</p>
                    <p className="text-2xl font-headline font-bold text-on-surface">{courseInquiries.filter(i => i.status === 'Pendiente').length}</p>
                </div>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-white/5 flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Resueltas</p>
                    <p className="text-2xl font-headline font-bold text-on-surface">{courseInquiries.filter(i => i.status === 'Resuelta').length}</p>
                </div>
            </div>
        </div>

        {/* Inquiries Grid */}
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {courseInquiries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courseInquiries.map((inquiry) => (
                <section key={inquiry.id} className="glass-panel rounded-xl p-6 flex flex-col hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden border border-white/10">
                          {inquiry.expand?.author ? (
                              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(inquiry.expand.author.name || "Usuario")}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  <span className="material-symbols-outlined text-sm">person</span>
                              </div>
                          )}
                      </div>
                      <div>
                        <h3 className="text-lg font-headline font-medium text-on-surface line-clamp-1">{inquiry.title}</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mt-1 flex items-center gap-1">
                          {inquiry.expand?.author?.name || "Usuario Desconocido"} • <FormattedDate date={inquiry.created} />
                        </p>
                      </div>
                    </div>
                    {inquiry.status === 'Pendiente' ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">Pendiente</span>
                    ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Resuelta</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1">{inquiry.description}</div>
                  
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                        {(inquiry.expand?.class || inquiry.expand?.assignment) && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <span className="material-symbols-outlined text-[14px]">sell</span>
                                {inquiry.expand?.class ? 'Clase' : 'TP'}: {inquiry.expand?.class?.title || inquiry.expand?.assignment?.title}
                            </span>
                        )}
                    </div>
                    <Link href={`/inquiries/${inquiry.id}`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      Ver consulta
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <section className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">forum</span>
              </div>
              <h3 className="text-xl font-headline font-medium mb-2">No hay consultas aún</h3>
              <p className="text-slate-400 mb-6 max-w-md">Las dudas y preguntas de los alumnos aparecerán aquí.</p>
              <Link href={`/courses/${course.id}/inquiries/new`} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-indigo-500/20">
                <span className="material-symbols-outlined text-sm">add</span>
                Crear Primera Consulta
              </Link>
            </section>
          )}
        </div>

        {/* Footer / Credits */}
        <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-slate-600 pb-8">
          <p className="text-xs font-body">© {new Date().getFullYear()} Epixum. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs hover:text-indigo-400 transition-colors">Privacidad</Link>
            <Link href="#" className="text-xs hover:text-indigo-400 transition-colors">Términos</Link>
            <Link href="#" className="text-xs hover:text-indigo-400 transition-colors">Ayuda</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}