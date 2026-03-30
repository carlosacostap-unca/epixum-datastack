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
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] flex font-body relative overflow-hidden">
      {/* Background elements - Ambient Glow */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full opacity-[0.06] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--color-primary)] via-transparent to-transparent blur-[40px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--color-tertiary)] via-transparent to-transparent blur-[40px]"></div>
      </div>

      {/* Floating Navigation Rail (Glassmorphism) */}
      <aside className="fixed left-6 top-6 bottom-6 w-24 rounded-[3rem] bg-[var(--color-surface-variant)]/20 backdrop-blur-[20px] shadow-[0_0_40px_rgba(0,0,0,0.3)] flex flex-col items-center py-8 z-50 border border-[var(--color-outline-variant)]">
        
        {/* Top: Logo / School Icon */}
        <div className="mb-12">
          <div className="w-12 h-12 bg-[var(--color-surface-container-highest)] rounded-full flex items-center justify-center border border-[var(--color-outline-variant)] shadow-lg group hover:border-[var(--color-primary)] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-2xl group-hover:scale-110 transition-transform">school</span>
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col items-center gap-10 w-full mt-4">
          <Link href="/docentes" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-all hover:scale-110 relative group" title="Mis Cursos">
            <span className="material-symbols-outlined text-[28px]">local_library</span>
          </Link>
          
          <Link href="/docentes/clases" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-all hover:scale-110 relative group" title="Gestionar Clases">
            <span className="material-symbols-outlined text-[28px]">menu_book</span>
          </Link>

          <Link href="/docentes/solicitudes" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-all hover:scale-110 relative group" title="Solicitudes de Matrícula">
            <span className="material-symbols-outlined text-[28px]">group_add</span>
          </Link>
        </nav>

        {/* Bottom: Avatar and Logout */}
        <div className="mt-auto pt-8 flex flex-col items-center gap-6 w-full">
          <ProfileModalButton 
            user={user as any} 
            pocketbaseUrl={process.env.NEXT_PUBLIC_POCKETBASE_URL || ''} 
            className="hover:scale-110 transition-transform cursor-pointer block"
          >
            <div className="h-12 w-12 rounded-full border-2 border-[var(--color-outline-variant)] overflow-hidden hover:border-[var(--color-primary)] transition-colors shadow-lg">
              <img 
                alt="Avatar" 
                className="h-full w-full object-cover" 
                src={avatarUrl}
              />
            </div>
          </ProfileModalButton>

          <div className="w-12 h-[1px] bg-[var(--color-outline-variant)] opacity-30 my-2"></div>

          <LogoutButton 
            className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors flex items-center justify-center bg-transparent border-none p-2 hover:scale-110" 
            iconOnly={true} 
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative ml-36">
         {children}
      </main>
    </div>
  );
}
