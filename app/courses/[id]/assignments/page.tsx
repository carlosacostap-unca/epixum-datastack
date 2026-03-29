import { getCourse } from '@/lib/data';
import { getCurrentUser } from '@/lib/pocketbase-server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from "@/components/LogoutButton";
import ProfileModalButton from "@/components/ProfileModalButton";

interface CourseAssignmentsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseAssignmentsPage({ params }: CourseAssignmentsPageProps) {
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

  const assignments = course.expand?.assignments || [];

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
          <Link href={`/courses/${course.id}/assignments`} className="bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 flex items-center gap-3 px-4 py-3 ml-2 rounded-l-lg font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
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
            <div className="flex items-center gap-2 text-on-surface-variant mb-4">
              <Link href={`/courses/${course.id}`} className="hover:text-indigo-400 transition-colors text-[11px] font-bold uppercase tracking-widest">
                {course.title}
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Trabajos Prácticos</span>
            </div>
            <h1 className="text-[36px] font-headline font-medium tracking-tight text-on-surface mb-2">Trabajos Prácticos</h1>
            <p className="text-on-surface-variant font-body text-lg">Gestiona las entregas y evaluaciones del curso.</p>
          </div>
          <div className="flex gap-4 mb-2">
            <Link href={`/courses/${course.id}/assignments/new`} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-semibold shadow-lg shadow-indigo-500/20">
              <span className="material-symbols-outlined text-sm">add</span>
              Nuevo TP
            </Link>
          </div>
        </header>

        {/* Assignments Grid */}
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {assignments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignments.map((assignment) => (
                <section key={assignment.id} className="glass-panel rounded-xl p-6 flex flex-col hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <span className="material-symbols-outlined text-indigo-400">assignment</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-headline font-medium text-on-surface line-clamp-1">{assignment.title}</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mt-1">
                          {assignment.dueDate ? `Vence: ${new Date(assignment.dueDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` : 'Sin fecha límite'}
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-white transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                  
                  <div className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1" dangerouslySetInnerHTML={{ __html: assignment.description || 'Sin descripción' }}></div>
                  
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-sm">link</span>
                      <span className="text-xs text-slate-400">{assignment.expand?.links?.length || 0} recursos adjuntos</span>
                    </div>
                    <Link href={`/courses/${course.id}/assignments/${assignment.id}`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      Ver detalles
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <section className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">assignment</span>
              </div>
              <h3 className="text-xl font-headline font-medium mb-2">No hay trabajos prácticos</h3>
              <p className="text-slate-400 mb-6 max-w-md">Aún no has creado ningún trabajo práctico para este curso. Los trabajos prácticos permiten evaluar el progreso de los alumnos.</p>
              <Link href={`/courses/${course.id}/assignments/new`} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-indigo-500/20">
                <span className="material-symbols-outlined text-sm">add</span>
                Crear el primer TP
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
