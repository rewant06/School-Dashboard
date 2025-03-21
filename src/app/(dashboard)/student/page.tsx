import Announcements from "@/components/Announcements"; // Importing the Announcements component to display announcements.
import BigCalendarContainer from "@/components/BigCalendarContainer"; // Importing a container for the student's schedule calendar.
// import BigCalendar from "@/components/BigCalender"; // Importing the BigCalendar component for displaying schedules.
import EventCalendar from "@/components/EventCalendar"; // Importing the EventCalendar component to display events.
import prisma from "@/lib/prisma"; // Importing Prisma client for database queries.
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication to manage user authentication.

const StudentPage = async () => {
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const userId = user.uid; // Get the Firebase UID of the logged-in user.

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId } }, // Filter classes where the logged-in user is a student.
    },
  });

  console.log(classItem); // Log the class data for debugging purposes.

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row"> {/* Main container for the page layout */}
      {/* LEFT */}
      <div className="w-full xl:w-2/3"> {/* Left section for the schedule */}
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule ({classItem[0]?.name || "N/A"})</h1> {/* Display the class name */}
          <BigCalendarContainer type="classId" id={classItem[0]?.id} /> {/* Display the schedule for the class */}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8"> {/* Right section for events and announcements */}
        <EventCalendar /> {/* Display the event calendar */}
        <Announcements /> {/* Display announcements */}
      </div>
    </div>
  );
};

export default StudentPage; // Export the StudentPage component as the default export.