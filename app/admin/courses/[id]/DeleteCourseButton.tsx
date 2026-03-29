'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCourse } from '@/lib/actions-courses';

export default function DeleteCourseButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de que deseas eliminar el curso "${title}"? Esta acción no se puede deshacer.`)) {
      setLoading(true);
      try {
        await deleteCourse(id);
        router.push('/admin/courses');
      } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al eliminar el curso');
        setLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
    >
      {loading ? 'Eliminando...' : 'Eliminar Curso'}
    </button>
  );
}
