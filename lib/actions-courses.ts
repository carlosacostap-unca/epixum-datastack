'use server';

import { createServerClient } from './pocketbase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Course } from '@/types';

export async function createCourse(formData: FormData) {
  const pb = await createServerClient();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  let startDate = formData.get('startDate') as string;
  let endDate = formData.get('endDate') as string;
  const status = formData.get('status') as 'borrador' | 'en curso' | 'finalizado';
  
  if (startDate && !startDate.includes('T')) {
    startDate = `${startDate}T12:00:00.000Z`;
  }
  
  if (endDate && !endDate.includes('T')) {
    endDate = `${endDate}T12:00:00.000Z`;
  }

  const students = formData.getAll('students') as string[];
  const teachers = formData.getAll('teachers') as string[];
  const classes = formData.getAll('classes') as string[];
  const assignments = formData.getAll('assignments') as string[];
  const inquiries = formData.getAll('inquiries') as string[];

  const data = {
    title,
    description,
    startDate,
    endDate,
    status: status || 'borrador',
    students,
    teachers,
    classes,
    assignments,
    inquiries,
  };

  try {
    const record = await pb.collection('courses').create<Course>(data);
    revalidatePath('/admin/courses');
    return record;
  } catch (error) {
    console.error('Error creating course:', error);
    throw new Error('Failed to create course');
  }
}

export async function updateCourse(id: string, formData: FormData) {
  const pb = await createServerClient();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  let startDate = formData.get('startDate') as string;
  let endDate = formData.get('endDate') as string;
  const status = formData.get('status') as 'borrador' | 'en curso' | 'finalizado';
  
  if (startDate && !startDate.includes('T')) {
    startDate = `${startDate}T12:00:00.000Z`;
  }
  
  if (endDate && !endDate.includes('T')) {
    endDate = `${endDate}T12:00:00.000Z`;
  }

  const students = formData.getAll('students') as string[];
  const teachers = formData.getAll('teachers') as string[];
  const classes = formData.getAll('classes') as string[];
  const assignments = formData.getAll('assignments') as string[];
  const inquiries = formData.getAll('inquiries') as string[];

  const data = {
    title,
    description,
    startDate,
    endDate,
    status: status || 'borrador',
    students,
    teachers,
    classes,
    assignments,
    inquiries,
  };

  try {
    const record = await pb.collection('courses').update<Course>(id, data);
    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${id}`);
    return record;
  } catch (error) {
    console.error('Error updating course:', error);
    throw new Error('Failed to update course');
  }
}

export async function deleteCourse(id: string) {
  const pb = await createServerClient();
  
  try {
    await pb.collection('courses').delete(id);
    revalidatePath('/admin/courses');
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('Failed to delete course');
  }
}

export async function updateCourseDocente(id: string, formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;
  
  if (!user || user.role !== 'docente') {
    throw new Error('Unauthorized');
  }
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  let startDate = formData.get('startDate') as string;
  let endDate = formData.get('endDate') as string;
  const status = formData.get('status') as 'borrador' | 'en curso' | 'finalizado';
  
  if (startDate && !startDate.includes('T')) {
    startDate = `${startDate}T12:00:00.000Z`;
  }
  
  if (endDate && !endDate.includes('T')) {
    endDate = `${endDate}T12:00:00.000Z`;
  }

  // Los docentes solo pueden actualizar campos básicos, no listas de estudiantes/profesores
  const data = {
    title,
    description,
    startDate,
    endDate,
    status: status || 'borrador',
  };

  try {
    // PocketBase validará si el docente tiene permisos (por regla de API: @request.auth.id ?= teachers.id)
    const record = await pb.collection('courses').update(id, data);
    revalidatePath(`/docentes/cursos/${id}`);
    revalidatePath('/docentes');
    return { success: true, record };
  } catch (error) {
    console.error('Error updating course by docente:', error);
    return { success: false, error: 'Error al actualizar el curso' };
  }
}
