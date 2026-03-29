'use server';

import { createServerClient } from './pocketbase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Course } from '@/types';

export async function createCourse(formData: FormData) {
  const pb = await createServerClient();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const status = formData.get('status') as 'borrador' | 'en curso' | 'finalizado';
  
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
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const status = formData.get('status') as 'borrador' | 'en curso' | 'finalizado';
  
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
