'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Course, User, Class, Assignment, Inquiry } from '@/types';
import { createCourse, updateCourse } from '@/lib/actions-courses';
import RichTextEditor from '@/components/RichTextEditor';
import UserMultiSelect from '@/components/UserMultiSelect';
import Link from 'next/link';

interface CourseFormProps {
  course?: Course;
  students: User[];
  teachers: User[];
  availableClasses: Class[];
  availableAssignments: Assignment[];
  availableInquiries: Inquiry[];
}

export default function CourseForm({ 
  course, 
  students, 
  teachers, 
  availableClasses, 
  availableAssignments, 
  availableInquiries 
}: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Usar estado para la descripción del RichTextEditor
  const [description, setDescription] = useState(course?.description || '');

  const isEdit = !!course;

  const getLocalDateString = (isoDate: string | undefined) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    // Asegurarse de inyectar la descripción del editor en el form data
    formData.set('description', description);

    // Convertir fechas locales a UTC
    const startDate = formData.get("startDate") as string;
    if (startDate && !startDate.includes('T')) {
      const date = new Date(`${startDate}T00:00:00`);
      formData.set("startDate", date.toISOString());
    }
    const endDate = formData.get("endDate") as string;
    if (endDate && !endDate.includes('T')) {
      const date = new Date(`${endDate}T00:00:00`);
      formData.set("endDate", date.toISOString());
    }

    try {
      if (isEdit) {
        await updateCourse(course.id, formData);
        router.push('/admin/courses');
      } else {
        await createCourse(formData);
        router.push('/admin/courses');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el curso');
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>Título del Curso *</label>
        <input
          type="text"
          id="title"
          name="title"
          required
          defaultValue={course?.title}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden bg-white dark:bg-zinc-900">
          <RichTextEditor 
            content={description} 
            onChange={setDescription} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="startDate" className={labelClass}>Fecha de Inicio</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            defaultValue={getLocalDateString(course?.startDate)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="endDate" className={labelClass}>Fecha de Finalización</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            defaultValue={getLocalDateString(course?.endDate)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>Estado</label>
          <select
            id="status"
            name="status"
            defaultValue={course?.status || 'borrador'}
            className={inputClass}
          >
            <option value="borrador">Borrador</option>
            <option value="en curso">En Curso</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <div>
          <UserMultiSelect 
            users={teachers} 
            defaultSelected={course?.teachers || []} 
            name="teachers" 
            label="Docentes Asignados" 
            placeholder="Buscar por nombre o email..." 
          />
        </div>

        <div>
          <UserMultiSelect 
            users={students} 
            defaultSelected={course?.students || []} 
            name="students" 
            label="Estudiantes Matriculados" 
            placeholder="Buscar por nombre o email..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <div>
          <label htmlFor="classes" className={labelClass}>Clases</label>
          <select
            id="classes"
            name="classes"
            multiple
            defaultValue={course?.classes || []}
            className={`${inputClass} h-32`}
          >
            {availableClasses.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Mantén presionado Ctrl o Cmd para seleccionar múltiples</p>
        </div>

        <div>
          <label htmlFor="assignments" className={labelClass}>Trabajos Prácticos</label>
          <select
            id="assignments"
            name="assignments"
            multiple
            defaultValue={course?.assignments || []}
            className={`${inputClass} h-32`}
          >
            {availableAssignments.map(assignment => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Mantén presionado Ctrl o Cmd para seleccionar múltiples</p>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <label htmlFor="inquiries" className={labelClass}>Consultas</label>
        <select
          id="inquiries"
          name="inquiries"
          multiple
          defaultValue={course?.inquiries || []}
          className={`${inputClass} h-32 md:w-1/2`}
        >
          {availableInquiries.map(inquiry => (
            <option key={inquiry.id} value={inquiry.id}>
              {inquiry.title || 'Sin título'}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Mantén presionado Ctrl o Cmd para seleccionar múltiples</p>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <Link
          href="/admin/courses"
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando...' : isEdit ? 'Actualizar Curso' : 'Crear Curso'}
        </button>
      </div>
    </form>
  );
}
