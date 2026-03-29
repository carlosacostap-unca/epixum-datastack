import CourseForm from '@/components/CourseForm';
import { getCourse, getUsers, getAllClasses, getAllAssignments } from '@/lib/data';
import { getInquiries } from '@/lib/actions-inquiries';
import { notFound } from 'next/navigation';
import DeleteCourseButton from './DeleteCourseButton';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);
  
  if (!course) {
    notFound();
  }

  const users = await getUsers();
  const classes = await getAllClasses();
  const assignments = await getAllAssignments();
  const inquiries = await getInquiries();
  
  const students = users.filter(u => u.role === 'estudiante');
  const teachers = users.filter(u => u.role === 'docente' || u.role === 'admin');

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Editar Curso: {course.title}</h1>
        <DeleteCourseButton id={course.id} title={course.title} />
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <CourseForm 
          course={course} 
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
