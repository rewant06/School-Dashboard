import { getAuth } from "firebase/auth"; // Import Firebase Authentication to manage user authentication.
import {jwtDecode} from "jwt-decode"; // Import a library to decode Firebase ID tokens to access custom claims.
import Image from "next/image"; // Import Next.js Image component for optimized image rendering.
import Link from "next/link"; // Import Next.js Link component for client-side navigation.

type DecodedToken = {
  role?: string; // Define the structure of the decoded token. Add other claims if needed.
  [key: string]: unknown; // Allow additional claims if necessary.
};

const menuItems = [
  {
    title: "MENU", // Section title for the menu.
    items: [
      {
        icon: "/home.png", // Icon for the menu item.
        label: "Home", // Label for the menu item.
        href: "/", // Link for the menu item.
        visible: ["admin", "teacher", "student", "parent"], // Roles that can see this menu item.
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "OTHER", // Section title for other menu items.
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = async () => {
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const token = await user.getIdToken(); // Get the Firebase ID token for the logged-in user.
  const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token); // Decode the token to access custom claims.
  const role = decodedToken.role; // Extract the user's role from the custom claims.

  return (
    <div className="mt-4 text-sm"> {/* Container for the menu */}
      {menuItems.map((i) => ( // Iterate over the menu sections.
        <div className="flex flex-col gap-2" key={i.title}> {/* Container for each menu section */}
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title} {/* Display the section title */}
          </span>
          {i.items.map((item) => { // Iterate over the menu items in the section.
            if (item.visible.includes(role)) { // Check if the user's role is allowed to see the menu item.
              return (
                <Link
                  href={item.href} // Link to the menu item's destination.
                  key={item.label} // Unique key for the menu item.
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} /> {/* Display the menu item's icon */}
                  <span className="hidden lg:block">{item.label}</span> {/* Display the menu item's label */}
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu; // Export the Menu component as the default export.