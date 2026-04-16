import LinkAccountForm from "./LinkAccountForm";
import Link from "next/link";

export default function LinkAccountPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] flex flex-col items-center justify-center relative overflow-hidden font-body p-6 lg:p-20">
      {/* Background elements - Ambient Glow */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--color-tertiary)_0%,_transparent_70%)] blur-[100px] opacity-20"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        {/* Left side: Editorial Asymmetry */}
        <div className="space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-[var(--color-surface-container)] shadow-[0_0_40px_rgba(63,255,139,0.06)] border border-[var(--color-outline-variant)]">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">link</span>
          </div>
          
          <div>
            <p className="text-[var(--color-on-surface-variant)] text-xs font-body uppercase tracking-[0.05em] font-semibold mb-4">
              Solicitud de Acceso
            </p>
            <h1 className="text-5xl lg:text-6xl font-headline font-bold tracking-tight mb-6 text-[var(--color-on-surface)] leading-tight">
              Actualizá tu perfil.
            </h1>
            <p className="text-[var(--color-on-surface-variant)] text-lg font-body max-w-md leading-relaxed">
              Completa tus datos personales y el correo de Google que utilizarás para ingresar a la plataforma. Nuestro equipo validará tu identidad para brindarte acceso.
            </p>
          </div>
        </div>

        {/* Right side: The Glass Card */}
        <div className="w-full bg-[var(--color-surface-container-low)]/80 rounded-[3rem] p-10 lg:p-12 shadow-[0_0_40px_rgba(63,255,139,0.06)] border border-[var(--color-outline-variant)] backdrop-blur-[20px]">
          <LinkAccountForm />
        </div>
      </div>
    </div>
  );
}