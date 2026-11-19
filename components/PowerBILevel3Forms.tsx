'use client';

import { useActionState } from 'react';
import { confirmLevel3Enrollment, saveLevel3Response } from '@/lib/actions-power-bi-level3';

export function Level3ResponseForm() {
  const [error, submit, pending] = useActionState(saveLevel3Response, null);

  return (
    <form action={submit} className="mt-5 space-y-4">
      <fieldset disabled={pending} className="space-y-2">
        <legend className="mb-2 font-semibold">¿Querés preinscribirte en Power BI Nivel 3?</legend>
        <label className="flex cursor-pointer items-center gap-3 p-2">
          <input type="radio" name="answer" value="yes" required className="accent-[var(--color-primary)]" />
          Sí, quiero preinscribirme.
        </label>
        <label className="flex cursor-pointer items-center gap-3 p-2">
          <input type="radio" name="answer" value="no" required className="accent-[var(--color-primary)]" />
          No, no voy a cursar este nivel.
        </label>
      </fieldset>
      {error && <p role="alert" className="text-sm text-[#FFB4A4]">{error}</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-[var(--color-primary)] px-5 py-2 font-semibold text-black disabled:opacity-60">
        {pending ? 'Guardando…' : 'Guardar respuesta'}
      </button>
    </form>
  );
}

export function Level3ConfirmForm({ responseId }: { responseId: string }) {
  const [error, submit, pending] = useActionState(() => confirmLevel3Enrollment(responseId), null);

  return (
    <form action={submit} className="space-y-1">
      <button type="submit" disabled={pending} className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-black disabled:opacity-60">
        {pending ? 'Confirmando…' : 'Confirmar inscripción'}
      </button>
      {error && <p role="alert" className="max-w-xs text-sm">{error}</p>}
    </form>
  );
}
