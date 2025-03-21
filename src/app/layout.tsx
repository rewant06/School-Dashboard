import type { Metadata } from "next"; // Importing the Metadata type for defining metadata for the app.
import { Inter } from "next/font/google"; // Importing the Inter font from Google Fonts.
import "./globals.css"; // Importing global CSS styles for the app.
import { ToastContainer } from "react-toastify"; // Importing the ToastContainer component for displaying toast notifications.
import "react-toastify/dist/ReactToastify.css"; // Importing the CSS for react-toastify.
import { AuthProvider } from "@/context/AuthContext"; // Importing a custom Firebase Auth context provider.

const inter = Inter({ subsets: ["latin"] }); // Configuring the Inter font with Latin subset.

export const metadata: Metadata = {
  title: "School Dashboard", // Setting the title of the app.
  description: "Next.js School Management System", // Setting the description of the app.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // Defining the type for the children prop as React nodes.
}>) {
  return (
    <AuthProvider> {/* Wrapping the app with the Firebase Auth context provider */}
      <html lang="en"> {/* Setting the language of the HTML document */}
        <body className={inter.className}> {/* Applying the Inter font to the body */}
          {children} {/* Rendering the child components */}
          <ToastContainer position="bottom-right" theme="dark" /> {/* Displaying toast notifications */}
        </body>
      </html>
    </AuthProvider>
  );
}