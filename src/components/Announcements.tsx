import prisma from "@/lib/prisma"; // Importing Prisma client for database queries.
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication.
import {jwtDecode} from "jwt-decode"; // Importing the default export for decoding JWT tokens.

type DecodedToken = {
  role?: string; // Define the structure of the decoded token. Add other claims if needed.
  [key: string]: unknown; // Allow additional claims if necessary.
};

const Announcements = async () => {
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    // If no user is logged in, return a message or redirect to login.
    return <div>Please log in to view announcements.</div>;
  }

  // Get the user's ID token and decode it to extract custom claims (e.g., role).
  const token = await user.getIdToken(); // Get the Firebase ID token.
  const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token); // Decode the token to access custom claims.
  const userId = user.uid; // Firebase UID of the logged-in user.
  const role = decodedToken.role; // Extract the user's role from custom claims.

  // Define role-based conditions for filtering announcements.
  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId } } }, // Filter announcements for teachers.
    student: { students: { some: { id: userId } } }, // Filter announcements for students.
    parent: { students: { some: { parentId: userId } } }, // Filter announcements for parents.
  };

  // Fetch announcements from the database.
  const data = await prisma.announcement.findMany({
    take: 3, // Limit the number of announcements to 3.
    orderBy: { date: "desc" }, // Order announcements by date in descending order.
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null }, // Include announcements with no class assigned.
          { class: roleConditions[role as keyof typeof roleConditions] || {} }, // Apply role-based conditions.
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1> {/* Title */}
        <span className="text-xs text-gray-400">View All</span> {/* View All link */}
      </div>

      {/* Announcements List */}
      <div className="flex flex-col gap-4 mt-4">
        {data[0] && (
          <div className="bg-lamaSkyLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[0].title}</h2> {/* Announcement title */}
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[0].date)} {/* Formatted date */}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[0].description}</p> {/* Announcement description */}
          </div>
        )}
        {data[1] && (
          <div className="bg-lamaPurpleLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[1].title}</h2> {/* Announcement title */}
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[1].date)} {/* Formatted date */}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[1].description}</p> {/* Announcement description */}
          </div>
        )}
        {data[2] && (
          <div className="bg-lamaYellowLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[2].title}</h2> {/* Announcement title */}
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[2].date)} {/* Formatted date */}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[2].description}</p> {/* Announcement description */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements; // Exporting the Announcements component as default.