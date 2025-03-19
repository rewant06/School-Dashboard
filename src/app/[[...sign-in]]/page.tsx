"use client";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase Authentication methods.
import Image from "next/image"; // Import Next.js Image component for optimized image rendering.
import { useRouter } from "next/navigation"; // Import Next.js router for navigation.
import { useState } from "react"; // Import React state management.

type DecodedToken = {
  role?: string; // Define the structure of the decoded token. Add other claims if needed.
};

const LoginPage = () => {
  const [email, setEmail] = useState<string>(""); // State to store the email input.
  const [password, setPassword] = useState<string>(""); // State to store the password input.
  const [error, setError] = useState<string>(""); // State to store any authentication errors.

  const router = useRouter(); // Get the Next.js router instance.

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior.

    const auth = getAuth(); // Get the Firebase Auth instance.

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Sign in the user with email and password.
      const user = userCredential.user; // Get the signed-in user.

      const token = await user.getIdToken(); // Get the Firebase ID token for the logged-in user.
      const decodedToken: DecodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the token to access custom claims.
      const role = decodedToken.role; // Extract the user's role from the custom claims.

      if (role) {
        router.push(`/${role}`); // Redirect the user to their role-specific dashboard.
      }
    } catch (err: unknown) { // Use `unknown` for the error type and narrow it down.
      if (err instanceof Error) {
        setError(err.message); // Set the error message if authentication fails.
      } else {
        setError("An unknown error occurred."); // Handle unexpected error types.
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight"> {/* Main container for the login page */}
      <form
        onSubmit={handleSignIn} // Handle form submission for signing in.
        className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-4"
      >
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} /> {/* Display the logo */}
          SchooLama
        </h1>
        <h2 className="text-gray-400">Sign in to your account</h2>
        {error && <p className="text-sm text-red-400">{error}</p>} {/* Display authentication error if any */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs text-gray-500"> {/* Label for the email input */}
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email} // Bind the email input to the state.
            onChange={(e) => setEmail(e.target.value)} // Update the email state on input change.
            required
            className="p-2 rounded-md ring-1 ring-gray-300"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-xs text-gray-500"> {/* Label for the password input */}
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password} // Bind the password input to the state.
            onChange={(e) => setPassword(e.target.value)} // Update the password state on input change.
            required
            className="p-2 rounded-md ring-1 ring-gray-300"
          />
        </div>
        <button
          type="submit" // Submit the form to trigger the sign-in process.
          className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default LoginPage; // Export the LoginPage component as the default export.