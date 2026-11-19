'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/pocketbase-server';
import {
  canManageLevel3,
  getLevel3Response,
  level2ApprovalFilter,
  LEVEL_2_COURSE_ID,
  LEVEL_3_COURSE_ID,
  LEVEL_3_RESPONSES,
  type Level3Response,
} from '@/lib/power-bi-level3';
import type { Course } from '@/types';

function refreshCoursePages() {
  revalidatePath(`/estudiantes/cursos/${LEVEL_2_COURSE_ID}`);
  revalidatePath(`/docentes/cursos/${LEVEL_2_COURSE_ID}`);
  revalidatePath(`/admin/courses/${LEVEL_2_COURSE_ID}`);
}

export async function saveLevel3Response(_state: string | null, formData: FormData) {
  const answer = formData.get('answer');
  if (answer !== 'yes' && answer !== 'no') return 'Elegí una de las dos opciones.';

  const pb = await createServerClient();
  const user = pb.authStore.record;
  if (user?.role !== 'estudiante') return 'Iniciá sesión con tu cuenta de estudiante.';

  try {
    const course = await pb.collection('courses').getOne<Course>(LEVEL_2_COURSE_ID, { fields: 'id,students' });
    if (!course.students?.includes(user.id)) return 'Esta preinscripción es para estudiantes del Nivel 2.';

    try {
      await pb.collection(LEVEL_3_RESPONSES).create({ student: user.id, answer });
    } catch (error) {
      if (!(await getLevel3Response(pb, user.id))) throw error;
    }
    refreshCoursePages();
    return null;
  } catch {
    return 'No se pudo guardar tu respuesta. Recargá la página e intentá de nuevo.';
  }
}

export async function confirmLevel3Enrollment(responseId: string) {
  const pb = await createServerClient();
  const user = pb.authStore.record;
  if (user?.role !== 'admin' && user?.role !== 'docente') return 'No tenés permiso para confirmar esta inscripción.';

  try {
    const course = await pb.collection('courses').getOne<Course>(LEVEL_2_COURSE_ID, { fields: 'id,students,teachers' });
    if (!canManageLevel3(user, course)) return 'No tenés permiso para confirmar esta inscripción.';

    const response = await pb.collection(LEVEL_3_RESPONSES).getOne<Level3Response>(responseId);
    if (response.answer !== 'yes' || !course.students?.includes(response.student)) {
      return 'El estudiante no tiene una preinscripción vigente.';
    }

    const approved = await pb.collection('deliveries').getList(1, 1, {
      filter: `${level2ApprovalFilter(pb)} && ${pb.filter('student = {:student}', { student: response.student })}`,
      fields: 'id',
    });
    if (!approved.items.length) return 'El Trabajo Final del Nivel 2 debe figurar como aprobado y publicado.';

    await pb.collection('courses').update(LEVEL_3_COURSE_ID, { 'students+': response.student });
    refreshCoursePages();
    revalidatePath('/estudiantes');
    revalidatePath(`/admin/courses/${LEVEL_3_COURSE_ID}`);
    revalidatePath(`/docentes/cursos/${LEVEL_3_COURSE_ID}`);
    return null;
  } catch {
    return 'No se pudo confirmar la inscripción. Volvé a intentarlo.';
  }
}
