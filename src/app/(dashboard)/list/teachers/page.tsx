import FormContainer from "@/components/FormContainer"; // Importing a component for handling forms (e.g., create, delete actions).
import Pagination from "@/components/Pagination"; // Importing a component to handle pagination of the teacher list.
import Table from "@/components/Table"; // Importing a reusable table component to display data.
import TableSearch from "@/components/TableSearch"; // Importing a search bar component for filtering table data.
import prisma from "@/lib/prisma"; // Importing Prisma client for database queries.
import { Class, Prisma, Subject, Teacher } from "@prisma/client"; // Importing Prisma types for type safety.
import Image from "next/image"; // Importing Next.js Image component for optimized image rendering.
import Link from "next/link"; // Importing Next.js Link component for client-side navigation.
import { ITEM_PER_PAGE } from "@/lib/settings"; // Importing a constant for the number of items to display per page.
import { getAuth } from "firebase/auth"; // Importing Firebase Authentication to manage user authentication.
import jwtDecode from "jwt-decode"; // Importing a library to decode Firebase ID tokens to access custom claims.

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] }; // Defining a type that combines Teacher, Subject, and Class data.

const TeacherListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => { // Main component for the teacher list page.
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const token = await user.getIdToken(); // Get the Firebase ID token for the logged-in user.
  const decodedToken: any = jwtDecode(token); // Decode the token to access custom claims.
  const role = decodedToken.role; // Extract the user's role from the custom claims.

  const columns = [ // Defining the table columns.
    {
      header: "Info", // Column header.
      accessor: "info", // Key to access data for this column.
    },
    {
      header: "Teacher ID", // Column header.
      accessor: "teacherId", // Key to access data for this column.
      className: "hidden md:table-cell", // Hides this column on smaller screens.
    },
    {
      header: "Subjects", // Column header.
      accessor: "subjects", // Key to access data for this column.
      className: "hidden md:table-cell", // Hides this column on smaller screens.
    },
    {
      header: "Classes", // Column header.
      accessor: "classes", // Key to access data for this column.
      className: "hidden md:table-cell", // Hides this column on smaller screens.
    },
    {
      header: "Phone", // Column header.
      accessor: "phone", // Key to access data for this column.
      className: "hidden lg:table-cell", // Hides this column on smaller screens.
    },
    {
      header: "Address", // Column header.
      accessor: "address", // Key to access data for this column.
      className: "hidden lg:table-cell", // Hides this column on smaller screens.
    },
    ...(role === "admin" // If the user is an admin, add an "Actions" column.
      ? [
          {
            header: "Actions", // Column header.
            accessor: "action", // Key to access data for this column.
          },
        ]
      : []),
  ];

  const renderRow = (item: TeacherList) => ( // Function to render each row of the table.
    <tr
      key={item.id} // Unique key for each row.
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight" // Styling for the row.
    >
      <td className="flex items-center gap-4 p-4"> {/* Cell for teacher info */}
        <Image
          src={item.img || "/noAvatar.png"} // Display teacher's image or a default avatar.
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover" // Styling for the image.
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3> {/* Teacher's name */}
          <p className="text-xs text-gray-500">{item?.email}</p> {/* Teacher's email */}
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td> {/* Teacher's username */}
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(",")} {/* List of subjects taught by the teacher */}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((classItem) => classItem.name).join(",")} {/* List of classes assigned to the teacher */}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td> {/* Teacher's phone number */}
      <td className="hidden md:table-cell">{item.address}</td> {/* Teacher's address */}
      <td>
        <div className="flex items-center gap-2"> {/* Actions column */}
          <Link href={`/list/teachers/${item.id}`}> {/* Link to view teacher details */}
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} /> {/* View button */}
            </button>
          </Link>
          {role === "admin" && ( // If the user is an admin, show the delete button.
            <FormContainer table="teacher" type="delete" id={item.id} /> // Form container for delete action.
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams; // Extracting the page number and other query parameters.

  const p = page ? parseInt(page) : 1; // Parsing the page number or defaulting to 1.

  const query: Prisma.TeacherWhereInput = {}; // Initializing a query object for filtering teachers.

  if (queryParams) { // Loop through query parameters to build the query object.
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId": // Filter by class ID.
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
          case "search": // Filter by teacher name (case-insensitive).
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([ // Fetching teacher data and total count using Prisma transactions.
    prisma.teacher.findMany({
      where: query, // Applying filters.
      include: {
        subjects: true, // Include related subjects.
        classes: true, // Include related classes.
      },
      take: ITEM_PER_PAGE, // Limit the number of items per page.
      skip: ITEM_PER_PAGE * (p - 1), // Skip items for pagination.
    }),
    prisma.teacher.count({ where: query }), // Count the total number of teachers matching the query.
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0"> {/* Main container */}
      {/* TOP */}
      <div className="flex items-center justify-between"> {/* Header section */}
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1> {/* Page title */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch /> {/* Search bar */}
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} /> {/* Filter button */}
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} /> {/* Sort button */}
            </button>
            {role === "admin" && (
              <FormContainer table="teacher" type="create" /> 
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} /> {/* Table displaying teacher data */}
      {/* PAGINATION */}
      <Pagination page={p} count={count} /> {/* Pagination controls */}
    </div>
  );
};

export default TeacherListPage; // Exporting the component as default.