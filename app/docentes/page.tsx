import { getCurrentUser } from "@/lib/pocketbase-server";
import { getTeacherCourses } from "@/lib/data";
import Link from "next/link";

export default async function DocentesPage() {
  const user = await getCurrentUser();
  
  if (!user) return null;

  const courses = await getTeacherCourses(user.id);

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full h-full">
      {/* Welcome Header */}
      <header className="mb-12 md:mb-24 flex flex-col md:flex-row gap-10 md:gap-20 items-start justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"></span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
              Panel Docente
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-headline tracking-tight text-[var(--color-on-surface)] mb-6">
            Hola, <span className="text-[var(--color-primary)]">{user.firstName || user.name?.split(' ')[0] || 'Docente'}</span>
          </h1>
          <p className="text-[var(--color-on-surface-variant)] text-lg md:text-xl leading-relaxed">
            Bienvenido al panel docente. Selecciona uno de tus cursos para gestionar su contenido, clases y trabajos prácticos.
          </p>
        </div>

        <div className="bg-[var(--color-surface-container-low)] rounded-[2rem] p-8 w-full md:min-w-[240px] md:w-auto relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/10 blur-[40px] -z-10 rounded-full pointer-events-none"></div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] mb-4">
            Cursos Activos
          </p>
          <div className="flex items-center gap-4">
            <span className="text-6xl font-headline font-bold text-[var(--color-primary)] leading-none">
              {courses.length}
            </span>
            <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">school</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full bg-[var(--color-surface-container-low)] rounded-[3rem] p-16 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl opacity-50 mb-6">school</span>
            <p className="text-[var(--color-on-surface-variant)] text-lg">No tienes cursos asignados actualmente.</p>
          </div>
        ) : (
          courses.map((course) => (
            <Link 
              href={`/docentes/cursos/${course.id}`} 
              key={course.id}
              className="bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] transition-colors rounded-[2.5rem] overflow-hidden group flex flex-col h-full border border-[var(--color-outline-variant)] shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">deployed_code</span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    course.status === 'en curso' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 
                    course.status === 'finalizado' ? 'bg-[var(--color-on-surface-variant)]/10 text-[var(--color-on-surface-variant)]' : 
                    'bg-[#FFB4A4]/10 text-[#FFB4A4]'
                  }`}>
                    {course.status || 'EN CURSO'}
                  </span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-[var(--color-on-surface)] mb-4 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                  {course.title}
                </h3>
                {course.description && (
                  <div className="text-sm text-[var(--color-on-surface-variant)] line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{__html: course.description}} />
                )}
              </div>
              
              <div className="px-8 py-6 border-t border-[var(--color-outline-variant)]/30 flex justify-between items-center mt-auto">
                <span className="text-sm font-bold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">Gestionar curso</span>
                <span className="material-symbols-outlined text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] text-xl group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* WhatsApp Community Section */}
      <div className="mt-12 bg-[#25D366]/5 rounded-[2.5rem] p-8 md:p-12 border border-[#25D366]/20 shadow-[0_0_30px_rgba(37,211,102,0.1)] flex flex-col md:flex-row items-center gap-8 md:gap-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#25D366]/10 blur-[60px] -z-10 rounded-full pointer-events-none"></div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_10px_#25D366]"></span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#25D366]">
              Comunidad
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-[var(--color-on-surface)] mb-4">
            Únete a nuestro grupo de <span className="text-[#25D366]">WhatsApp</span>
          </h2>
          <p className="text-[var(--color-on-surface-variant)] text-lg mb-8 leading-relaxed max-w-2xl">
            Mantente en contacto directo con la comunidad educativa, comparte novedades y coordina más fácilmente. Puedes unirte escaneando el código QR o haciendo clic en el botón.
          </p>
          <a 
            href="https://chat.whatsapp.com/G4Us5yY1obG0tJte1FPAQC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-zinc-900 font-bold py-4 px-8 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">chat</span>
            Unirme al grupo
          </a>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-xl flex-shrink-0 border border-white/10">
          <img 
            src="/shared_qr_code.png" 
            alt="Código QR de la Comunidad de WhatsApp" 
            className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
