import { createServerClient } from '@/lib/pocketbase-server';
import type { BaseModel, Course, Delivery, User } from '@/types';

export const LEVEL_2_COURSE_ID = 'c8lo44fd4tjzkcm';
export const LEVEL_3_COURSE_ID = 'powerbilevel3pb';
export const LEVEL_2_FINAL_ID = 'qja1i2690t6n44w';
export const LEVEL_3_RESPONSES = 'power_bi_level3_responses';

export type Level3Response = BaseModel & {
  student: string;
  answer: 'yes' | 'no';
  expand?: { student?: User };
};

export function canManageLevel3(user: { id: string; role?: string } | null, course: Course) {
  return user?.role === 'admin' || (user?.role === 'docente' && course.teachers?.includes(user.id));
}

export function level2ApprovalFilter(pb: Awaited<ReturnType<typeof createServerClient>>) {
  return pb.filter('assignment = {:assignment} && status = "published" && verdict = "Aprobado"', {
    assignment: LEVEL_2_FINAL_ID,
  });
}

export async function getLevel3Response(pb: Awaited<ReturnType<typeof createServerClient>>, studentId: string) {
  const { items } = await pb.collection(LEVEL_3_RESPONSES).getList<Level3Response>(1, 1, {
    filter: pb.filter('student = {:student}', { student: studentId }),
  });
  return items[0];
}

export async function getLevel3StudentStatus(studentId: string) {
  const pb = await createServerClient();
  const response = await getLevel3Response(pb, studentId);
  if (response?.answer !== 'yes') return response?.answer;

  const target = await pb.collection('courses').getOne<Course>(LEVEL_3_COURSE_ID, { fields: 'id,students' });
  return target.students?.includes(studentId) ? 'confirmed' : 'yes';
}

export async function getLevel3Overview(course: Course) {
  const pb = await createServerClient();
  if (!canManageLevel3(pb.authStore.record, course)) return null;

  const [responses, approvals, target] = await Promise.all([
    pb.collection(LEVEL_3_RESPONSES).getFullList<Level3Response>({ expand: 'student', sort: 'created' }),
    pb.collection('deliveries').getFullList<Delivery>({ filter: level2ApprovalFilter(pb), fields: 'id,student' }),
    pb.collection('courses').getOne<Course>(LEVEL_3_COURSE_ID, { fields: 'id,students' }),
  ]);
  const students = new Set(course.students);

  return {
    responses: responses.filter(response => students.has(response.student)),
    approvals: new Map(approvals.map(delivery => [delivery.student, delivery.id])),
    enrolled: new Set(target.students),
  };
}
