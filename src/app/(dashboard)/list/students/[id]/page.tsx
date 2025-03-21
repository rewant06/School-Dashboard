import Announcements from "@/components/Announcements"; // Importing the Announcements component to display announcements.
import BigCalendarContainer from "@/components/BigCalendarContainer"; // Importing a container for the student's schedule calendar.
import FormContainer from "@/components/FormContainer"; // Importing a form container for handling CRUD operations (e.g., update student info).
import Performance from "@/components/Performance"; // Importing the Performance component to display student performance metrics.
import StudentAttendanceCard from "@/components/StudentAttendanceCard"; // Importing a component to display the student's attendance card.
import prisma from "@/lib/prisma"; // Importing Prisma client for database queries.
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication to manage user authentication.
import {jwtDecode} from "jwt-decode"; // Importing a library to decode Firebase ID tokens to access custom claims.
import { Class, Student } from "@prisma/client"; // Importing Prisma types for type safety.
import Image from "next/image"; // Importing Next.js Image component for optimized image rendering.
import Link from "next/link"; // Importing Next.js Link component for client-side navigation.
import { notFound } from "next/navigation"; // Importing a function to handle 404 errors.
import { Suspense } from "react"; // Importing Suspense for lazy loading components.

type DecodedToken = {
  role?: string; // Define the structure of the decoded token. Add other claims if needed.
  [key: string]: unknown; // Allow additional claims if necessary.
};

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string }; // Define the type for route parameters.
}) => {
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const token = await user.getIdToken(); // Get the Firebase ID token for the logged-in user.
  const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token); // Decode the token to access custom claims.
  const role = decodedToken.role; // Extract the user's role from the custom claims.

  const student:
    | (Student & {
        class: Class & { _count: { lessons: number } }; // Include related class data and count of lessons.
      })
    | null = await prisma.student.findUnique({
    where: { id }, // Filter by the student's ID.
    include: {
      class: { include: { _count: { select: { lessons: true } } } }, // Include class data and count of lessons.
    },
  });

  if (!student) {
    return notFound(); // Return a 404 error if the student is not found.
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row"> {/* Main container for the page layout */}
      {/* LEFT */}
      <div className="w-full xl:w-2/3"> {/* Left section for student details and schedule */}
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4"> {/* Top section for student info and small cards */}
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4"> {/* Card displaying student's basic info */}
            <div className="w-1/3">
              <Image
                src={student.img || "/noAvatar.png"} // Display student's image or a default avatar.
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover" // Styling for the image.
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name + " " + student.surname} {/* Display student's full name */}
                </h1>
                {role === "admin" && ( // If the user is an admin, show the update button.
                  <FormContainer table="student" type="update" data={student} /> // Form container for updating student info.
                )}
              </div>
              <p className="text-sm text-gray-500">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. {/* Placeholder description */}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{student.bloodType}</span> {/* Display student's blood type */}
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(student.birthday)} {/* Display student's birthday */}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{student.email || "-"}</span> {/* Display student's email */}
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{student.phone || "-"}</span> {/* Display student's phone number */}
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap"> {/* Small cards for student stats */}
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Suspense fallback="loading..."> {/* Lazy load the attendance card */}
                <StudentAttendanceCard id={student.id} /> {/* Display student's attendance card */}
              </Suspense>
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
                  {student.class.name.charAt(0)}th {/* Display student's grade */}
                </h1>
                <span className="text-sm text-gray-400">Grade</span>
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
                  {student.class._count.lessons} {/* Display count of lessons */}
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
                <h1 className="text-xl font-semibold">{student.class.name}</h1> {/* Display student's class */}
                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]"> {/* Section for student's schedule */}
          <h1>Student&apos;s Schedule</h1>
          <BigCalendarContainer type="classId" id={student.class.id} /> {/* Display student's schedule */}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4"> {/* Right section for shortcuts and additional info */}
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1> {/* Shortcuts section */}
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/lessons?classId=${student.class.id}`} // Link to student's lessons.
            >
              Student&apos;s Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/teachers?classId=${student.class.id}`} // Link to student's teachers.
            >
              Student&apos;s Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?classId=${student.class.id}`} // Link to student's exams.
            >
              Student&apos;s Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/assignments?classId=${student.class.id}`} // Link to student's assignments.
            >
              Student&apos;s Assignments
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/results?studentId=${student.id}`} // Link to student's results.
            >
              Student&apos;s Results
            </Link>
          </div>
        </div>
        <Performance /> {/* Display student's performance */}
        <Announcements /> {/* Display announcements */}
      </div>
    </div>
  );
};

export default SingleStudentPage; // Export the SingleStudentPage component as the default export.