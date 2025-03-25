import FormContainer from "@/components/FormContainer"; // Importing a reusable form container for CRUD operations.
import Pagination from "@/components/Pagination"; // Importing a pagination component for navigating through pages.
import Table from "@/components/Table"; // Importing a reusable table component to display data.
import TableSearch from "@/components/TableSearch"; // Importing a search bar component for filtering table data.
import prisma from "@/lib/prisma"; // Importing Prisma client for database queries.
import { ITEM_PER_PAGE } from "@/lib/settings"; // Importing a constant for the number of items per page.
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client"; // Importing Prisma types for type safety.
import Image from "next/image"; // Importing Next.js Image component for optimized image rendering.
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication to manage user authentication.
import {jwtDecode} from "jwt-decode"; // Importing a library to decode Firebase ID tokens to access custom claims.

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};

type DecodedToken = {
  role?: string; // Define the structure of the decoded token. Add other claims if needed.
  [key: string]: unknown; // Allow additional claims if necessary.
};

const LessonListPage = async ({
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

  const columns = [
    {
      header: "Subject Name", // Column header.
      accessor: "name", // Key to access data for this column.
    },
    {
      header: "Class", // Column header.
      accessor: "class", // Key to access data for this column.
    },
    {
      header: "Teacher", // Column header.
      accessor: "teacher", // Key to access data for this column.
      className: "hidden md:table-cell", // Hides this column on smaller screens.
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions", // Column header.
            accessor: "action", // Key to access data for this column.
          },
        ]
      : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id} // Unique key for each row.
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight" // Styling for the row.
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td> {/* Subject name */}
      <td>{item.class.name}</td> {/* Class name */}
      <td className="hidden md:table-cell">
        {item.teacher.name + " " + item.teacher.surname} {/* Teacher's full name */}
      </td>
      <td>
        <div className="flex items-center gap-2"> {/* Actions column */}
          {role === "admin" && ( // If the user is an admin, show the update and delete buttons.
            <>
              <FormContainer table="lesson" type="update" data={item} /> {/* Update button */}
              <FormContainer table="lesson" type="delete" id={item.id} /> {/* Delete button */}
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams; // Extracting the page number and other query parameters.

  const p = page ? parseInt(page) : 1; // Parsing the page number or defaulting to 1.

  const query: Prisma.LessonWhereInput = {}; // Initializing a query object for filtering lessons.

  if (queryParams) { // Loop through query parameters to build the query object.
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId": // Filter by class ID.
            query.classId = parseInt(value);
            break;
          case "teacherId": // Filter by teacher ID.
            query.teacherId = value;
            break;
          case "search": // Filter by subject or teacher name (case-insensitive).
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([ // Fetching lesson data and total count using Prisma transactions.
    prisma.lesson.findMany({
      where: query, // Applying filters.
      include: {
        subject: { select: { name: true } }, // Include subject name.
        class: { select: { name: true } }, // Include class name.
        teacher: { select: { name: true, surname: true } }, // Include teacher's name and surname.
      },
      take: ITEM_PER_PAGE, // Limit the number of items per page.
      skip: ITEM_PER_PAGE * (p - 1), // Skip items for pagination.
    }),
    prisma.lesson.count({ where: query }), // Count the total number of lessons matching the query.
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0"> {/* Main container */}
      {/* TOP */}
      <div className="flex items-center justify-between"> {/* Header section */}
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1> {/* Page title */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch /> {/* Search bar */}
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} /> {/* Filter button */}
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} /> {/* Sort button */}
            </button>
            {role === "admin" && <FormContainer table="lesson" type="create" />} {/* Create lesson button (admin only) */}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} /> {/* Table displaying lesson data */}
      {/* PAGINATION */}
      <Pagination page={p} count={count} /> {/* Pagination controls */}
    </div>
  );
};

export default LessonListPage; // Exporting the component as default.