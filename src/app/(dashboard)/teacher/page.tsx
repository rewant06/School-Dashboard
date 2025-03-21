import Announcements from "@/components/Announcements"; // Importing the Announcements component to display announcements.
import BigCalendarContainer from "@/components/BigCalendarContainer"; // Importing a container for the teacher's schedule calendar.
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication to manage user authentication.

const TeacherPage = async () => {
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const userId = user.uid; // Get the Firebase UID of the logged-in user.

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row"> {/* Main container for the page layout */}
      {/* LEFT */}
      <div className="w-full xl:w-2/3"> {/* Left section for the schedule */}
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1> {/* Section title */}
          <BigCalendarContainer type="teacherId" id={userId} /> {/* Display the teacher's schedule */}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8"> {/* Right section for announcements */}
        <Announcements /> {/* Display announcements */}
      </div>
    </div>
  );
};

export default TeacherPage; // Export the TeacherPage component as the default export.