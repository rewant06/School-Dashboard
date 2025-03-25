import Announcements from "@/components/Announcements"; // Importing the Announcements component to display announcements.
import BigCalendarContainer from "@/components/BigCalendarContainer"; // Importing the BigCalendarContainer component to display a calendar.
import prisma from "@/lib/prisma"; // Importing Prisma client for database queries.
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication.

const ParentPage = async () => {
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    // If no user is logged in, return a message or redirect to login.
    return <div>Please log in to view this page.</div>;
  }

  const currentUserId = user.uid; // Firebase UID of the logged-in user.

  // Fetch students associated with the logged-in parent from the database.
  const students = await prisma.student.findMany({
    where: {
      parentId: currentUserId, // Filter students by the parent's UID.
    },
  });

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="">
        {students.map((student) => (
          <div className="w-full xl:w-2/3" key={student.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">
                Schedule ({student.name + " " + student.surname}) {/* Display the student's full name */}
              </h1>
              <BigCalendarContainer type="classId" id={student.classId} /> {/* Display the calendar for the student's class */}
            </div>
          </div>
        ))}
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements /> {/* Display announcements */}
      </div>
    </div>
  );
};

export default ParentPage; // Exporting the ParentPage component as default.