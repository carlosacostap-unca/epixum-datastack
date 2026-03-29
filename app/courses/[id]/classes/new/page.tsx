import { getCourse } from '@/lib/data';
import { getCurrentUser } from '@/lib/pocketbase-server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from "@/components/LogoutButton";
import ProfileModalButton from "@/components/ProfileModalButton";
import NewClassForm from './NewClassForm';

interface NewClassPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewClassPage({ params }: NewClassPageProps) {
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
          <Link href={`/courses/${course.id}/classes`} className="bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 flex items-center gap-3 px-4 py-3 ml-2 rounded-l-lg font-['Epilogue'] font-medium text-sm tracking-wide">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>video_library</span>
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
            <div className="flex items-center gap-2 text-on-surface-variant mb-4">
              <Link href={`/courses/${course.id}`} className="hover:text-indigo-400 transition-colors text-[11px] font-bold uppercase tracking-widest">
                {course.title}
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <Link href={`/courses/${course.id}/classes`} className="hover:text-indigo-400 transition-colors text-[11px] font-bold uppercase tracking-widest">
                Clases
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Nueva Clase</span>
            </div>
            <h1 className="text-[36px] font-headline font-medium tracking-tight text-on-surface mb-2">Nueva Clase</h1>
            <p className="text-on-surface-variant font-body text-lg">Define los detalles de la próxima sesión académica.</p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          <NewClassForm courseId={course.id} />
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
