import prisma from "@/lib/prisma"; // Import Prisma client to interact with the database.
import FormModal from "./FormModal"; // Import the FormModal component to render the form modal.
import { getAuth } from "firebase/auth"; // Import Firebase Authentication to manage user authentication.
import { jwtDecode } from "jwt-decode"; // Import a library to decode Firebase ID tokens to access custom claims.

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"; // Define the possible table names for the form.
  type: "create" | "update" | "delete"; // Define the type of operation (create, update, or delete).
  data?: any; // Optional data for the form.
  id?: number | string; // Optional ID for the form (used for update or delete operations).
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {}; // Initialize an empty object to store related data for the form.

  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const token = await user.getIdToken(); // Get the Firebase ID token for the logged-in user.
  const decodedToken: any = jwtDecode(token); // Decode the token to access custom claims.
  const role = decodedToken.role; // Extract the user's role from the custom claims.
  const currentUserId = user.uid; // Get the Firebase UID of the logged-in user.

  if (type !== "delete") {
    // If the operation is not a delete, fetch related data based on the table.
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true }, // Fetch teacher IDs, names, and surnames.
        });
        relatedData = { teachers: subjectTeachers }; // Store the fetched teachers in relatedData.
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true }, // Fetch grade IDs and levels.
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true }, // Fetch teacher IDs, names, and surnames.
        });
        relatedData = { teachers: classTeachers, grades: classGrades }; // Store the fetched teachers and grades in relatedData.
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true }, // Fetch subject IDs and names.
        });
        relatedData = { subjects: teacherSubjects }; // Store the fetched subjects in relatedData.
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true }, // Fetch grade IDs and levels.
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } }, // Fetch class data and the count of students in each class.
        });
        relatedData = { classes: studentClasses, grades: studentGrades }; // Store the fetched classes and grades in relatedData.
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId } : {}), // If the user is a teacher, filter lessons by their ID.
          },
          select: { id: true, name: true }, // Fetch lesson IDs and names.
        });
        relatedData = { lessons: examLessons }; // Store the fetched lessons in relatedData.
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table} // Pass the table name to the FormModal component.
        type={type} // Pass the operation type to the FormModal component.
        data={data} // Pass the form data to the FormModal component.
        id={id} // Pass the ID to the FormModal component.
        relatedData={relatedData} // Pass the related data to the FormModal component.
      />
    </div>
  );
};

export default FormContainer; // Export the FormContainer component as the default export.