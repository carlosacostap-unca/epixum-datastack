import { getCourse } from '@/lib/data';
import { getCurrentUser } from '@/lib/pocketbase-server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from "@/components/LogoutButton";
import ProfileModalButton from "@/components/ProfileModalButton";
import CreateInquiryForm from '@/components/inquiries/CreateInquiryForm';

interface NewCourseInquiryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewCourseInquiryPage({ params }: NewCourseInquiryPageProps) {
  const { id } = await params;
  
  const user = await getCurrentUser();
  
  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    redirect('/');
  }

  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  if (user.role === 'docente' && !course.teachers?.includes(user.id)) {
    redirect('/');
  }

  const courseClasses = course.expand?.classes || [];
  const courseAssignments = course.expand?.assignments || [];

  return (
    <div className="teacher-body min-h-screen text-on-surface antialiased font-body relative bg-surface selection:bg-primary/30">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/40 backdrop-blur-xl border-b border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold tracking-tighter text-indigo-500 font-headline">Epixum</span>
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors font-headline text-[15px] tracking-tight hover:bg-white/5 rounded-lg active:scale-95 duration-200">Dashboard</Link>
            <Link href="#" className="text-slate-400 hover:text-slate-200 transition-colors font-headline text-[15px] tracking-tight hover:bg-white/5 rounded-lg active:scale-95 duration-200">Calendario</Link>
            <Link href="#" className="text-indigo-400 font-semibold border-b-2 border-indigo-500 pb-1 font-headline text-[15px] tracking-tight">Recursos</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="p-2 text-slate-400 hover:text-slate-100 transition-all rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            </button>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-100 transition-all rounded-lg hover:bg-white/5">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <ProfileModalButton 
            user={user as any} 
            pocketbaseUrl={process.env.NEXT_PUBLIC_POCKETBASE_URL || ''}
            className="h-8 w-8 rounded-full border border-indigo-500/30 overflow-hidden ml-2 block hover:border-indigo-400 transition-colors"
          >
            <img 
              alt="Avatar del Docente" 
              className="h-full w-full object-cover" 
              src={user.avatar ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Docente")}&background=1418eb&color=fff`}
            />
          </ProfileModalButton>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-slate-950/60 backdrop-blur-2xl border-r border-white/5 shadow-2xl flex flex-col py-6 z-40">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <span className="material-symbols-outlined text-indigo-400">school</span>
            </div>
            <div>
              <h2 className="text-indigo-500 font-black text-sm uppercase tracking-widest font-headline line-clamp-1">{user.name || "Gestión Académica"}</h2>
              <p className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">Panel del Docente</p>
            </div>
          </div>
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
        </nav>
        <div className="px-6 mt-auto space-y-4">
          <div className="pt-4 border-t border-white/5 space-y-1">
            <Link href="#" className="text-slate-400 flex items-center gap-3 px-0 py-2 hover:text-slate-100 transition-all font-medium text-sm">
              <span className="material-symbols-outlined">help</span>
              <span>Soporte</span>
            </Link>
            <LogoutButton className="text-slate-400 flex items-center gap-3 px-0 py-2 hover:text-red-400 transition-all font-medium text-sm w-full bg-transparent border-0 text-left" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-24 pb-12 px-12 max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-on-surface-variant mb-4">
            <Link href={`/courses/${course.id}`} className="hover:text-secondary transition-colors text-[11px] font-bold uppercase tracking-widest">
              {course.title}
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link href={`/courses/${course.id}/inquiries`} className="hover:text-secondary transition-colors text-[11px] font-bold uppercase tracking-widest">
              Consultas
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Nueva Consulta</span>
          </div>
          <h1 className="font-headline text-[32px] font-medium tracking-tight text-on-surface">Crear Nueva Consulta</h1>
          <p className="text-on-surface-variant mt-2 text-base font-body">Inicia un nuevo tema de discusión o pregunta general para el curso.</p>
        </header>

        <div className="glass-panel p-8 rounded-xl border border-white/5">
            <CreateInquiryForm 
                classes={courseClasses}
                assignments={courseAssignments}
                courseId={course.id}
            />
        </div>

      </main>
    </div>
  );
}