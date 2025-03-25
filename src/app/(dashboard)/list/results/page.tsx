import FormContainer from "@/components/FormContainer"; // Importing a reusable form container for CRUD operations.
import Pagination from "@/components/Pagination"; // Importing a pagination component for navigating through pages.
import Table from "@/components/Table"; // Importing a reusable table component to display data.
import TableSearch from "@/components/TableSearch"; // Importing a search bar component for filtering table data.
import prisma from "@/lib/prisma"; // Importing Prisma client for database queries.
import { ITEM_PER_PAGE } from "@/lib/settings"; // Importing a constant for the number of items per page.
import { Prisma } from "@prisma/client"; // Importing Prisma types for type safety.
import Image from "next/image"; // Importing Next.js Image component for optimized image rendering.

import { getAuth } from "firebase/auth"; // Importing Firebase Authentication to manage user authentication.
import {jwtDecode} from "jwt-decode"; // Importing a library to decode Firebase ID tokens to access custom claims.

type ResultList = {
  id: number; // Unique ID of the result.
  title: string; // Title of the exam or assignment.
  studentName: string; // Student's first name.
  studentSurname: string; // Student's last name.
  teacherName: string; // Teacher's first name.
  teacherSurname: string; // Teacher's last name.
  score: number; // Score achieved by the student.
  className: string; // Name of the class.
  startTime: Date; // Start time of the exam or assignment.
};

type DecodedToken = {
  role?: string; // Define the structure of the decoded token. Add other claims if needed.
  [key: string]: unknown; // Allow additional claims if necessary.
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }; // Defining the type for search parameters.
}) => {
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const token = await user.getIdToken(); // Get the Firebase ID token for the logged-in user.
  const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token); // Decode the token to access custom claims.
  const role = decodedToken.role; // Extract the user's role from the custom claims.
  const currentUserId = user.uid; // Get the user's unique ID from Firebase.

  const columns = [
    {
      header: "Title", // Column header for the title of the exam or assignment.
      accessor: "title", // Key to access the title data.
    },
    {
      header: "Student", // Column header for the student's name.
      accessor: "student", // Key to access the student's name data.
    },
    {
      header: "Score", // Column header for the score.
      accessor: "score", // Key to access the score data.
      className: "hidden md:table-cell", // Hides this column on smaller screens.
    },
    {
      header: "Teacher", // Column header for the teacher's name.
      accessor: "teacher", // Key to access the teacher's name data.
      className: "hidden md:table-cell", // Hides this column on smaller screens.
    },
    {
      header: "Class", // Column header for the class name.
      accessor: "class", // Key to access the class name data.
      className: "hidden md:table-cell", // Hides this column on smaller screens.
    },
    {
      header: "Date", // Column header for the date.
      accessor: "date", // Key to access the date data.
      className: "hidden md:table-cell", // Hides this column on smaller screens.
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions", // Column header for actions (update/delete).
            accessor: "action", // Key to access the actions data.
          },
        ]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id} // Unique key for each row.
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight" // Styling for the row.
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td> {/* Exam or assignment title */}
      <td>{item.studentName + " " + item.studentSurname}</td> {/* Student's full name */}
      <td className="hidden md:table-cell">{item.score}</td> {/* Student's score */}
      <td className="hidden md:table-cell">
        {item.teacherName + " " + item.teacherSurname} {/* Teacher's full name */}
      </td>
      <td className="hidden md:table-cell">{item.className}</td> {/* Class name */}
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)} {/* Formatted date */}
      </td>
      <td>
        <div className="flex items-center gap-2"> {/* Actions column */}
          {(role === "admin" || role === "teacher") && ( // If the user is an admin or teacher, show the update and delete buttons.
            <>
              <FormContainer table="result" type="update" data={item} /> {/* Update button */}
              <FormContainer table="result" type="delete" id={item.id} /> {/* Delete button */}
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams; // Extracting the page number and other query parameters.

  const p = page ? parseInt(page) : 1; // Parsing the page number or defaulting to 1.

  const query: Prisma.ResultWhereInput = {}; // Initializing a query object for filtering results.

  if (queryParams) { // Loop through query parameters to build the query object.
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId": // Filter by student ID.
            query.studentId = value;
            break;
          case "search": // Filter by exam title or student name (case-insensitive).
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break; // Admin has access to all results.
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: currentUserId! } } }, // Filter results by teacher's ID for exams.
        { assignment: { lesson: { teacherId: currentUserId! } } }, // Filter results by teacher's ID for assignments.
      ];
      break;
    case "student":
      query.studentId = currentUserId!; // Filter results by the student's ID.
      break;
    case "parent":
      query.student = {
        parentId: currentUserId!, // Filter results by the parent's ID.
      };
      break;
    default:
      break;
  }

  const [dataRes, count] = await prisma.$transaction([ // Fetching result data and total count using Prisma transactions.
    prisma.result.findMany({
      where: query, // Applying filters.
      include: {
        student: { select: { name: true, surname: true } }, // Include student name and surname.
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } }, // Include class name.
                teacher: { select: { name: true, surname: true } }, // Include teacher's name and surname.
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } }, // Include class name.
                teacher: { select: { name: true, surname: true } }, // Include teacher's name and surname.
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE, // Limit the number of items per page.
      skip: ITEM_PER_PAGE * (p - 1), // Skip items for pagination.
    }),
    prisma.result.count({ where: query }), // Count the total number of results matching the query.
  ]);

  const data = dataRes.map((item) => {
    const assessment = item.exam || item.assignment; // Determine if the result is for an exam or assignment.

    if (!assessment) return null;

    const isExam = "startTime" in assessment; // Check if the assessment is an exam.

    return {
      id: item.id, // Result ID.
      title: assessment.title, // Title of the exam or assignment.
      studentName: item.student.name, // Student's first name.
      studentSurname: item.student.surname, // Student's last name.
      teacherName: assessment.lesson.teacher.name, // Teacher's first name.
      teacherSurname: assessment.lesson.teacher.surname, // Teacher's last name.
      score: item.score, // Student's score.
      className: assessment.lesson.class.name, // Class name.
      startTime: isExam ? assessment.startTime : assessment.startDate, // Start time of the exam or assignment.
    };
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0"> {/* Main container */}
      {/* TOP */}
      <div className="flex items-center justify-between"> {/* Header section */}
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1> {/* Page title */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch /> {/* Search bar */}
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} /> {/* Filter button */}
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} /> {/* Sort button */}
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" /> /* Create result button (admin or teacher only) */
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} /> {/* Table displaying result data */}
      {/* PAGINATION */}
      <Pagination page={p} count={count} /> {/* Pagination controls */}
    </div>
  );
};

export default ResultListPage; // Exporting the component as default.