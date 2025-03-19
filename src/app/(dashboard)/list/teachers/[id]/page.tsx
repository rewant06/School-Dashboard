import Announcements from "@/components/Announcements"; // Importing the Announcements component to display announcements.
import BigCalendarContainer from "@/components/BigCalendarContainer"; // Importing a container for the teacher's schedule calendar.
import BigCalendar from "@/components/BigCalender"; // Importing the BigCalendar component for displaying schedules.
import FormContainer from "@/components/FormContainer"; // Importing a form container for handling CRUD operations (e.g., update teacher info).
import Performance from "@/components/Performance"; // Importing the Performance component to display teacher performance metrics.
import prisma from "@/lib/prisma"; // Importing Prisma client for database queries.
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication to manage user authentication.
import { jwtDecode } from "jwt-decode"; // Correctly import the named export for decoding JWT tokens
import { Teacher } from "@prisma/client"; // Importing the Teacher type from Prisma for type safety.
import Image from "next/image"; // Importing Next.js Image component for optimized image rendering.
import Link from "next/link"; // Importing Next.js Link component for client-side navigation.
import { notFound } from "next/navigation"; // Importing a function to handle 404 errors.

const SingleTeacherPage = async ({ params: { id } }: { params: { id: string } }) => { // Main component for displaying a single teacher's details.
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const token = await user.getIdToken(); // Get the Firebase ID token for the logged-in user.
  const decodedToken: any = jwtDecode(token); // Decode the token to access custom claims.
  const role = decodedToken.role; // Extract the user's role from the custom claims.

  const teacher: // Defining the type of the teacher object fetched from the database.
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number }; // Including counts for related subjects, lessons, and classes.
      })
    | null = await prisma.teacher.findUnique({ // Fetching a single teacher's details from the database.
    where: { id }, // Filtering by the teacher's ID.
    include: {
      _count: { // Including counts for related entities.
        select: {
          subjects: true, // Count of subjects taught by the teacher.
          lessons: true, // Count of lessons assigned to the teacher.
          classes: true, // Count of classes assigned to the teacher.
        },
      },
    },
  });

  if (!teacher) { // If no teacher is found, return a 404 error.
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row"> {/* Main container for the page layout */}
      {/* LEFT */}
      <div className="w-full xl:w-2/3"> {/* Left section for teacher details and schedule */}
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4"> {/* Top section for teacher info and small cards */}
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4"> {/* Card displaying teacher's basic info */}
            <div className="w-1/3">
              <Image
                src={teacher.img || "/noAvatar.png"} // Display teacher's image or a default avatar.
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover" // Styling for the image.
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name + " " + teacher.surname} {/* Display teacher's full name */}
                </h1>
                {role === "admin" && ( // If the user is an admin, show the update button.
                  <FormContainer table="teacher" type="update" data={teacher} /> // Form container for updating teacher info.
                )}
              </div>
              <p className="text-sm text-gray-500">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. {/* Placeholder description */}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{teacher.bloodType}</span> {/* Display teacher's blood type */}
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(teacher.birthday)} {/* Display teacher's birthday */}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{teacher.email || "-"}</span> {/* Display teacher's email */}
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{teacher.phone || "-"}</span> {/* Display teacher's phone number */}
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap"> {/* Small cards for teacher stats */}
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">90%</h1> {/* Display attendance percentage */}
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.subjects} {/* Display count of subjects */}
                </h1>
                <span className="text-sm text-gray-400">Branches</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.lessons} {/* Display count of lessons */}
                </h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.classes} {/* Display count of classes */}
                </h1>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]"> {/* Section for teacher's schedule */}
          <h1>Teacher&apos;s Schedule</h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} /> {/* Display teacher's schedule */}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4"> {/* Right section for shortcuts and additional info */}
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1> {/* Shortcuts section */}
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/classes?supervisorId=${teacher.id}`} // Link to teacher's classes.
            >
              Teacher&apos;s Classes
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/students?teacherId=${teacher.id}`} // Link to teacher's students.
            >
              Teacher&apos;s Students
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/lessons?teacherId=${teacher.id}`} // Link to teacher's lessons.
            >
              Teacher&apos;s Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?teacherId=${teacher.id}`} // Link to teacher's exams.
            >
              Teacher&apos;s Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/assignments?teacherId=${teacher.id}`} // Link to teacher's assignments.
            >
              Teacher&apos;s Assignments
            </Link>
          </div>
        </div>
        <Performance /> {/* Display teacher's performance */}
        <Announcements /> {/* Display announcements */}
      </div>
    </div>
  );
};

export default SingleTeacherPage; // Exporting the component as default.