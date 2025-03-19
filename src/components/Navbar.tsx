import { getAuth } from "firebase/auth"; // Import Firebase Authentication to manage user authentication.
import {jwtDecode} from "jwt-decode"; // Import a library to decode Firebase ID tokens to access custom claims.
import Image from "next/image"; // Import Next.js Image component for optimized image rendering.

type DecodedToken = {
  role?: string; // Define the structure of the decoded token. Add other claims if needed.
  [key: string]: unknown; // Allow additional claims if necessary.
};

const Navbar = async () => {
  const auth = getAuth(); // Get the Firebase Auth instance.
  const user = auth.currentUser; // Get the currently logged-in user.

  if (!user) {
    throw new Error("User not authenticated"); // Throw an error if no user is logged in.
  }

  const token = await user.getIdToken(); // Get the Firebase ID token for the logged-in user.
  const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token); // Decode the token to access custom claims.
  const role = decodedToken.role; // Extract the user's role from the custom claims.

  return (
    <div className="flex items-center justify-between p-4"> {/* Navbar container */}
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} /> {/* Search icon */}
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none" // Search input field
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} /> {/* Message icon */}
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} /> {/* Announcement icon */}
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1 {/* Notification badge */}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{user.displayName || "User"}</span> {/* Display user's name */}
          <span className="text-[10px] text-gray-500 text-right">{role}</span> {/* Display user's role */}
        </div>
        <div
          className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
          onClick={() => auth.signOut()} // Logout button to sign out the user
        >
          <Image src="/logout.png" alt="Logout" width={20} height={20} /> {/* Logout icon */}
        </div>
      </div>
    </div>
  );
};

export default Navbar; // Export the Navbar component as the default export.