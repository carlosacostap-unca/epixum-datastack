import { redirect } from 'next/navigation';
import { getCurrentUser } from "@/lib/pocketbase-server";
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import ProfileModalButton from "@/components/ProfileModalButton";

export default async function DocentesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'docente') {
    redirect('/');
  }

  const avatarUrl = user.avatar 
    ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Docente")}&background=3fff8b&color=0e0e0e`;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] flex flex-col font-body relative overflow-x-hidden">
      {/* Background elements - Ambient Glow */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full opacity-[0.06] pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--color-primary)] via-transparent to-transparent blur-[40px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--color-tertiary)] via-transparent to-transparent blur-[40px]"></div>
      </div>

      {/* Top Navigation Bar (Glassmorphism) */}
      <header className="sticky top-0 z-50 w-full bg-[var(--color-surface-variant)]/40 backdrop-blur-[20px] border-b border-[var(--color-outline-variant)]/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-8 md:gap-12">
            <Link href="/docentes" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[var(--color-surface-container-highest)] rounded-full flex items-center justify-center border border-[var(--color-outline-variant)] shadow-sm group-hover:border-[var(--color-primary)] transition-colors">
                <span className="material-symbols-outlined text-[var(--color-primary)] text-xl group-hover:scale-110 transition-transform">school</span>
              </div>
              <span className="font-headline font-bold text-lg hidden sm:block tracking-tight">Panel Docente</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/docentes" className="text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">local_library</span>
                Cursos
              </Link>
              <Link href="/docentes/clases" className="text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                Clases
              </Link>
              <Link href="/docentes/solicitudes" className="text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">group_add</span>
                Solicitudes
              </Link>
            </nav>
          </div>

          {/* Right: Avatar and Logout */}
          <div className="flex items-center gap-4 sm:gap-6">
            <ProfileModalButton 
              user={user as any} 
              pocketbaseUrl={process.env.NEXT_PUBLIC_POCKETBASE_URL || ''} 
              className="hover:scale-105 transition-transform cursor-pointer block"
            >
              <div className="h-10 w-10 rounded-full border-2 border-[var(--color-outline-variant)] overflow-hidden hover:border-[var(--color-primary)] transition-colors shadow-sm">
                <img 
                  alt="Avatar" 
                  className="h-full w-full object-cover" 
                  src={avatarUrl}
                />
              </div>
            </ProfileModalButton>

            <div className="w-[1px] h-6 bg-[var(--color-outline-variant)] opacity-50 hidden sm:block"></div>

            <LogoutButton 
              className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors flex items-center justify-center bg-transparent border-none p-2 hover:scale-110" 
              iconOnly={true} 
            />
          </div>
        </div>

        {/* Mobile Navigation (Bottom Bar or secondary top bar) - We'll put it below the header on mobile */}
        <div className="md:hidden flex items-center justify-around px-4 py-3 border-t border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-variant)]/60">
          <Link href="/docentes" className="flex flex-col items-center gap-1 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
            <span className="material-symbols-outlined text-[24px]">local_library</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Cursos</span>
          </Link>
          <Link href="/docentes/clases" className="flex flex-col items-center gap-1 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Clases</span>
          </Link>
          <Link href="/docentes/solicitudes" className="flex flex-col items-center gap-1 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
            <span className="material-symbols-outlined text-[24px]">group_add</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Solicitudes</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full max-w-[1600px] mx-auto">
         {children}
      </main>
    </div>
  );
}
