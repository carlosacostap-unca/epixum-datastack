"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User } from "@/types";
import { updateUserProfile } from "@/lib/actions-users";

interface ProfileModalButtonProps {
  user: User;
  pocketbaseUrl: string;
  children?: React.ReactNode;
  className?: string;
}

export default function ProfileModalButton({ user, pocketbaseUrl, children, className }: ProfileModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const nameParts = user.name ? user.name.split(' ') : [];
  const initialFirstName = user.firstName || nameParts[0] || '';
  const initialLastName = user.lastName || nameParts.slice(1).join(' ') || '';

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    phone: user.phone || '',
    dni: user.dni || '',
    birthDate: user.birthDate ? user.birthDate.substring(0, 10) : ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsEditing(false);
      setError("");
    }, 300); // reset after animation
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      const res = await updateUserProfile(user.id, formData);
      if (res.success) {
        setIsEditing(false);
        // Data is revalidated, UI will update naturally or via Next.js router
      } else {
        setError(res.error || "Error al guardar");
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarUrl = user.avatar 
    ? `${pocketbaseUrl}/api/files/_pb_users_auth_/${user.id}/${user.avatar}` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Docente")}&background=1418eb&color=fff`;

  // Determine role display name
  const roleDisplay = user.role === 'admin' ? 'Administrador' : 
                      user.role === 'docente' ? 'Profesor' : 'Estudiante';

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={className || "w-full flex items-center gap-3 text-left hover:bg-[var(--color-surface-container)] p-2 -ml-2 rounded-[2rem] transition-colors cursor-pointer group"}
      >
        {children ? children : (
          <>
            <div className="h-10 w-10 rounded-full border-2 border-[var(--color-surface-container-highest)] overflow-hidden group-hover:border-[var(--color-primary)] transition-colors">
              <img 
                alt="Avatar" 
                className="h-full w-full object-cover" 
                src={avatarUrl}
              />
            </div>
            <div>
              <h2 className="text-[var(--color-primary)] font-black text-sm uppercase tracking-widest font-headline line-clamp-1 group-hover:opacity-80 transition-opacity">
                {user.name || "Usuario"}
              </h2>
              <p className="text-[var(--color-on-surface-variant)] text-[11px] font-bold tracking-widest uppercase group-hover:text-[var(--color-on-surface)] transition-colors">
                Mi Perfil
              </p>
            </div>
          </>
        )}
      </button>

      {/* Portal for Modal and Backdrop */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
              isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={handleClose}
          />

          {/* Modal / Sidebar */}
          <div 
            className={`fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-[var(--color-surface-container-low)]/90 backdrop-blur-[30px] border-l-4 border-[var(--color-surface-container)] shadow-2xl z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
        <div className="flex items-center justify-between p-8 border-b-4 border-[var(--color-surface-container)]">
          <h2 className="text-lg font-headline font-bold text-[var(--color-on-surface)] tracking-wide">
            {isEditing ? "Editar Perfil" : "Detalles de Usuario"}
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-[var(--color-surface-container-highest)] scrollbar-track-transparent">
          {isEditing ? (
            <div className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-label font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
                    Nombre
                  </label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange}
                    className="w-full bg-[var(--color-surface-container)] border-none rounded-xl px-4 py-3 text-[var(--color-on-surface)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
                    Apellido
                  </label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange}
                    className="w-full bg-[var(--color-surface-container)] border-none rounded-xl px-4 py-3 text-[var(--color-on-surface)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
                    Teléfono
                  </label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className="w-full bg-[var(--color-surface-container)] border-none rounded-xl px-4 py-3 text-[var(--color-on-surface)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
                    DNI
                  </label>
                  <input 
                    type="text" 
                    name="dni" 
                    value={formData.dni} 
                    onChange={handleChange}
                    className="w-full bg-[var(--color-surface-container)] border-none rounded-xl px-4 py-3 text-[var(--color-on-surface)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input 
                    type="date" 
                    name="birthDate" 
                    value={formData.birthDate} 
                    onChange={handleChange}
                    className="w-full bg-[var(--color-surface-container)] border-none rounded-xl px-4 py-3 text-[var(--color-on-surface)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Avatar & Name */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full blur-xl"></div>
                  <div className="h-28 w-28 rounded-full border-4 border-[var(--color-surface-container-highest)] overflow-hidden relative shadow-[0_0_30px_rgba(63,255,139,0.1)]">
                    <img 
                      alt="Avatar Completo" 
                      className="h-full w-full object-cover" 
                      src={avatarUrl}
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-headline font-bold text-[var(--color-on-surface)] mb-2">{user.name || "Usuario"}</h3>
                <span className="px-4 py-1.5 bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] rounded-full text-[10px] font-bold tracking-widest uppercase">
                  {roleDisplay}
                </span>
              </div>

              {/* Contact Info */}
              <div className="mb-10">
                <h4 className="text-[11px] font-label font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-4">
                  Información de Contacto
                </h4>
                <div className="glass-panel rounded-[2rem] p-2 bg-[var(--color-surface-container)]">
                  <div className="flex items-center gap-4 p-4 border-b-2 border-[var(--color-surface-container-highest)]">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]">mail</span>
                    <span className="text-sm text-[var(--color-on-surface)]">{user.email || "No especificado"}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 border-b-2 border-[var(--color-surface-container-highest)]">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]">call</span>
                    <span className="text-sm text-[var(--color-on-surface)]">{user.phone || "No especificado"}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]">badge</span>
                    <span className="text-sm text-[var(--color-on-surface)]">{user.dni ? `DNI: ${user.dni}` : "DNI no especificado"}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mb-8">
                <h4 className="text-[11px] font-label font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-4">
                  Datos Adicionales
                </h4>
                <div className="glass-panel rounded-[2rem] p-2 bg-[var(--color-surface-container)]">
                  <div className="flex items-center gap-4 p-4 border-b-2 border-[var(--color-surface-container-highest)]">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]">account_circle</span>
                    <span className="text-sm text-[var(--color-on-surface)]">@{user.username || "usuario"}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]">calendar_month</span>
                    <span className="text-sm text-[var(--color-on-surface)]">
                      {user.birthDate 
                        ? new Date(user.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) 
                        : "Fecha de nacimiento no especificada"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-8 border-t-4 border-[var(--color-surface-container)] flex gap-4 bg-[var(--color-surface-container-low)]">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                }}
                disabled={isSaving}
                className="flex-1 py-4 px-6 rounded-[2rem] border-2 border-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] text-sm font-bold tracking-widest uppercase hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-4 px-6 rounded-[2rem] bg-[var(--color-primary)] hover:opacity-80 text-[var(--color-on-primary)] text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full py-4 px-6 rounded-[2rem] bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Editar Perfil
            </button>
          )}
        </div>
      </div>
      </>, document.body)}
    </>
  );
}