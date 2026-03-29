import CourseForm from '@/components/CourseForm';
import { getUsers, getAllClasses, getAllAssignments } from '@/lib/data';
import { getInquiries } from '@/lib/actions-inquiries';

export default async function NewCoursePage() {
  const users = await getUsers();
  const classes = await getAllClasses();
  const assignments = await getAllAssignments();
  const inquiries = await getInquiries();
  
  const students = users.filter(u => u.role === 'estudiante');
  const teachers = users.filter(u => u.role === 'docente' || u.role === 'admin');

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Crear Nuevo Curso</h1>
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <CourseForm 
          students={students} 
          teachers={teachers} 
          availableClasses={classes} 
          availableAssignments={assignments} 
          availableInquiries={inquiries}
        />
      </div>
    </div>
  );
}
