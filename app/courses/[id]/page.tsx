import { getCourse } from '@/lib/data';
import { getCurrentUser } from '@/lib/pocketbase-server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from "@/components/LogoutButton";
import ProfileModalButton from "@/components/ProfileModalButton";

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
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

  const classes = course.expand?.classes || [];
  const assignments = course.expand?.assignments || [];
  const students = course.expand?.students || [];

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
          <Link href={`/courses/${course.id}`} className="bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 flex items-center gap-3 px-4 py-3 ml-2 rounded-l-lg font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            <span>Sobre el curso</span>
          </Link>
          <Link href={`/courses/${course.id}/classes`} className="text-slate-400 flex items-center gap-3 px-6 py-3 hover:text-slate-100 hover:bg-white/5 transition-all duration-300 hover:translate-x-1 font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined">video_library</span>
            <span>Clases</span>
          </Link>
          <Link href={`/courses/${course.id}/assignments`} className="text-slate-400 flex items-center gap-3 px-6 py-3 hover:text-slate-100 hover:bg-white/5 transition-all duration-300 hover:translate-x-1 font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined">assignment</span>
            <span>Trabajos Prácticos</span>
          </Link>
          <Link href={`/courses/${course.id}/inquiries`} className="text-slate-400 flex items-center gap-3 px-6 py-3 hover:text-slate-100 hover:bg-white/5 transition-all duration-300 hover:translate-x-1 font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined">forum</span>
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
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">{course.status || 'Activo'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            </div>
            <h1 className="text-[36px] font-headline font-medium tracking-tight text-on-surface mb-2">{course.title}</h1>
            <p className="text-on-surface-variant font-body text-lg">Nodo Tecnológico SFVC • {new Date().getFullYear()}</p>
          </div>
          <div className="flex gap-4 mb-2">
            <button className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg hover:bg-white/10 transition-all text-sm font-semibold">
              <span className="material-symbols-outlined text-sm">edit</span>
              Editar Info
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Description: Large Card */}
          <section className="glass-panel rounded-xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-indigo-400">description</span>
              <h2 className="text-xl font-headline font-medium">Descripción General</h2>
            </div>
            <div className="space-y-4 text-on-surface-variant leading-relaxed font-body">
              {course.description ? (
                <div dangerouslySetInnerHTML={{ __html: course.description }} />
              ) : (
                <p>Este curso no tiene una descripción detallada por el momento. Agrega una descripción para que los alumnos puedan conocer más sobre los temas a tratar.</p>
              )}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
              <div>
                <p className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Duración</p>
                <p className="text-indigo-400 font-headline font-semibold">
                  {course.startDate && course.endDate 
                    ? `${Math.ceil((new Date(course.endDate).getTime() - new Date(course.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} Semanas`
                    : '12 Semanas'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Inscriptos</p>
                <p className="text-indigo-400 font-headline font-semibold">{students.length} Alumnos</p>
              </div>
              <div>
                <p className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Nivel</p>
                <p className="text-indigo-400 font-headline font-semibold">Avanzado</p>
              </div>
            </div>
          </section>

          {/* Cronograma: Side Column */}
          <section className="glass-panel rounded-xl p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -z-10"></div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-headline font-medium">Cronograma Próximo</h2>
              <span className="material-symbols-outlined text-slate-500">calendar_today</span>
            </div>
            <div className="space-y-4">
              {classes.slice(0, 3).map((cls, idx) => (
                <div key={cls.id} className={`p-4 rounded-lg bg-white/5 border-l-2 ${idx === 0 ? 'border-indigo-500' : 'border-slate-700'}`}>
                  <p className={`text-[10px] font-label font-bold uppercase tracking-widest mb-1 ${idx === 0 ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {cls.date ? new Date(cls.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Próximamente'}
                  </p>
                  <h4 className="font-bold text-sm line-clamp-1">{cls.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">19:00 - 21:00 hs</p>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="p-4 rounded-lg bg-white/5 border-l-2 border-slate-700 text-sm text-slate-400">
                  No hay clases programadas.
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Ver calendario completo
            </button>
          </section>


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