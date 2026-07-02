"use client";

import AssignmentForm from "@/components/AssignmentForm";
import { useRouter } from "next/navigation";

export default function NewAssignmentForm({ courseId }: { courseId: string }) {
  const router = useRouter();

  return (
    <AssignmentForm
      courseId={courseId}
      isEmbedded={true}
      onClose={() => {
        router.push(`/docentes/cursos/${courseId}`);
        router.refresh();
      }}
    />
  );
}
